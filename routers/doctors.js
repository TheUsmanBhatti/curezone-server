// =======================================  Importing Libraries  ================================================

const express = require('express');
const router = express.Router();
const { Doctor } = require('../models/doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { VerificationToken1 } = require('../models/verificationToken1');
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

        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage });


// =======================================  Getting All Doctors  ================================================

router.get('/', async (req, res) => {
    try {
        const result = await Doctor.find().populate('category');

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (get)', error: err })
    }
})


// =======================================  Getting Top Rated Doctors  ================================================

router.get('/top-rated', async (req, res) => {
    try {
        const result = await Doctor.find({ rating: { $gte: 4 } }).populate('category');

        if (!result) {
            return res.status(404).json({ success: false, message: 'Top Rated Doctor Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (get)', error: err })
    }
})


// =======================================  Getting All Doctors By Categories  ================================================

router.get('/category/:id', async (req, res) => {
    try {

        const result = await Doctor.find({ category: req.params.id }).populate('category');

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (get)', error: err })
    }
})


// =======================================  Getting Single Doctor by id  =======================================

router.get('/:id', async (req, res) => {
    try {
        const result = await Doctor.findById(req.params.id).populate('category');

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (get)', error: err })
    }
})



// =======================================  Sign Up Doctor  ======================================================

router.post('/signup', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const checkEmail = await Doctor.findOne({ email: req.body.email });
        if (checkEmail) return res.status(400).json({ success: false, message: 'Already have an account on this email' })

        const insertDoctor = new Doctor({
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
        })

        const OTP = generateOTP()
        const verficationToken = new VerificationToken1({
            owner: insertDoctor._id,
            token: OTP
        })

        await verficationToken.save();
        const result = await insertDoctor.save();

        mailTransport().sendMail({
            from: 'curezone01@gmail.com',
            to: insertDoctor.email,
            subject: 'Verify Your Account',
            html: generateEmailtemplate(OTP)
        })


        if (!result) {
            res.status(500).json({ success: false, message: 'Doctor Not Inserted' })
        }
        res.status(201).send(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (post)', error: err })
        console.log(err);
    }
})


// =======================================  Verify OTP of Doctor  ======================================================

router.post('/verifyotp', async (req, res) => {
    try {

        const { ownerId, otp } = req.body
        console.log(req.body)
        if (!ownerId || !otp.trim()) return res.status(400).json({ success: false, message: 'Invalid request, missing parameters!' });

        // if (!isValidObjectId(ownerId)) return res.status(400).send('Invalid Doctor Id!');

        const doctor = await Doctor.findById(ownerId)
        if (!doctor) return res.status(400).send('Sorry, Doctor Not Found');

        if (doctor.otpVerified) return res.status(400).json({ success: false, message: 'The Account is Already Verified' })

        const token = await VerificationToken1.findOne({ owner: doctor._id })
        if (!token) return res.status(400).json({ success: false, message: 'Sorry, Doctor Not Found' })


        const verifyOTP = await VerificationToken1.findOne({ owner: ownerId, token: otp })
        if (!verifyOTP) return res.status(400).json({ success: false, message: 'Please Enter Valid OTP' })

        doctor.otpVerified = true;

        await VerificationToken1.findByIdAndDelete(token._id);
        await doctor.save()

        mailTransport().sendMail({
            from: "curezone01@gmail.com",
            to: doctor.email,
            subject: "Your Account is Verified",
            html: `<h1>Your Account is successfully verified</h1>`
        });

        res.json({ success: true, message: 'Your Email is Verified' })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Verify OTP Router (post)', error: err })
    }
})


// =======================================  Add Info of Doctor  =================================================

router.put('/addinfo/:id', async (req, res) => {
    // router.put('/addinfo/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(400).send('Invalid Doctor!');

        // console.log(req.body);
        // console.log(req.body._parts[0]);
        // console.log(req.body._parts[1][1]);



        // const fileName = req.file.filename;
        // const fileName = req.body._parts[0].uri;
        // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        // const file = req.file;
        // if (!file) return res.status(400).send('No image in the request');

        const result = await Doctor.findByIdAndUpdate(req.params.id, {
            // avatar: `${basePath}${fileName}`,
            name: req.body._parts[1][1],
            gender: req.body._parts[2][1],
            dob: req.body._parts[3][1],
            phoneNo: req.body._parts[4][1],
            isFilled: true
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (put)', error: err })
        console.log(err);
    }
})


// =======================================  Add Info of Doctor  =================================================


router.put('/uploadImage/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(400).send('Invalid Doctor!');

        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');

        const result = await Doctor.findByIdAndUpdate(req.params.id, {
            avatar: `${basePath}${fileName}`,
            isFilled: true
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (put)', error: err })
        console.log(err);
    }
})


// =======================================  Add About Section of Doctor  =================================================

router.put('/about/:id', async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(400).send('Invalid Doctor!');


        const result = await Doctor.findByIdAndUpdate(req.params.id, {
            about: req.body.about,
            education: req.body.education,
            consultationDays: req.body.consultationDays,
            consultationTime: req.body.consultationTime,
            fee: req.body.fee,
            meetingSlots: req.body.meetingSlots,
            category: req.body.category
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (put)', error: err })
    }
})


// =======================================  Sign In Doctor  =====================================================

router.post(`/signin`, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ email: req.body.email });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }

        if (doctor && bcrypt.compareSync(req.body.password, doctor.passwordHash)) {
            const secret = process.env.secret;

            const token = jwt.sign(
                {
                    userId: doctor.id,
                    role: doctor.role
                },
                secret,
                // {expiresIn: '1d'}
            )
            res.status(200).send({ doctor: doctor.email, token: token, isFilled: doctor.isFilled });

        }
        else {
            res.status(400).send({ message: 'Wrong Password' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (delete)', error: err })
    }
})


// =======================================  Update Doctor by Id  =================================================

router.put('/update-info/:id', uploadOptions.single('avatar'), async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(400).send('Invalid Doctor!');

        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');


        const result = await Doctor.findByIdAndUpdate(req.params.id, {
            avatar: `${basePath}${fileName}`,
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            phoneNo: req.body.phoneNo,
            isFilled: true
        }, { new: true })

        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }
        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (put)', error: err })
    }
})


// =======================================  Update Doctor Password by Id  =================================================

router.put('/update-password/:id', async (req, res) => {
    try {

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(400).send('Invalid Doctor!');

        // const result = undefined;

        if (doctor && bcrypt.compareSync(req.body.oldPassword, doctor.passwordHash)) {
            var result = await Doctor.findByIdAndUpdate(req.params.id, {
                passwordHash: bcrypt.hashSync(req.body.newPassword, 10),
            }, { new: true })
        }
        else {
            res.status(400).send({ success: false, message: 'Wrong Password' });
        }


        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }

        res.status(200).json({ message: 'Password Changed Successfully', success: true })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (put)', error: err })
        console.log(err);
    }
})


// =======================================  Forgot Password  ======================================================

router.post('/forgot-password', async (req, res) => {
    try {

        const checkEmail = await Doctor.findOne({ email: req.body.email });

        if (!checkEmail) return res.status(400).json({ success: false, message: 'Invalid Email' })


        const OTP = generateOTP()
        const verficationToken = new VerificationToken1({
            owner: checkEmail._id,
            token: OTP
        })

        await verficationToken.save();
        // const result = await insertDoctor.save();

        mailTransport().sendMail({
            from: 'curezone01@gmail.com',
            to: checkEmail.email,
            subject: 'Verify Your Account',
            html: generateEmailtemplate(OTP)
        })

        res.status(201).send(checkEmail);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Router (post)', error: err })
    }
})


// =======================================  Forgot Password Verify OTP of Doctor  ======================================================

router.post('/forgotpassword/verifyotp', async (req, res) => {
    try {

        const { ownerId, otp } = req.body
        console.log(req.body)
        if (!ownerId || !otp.trim()) return res.status(400).send({ success: false, message: 'Invalid request, missing parameters!' });

        // if (!isValidObjectId(ownerId)) return res.status(400).send('Invalid Doctor Id!');

        const doctor = await Doctor.findById(ownerId)
        if (!doctor) return res.status(400).send({ success: false, message: 'Sorry, Doctor Not Found' });


        const token = await VerificationToken1.findOne({ owner: doctor._id })
        if (!token) return res.status(400).send({ success: false, message: 'Sorry, Doctor Not Found' });


        const verifyOTP = await VerificationToken1.findOne({ owner: ownerId, token: otp })
        if (!verifyOTP) return res.status(400).send({ success: false, message: 'Please Enter Valid OTP' });

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

        const result = await Doctor.findByIdAndUpdate(ownerId, {
            passwordHash: bcrypt.hashSync(newPassword, 10),
        }, { new: true })

        await VerificationToken1.findByIdAndDelete(token._id);
        await doctor.save()

        mailTransport().sendMail({
            from: "curezone01@gmail.com",
            to: doctor.email,
            subject: "New Password of Your Account",
            html: `<h1>Your New Password is ${newPassword}</h1>`
        });

        res.json({ success: true, message: `Password has been send to your email ${doctor.email}` })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctors Verify OTP Router (post)', error: err })
    }
})


// =======================================  Delete Doctor by Id  =================================================

router.delete('/:id', async (req, res) => {
    try {
        const result = await Doctor.findByIdAndRemove(req.params.id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'Doctor Not Found' })
        }
        res.status(200).json({ success: true, message: 'Doctor Deleted' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in Doctor Routes (delete)', error: err })
    }
})


// =======================================  Count All Doctors  ===================================================

router.get(`/get/count`, async (req, res) => {
    try {
        const doctorCount = await Doctor.countDocuments()
        res.status(200).send({ doctorCount: doctorCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err })
    }
})

module.exports = router;