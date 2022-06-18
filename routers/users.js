// =======================================  Importing Libraries  ================================================

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { VerificationToken } = require('../models/verificationToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { generateOTP, mailTransport, generateEmailtemplate } = require('../helpers/mail');


// =======================================  Uploading Image  ====================================================

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})


const uploadOptions = multer({ storage: storage });


// =======================================  Getting All Users  =================================================

router.get('/', async (req, res) => {
    try {
        const result = await User.find();

        if (!result) {
            return res.status(404).json({ success: false, message: 'User Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in User Routes (get)', error: err })
    }
})


// =======================================  Getting Single User by id  ========================================

router.get('/:id', async (req, res) => {
    try {
        const result = await User.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in User Routes (get)', error: err })
    }
})


// =======================================  Sign Up User  ======================================================

router.post('/signup', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const checkEmail = await User.findOne({ email: req.body.email });
        if (checkEmail) return res.status(400).json({ success: false, message: 'Already have an account on this email' })

        const insertUser = new User({
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
        })

        const OTP = generateOTP()
        const verficationToken = new VerificationToken({
            owner: insertUser._id,
            token: OTP
        })

        await verficationToken.save();
        const result = await insertUser.save();

        mailTransport().sendMail({
            from: 'curezone01@gmail.com',
            to: insertUser.email,
            subject: 'Verify Your Account',
            html: generateEmailtemplate(OTP)
        })

        if (!result) {
            res.status(500).json({ success: false, message: 'User Not Inserted' })
        }
        res.status(201).send(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Router (post)', error: err })
    }
})


// =======================================  Verify OTP of User  ======================================================

router.post('/verifyotp', async (req, res) => {
    try {

        const { ownerId, otp } = req.body
        console.log(req.body)
        if (!ownerId || !otp.trim()) return res.status(400).json({ success: false, message: 'Invalid request, missing parameters!' });

        // if (!isValidObjectId(ownerId)) return res.status(400).send('Invalid User Id!');

        const user = await User.findById(ownerId)
        if (!user) return res.status(400).send('Sorry, User Not Found');

        if (user.otpVerified) return res.status(400).json({ success: false, message: 'The Account is Already Verified' })

        const token = await VerificationToken.findOne({ owner: user._id })
        if (!token) return res.status(400).json({ success: false, message: 'Sorry, Doctor Not Found' })


        const verifyOTP = await VerificationToken.findOne({ owner: ownerId, token: otp })
        if (!verifyOTP) return res.status(400).json({ success: false, message: 'Please Enter Valid OTP' })

        user.otpVerified = true;

        await VerificationToken.findByIdAndDelete(token._id);
        await user.save()

        mailTransport().sendMail({
            from: "curezone01@gmail.com",
            to: user.email,
            subject: "Your Account is Verified",
            html: `<h1>Your Account is successfully verified</h1>`
        });

        res.json({ success: true, message: 'Your Email is Verified' })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Verify OTP Router (post)', error: err })
    }
})


// =======================================  Add Info of User  =================================================

router.put('/addinfo/:id', async (req, res) => {
// router.put('/addinfo/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Invalid User!');

        // const file = req.file;
        // if (!file) return res.status(400).send('No image in the request');

        // const fileName = file.filename;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        console.log(req.body);

        const result = await User.findByIdAndUpdate(req.params.id, {
            // avatar: `${basePath}${fileName}`,
            name: req.body._parts[1][1],
            gender: req.body._parts[2][1],
            dob: req.body._parts[3][1],
            phoneNo: req.body._parts[4][1],
            isFilled: true
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error in Users Router (put)', error: err })
    }
})


// =======================================  Add Info of User  =================================================

router.put('/uploadImage/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Invalid User!');

        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');

        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
;

        const result = await User.findByIdAndUpdate(req.params.id, {
            avatar: `${basePath}${fileName}`,
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error in Users Router (put)', error: err })
    }
})


// =======================================  Sign In User  =====================================================

router.post(`/signin`, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const secret = process.env.secret;

            const token = jwt.sign(
                {
                    userId: user.id,
                    role: user.role
                },
                secret
            )
            res.status(200).send({ user: user.email, token: token, isFilled: user.isFilled });

        }
        else {
            res.status(400).send({ message: 'Wrong Password' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in User Routes (post)', error: err })
    }
})


// =======================================  Update User Info by Id  =================================================

router.put('/update-info/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Invalid User!');

        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');

        const result = await User.findByIdAndUpdate(req.params.id, {
            avatar: `${basePath}${fileName}`,
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            phoneNo: req.body.phoneNo,
            isFilled: true
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Router (put)', error: err })
    }
})


// =======================================  Update User Password by Id  =================================================

router.put('/update-password/:id', async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Invalid User!');

        // const result = undefined;

        if (user && bcrypt.compareSync(req.body.oldPassword, user.passwordHash)) {
            var result = await User.findByIdAndUpdate(req.params.id, {
                passwordHash: bcrypt.hashSync(req.body.newPassword, 10),
            }, { new: true })
        }
        else {
            res.status(400).send({ success: false, message: 'Wrong Password' });
        }


        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.status(200).json({message: 'Password Changed Successfully', success: true})
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Router (put)', error: err })
        console.log(err);
    }
})


// =======================================  Forgot Password  ======================================================

router.post('/forgot-password', async (req, res) => {
    try {

        const checkEmail = await User.findOne({ email: req.body.email });

        if (!checkEmail) return res.status(400).json({ success: false, message: 'Invalid Email' })


        const OTP = generateOTP()
        const verficationToken = new VerificationToken({
            owner: checkEmail._id,
            token: OTP
        })

        await verficationToken.save();
        // const result = await insertUser.save();

        mailTransport().sendMail({
            from: 'curezone01@gmail.com',
            to: checkEmail.email,
            subject: 'Verify Your Account',
            html: generateEmailtemplate(OTP)
        })

        res.status(201).send(checkEmail);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Router (post)', error: err })
    }
})


// =======================================  Forgot Password Verify OTP of User  ======================================================

router.post('/forgotpassword/verifyotp', async (req, res) => {
    try {

        const { ownerId, otp } = req.body
        console.log(req.body)
        if (!ownerId || !otp.trim()) return res.status(400).send({success: false, message: 'Invalid request, missing parameters!'});

        // if (!isValidObjectId(ownerId)) return res.status(400).send('Invalid User Id!');

        const user = await User.findById(ownerId)
        if (!user) return res.status(400).send({success: false, message: 'Sorry, User Not Found'});


        const token = await VerificationToken.findOne({ owner: user._id })
        if (!token) return res.status(400).send({success: false, message: 'Sorry, User Not Found'});


        const verifyOTP = await VerificationToken.findOne({ owner: ownerId, token: otp })
        if (!verifyOTP) return res.status(400).send({success: false, message: 'Please Enter Valid OTP'});

        const generatePassword = () => {
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }

        const newPassword = generatePassword()

        const result = await User.findByIdAndUpdate(ownerId, {
            passwordHash: bcrypt.hashSync(newPassword, 10),
        }, { new: true })

        await VerificationToken.findByIdAndDelete(token._id);
        await user.save()

        mailTransport().sendMail({
            from: "curezone01@gmail.com",
            to: user.email,
            subject: "New Password of Your Account",
            html: `<h1>Your New Password is ${newPassword}</h1>`
        });

        res.json({ success: true, message: `Password has been send to your email ${user.email}` })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Users Verify OTP Router (post)', error: err })
    }
})


// =======================================  Delete User by Id  =================================================

router.delete('/:id', async (req, res) => {
    try {
        const result = await User.findByIdAndRemove(req.params.id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }
        res.status(200).json({ success: true, message: 'User Deleted' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in User Routes (delete)', error: err })
    }
})


// =======================================  Count All Users  ===================================================

router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments()
        res.status(200).send({ userCount: userCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err })
    }
})

module.exports = router;