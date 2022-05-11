// =======================================  Importing Libraries  ================================================

const express = require('express');
const router = express.Router();
const { Appointment } = require('../models/appointment');


// =======================================  Getting All Appointments  ===========================================

router.get('/', async (req, res) => {
    try {
        const result = await Appointment.find().populate('user').populate({path: 'doctor', populate: 'category'});

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Appointment Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting Past Appointments  ===========================================

router.get('/past', async (req, res) => {
    try {
        const result = await Appointment.find({ dateOfApt: { $lt: Date.now() } }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': -1 });


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: "Appointment Record is Empty" })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting Today Appointments  ===========================================

router.get('/today', async (req, res) => {
    try {

        const cDate = new Date();

        const curDate = cDate.getDate();
        const curMonth = cDate.getMonth()+1;
        const curYear = cDate.getFullYear();


        const result = await Appointment.find({ $and: [{ dateOfApt: { $gte: new Date(`${curYear}-${curMonth}-${curDate}`) } }, { dateOfApt: { $lt: new Date(`${curYear}-${curMonth}-${curDate + 1}`) } }] }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Appointment Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting UpComing Appointments  ===========================================

router.get('/upcoming', async (req, res) => {
    try {
        const result = await Appointment.find({ dateOfApt: { $gt: Date.now() } }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Appointment Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Posting Appointment  ================================================

router.post('/', async (req, res) => {
    try {
        const insertAppointment = new Appointment({
            user: req.body.user,
            doctor: req.body.doctor,
            dateOfApt: req.body.dateOfApt,
            slotOfApt: req.body.slotOfApt,
        })

        const result = await insertAppointment.save();

        if (!result) {
            res.status(500).json({ success: false, message: 'Appointment Not Inserted' })
        }
        res.status(201).send(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointments Router (post)', error: err })
    }
})


// =======================================  Getting Appointment of User ========================================

router.get(`/userApt/:userid`, async (req, res) => {
    const userAptList = await Appointment.find({ user: req.params.userid }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': -1 });

    if (!userAptList) {
        res.status(500).json({ success: false })
    }
    res.send(userAptList);
})


// =======================================  Getting Past Appointments of Users  ===========================================

router.get('/userApt/past/:userid', async (req, res) => {
    try {
        const result = await Appointment.find({ $and: [{ dateOfApt: { $lt: Date.now() } }, { user: req.params.userid }] }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': -1 });


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: "You Don't have any Previous Appointment" })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting Today Appointments of Users  ===========================================

router.get('/userApt/today/:userid', async (req, res) => {
    try {

        const cDate = new Date();

        const curDate = cDate.getDate();
        const curMonth = cDate.getMonth()+1;
        const curYear = cDate.getFullYear();

        const curHour = cDate.getHours();
        const curMin = cDate.getMinutes();
        const curSec = cDate.getSeconds();


        const result = await Appointment.find({
            $and:
                [{
                    $and:
                        [{ dateOfApt: { $gte: new Date(`${curYear}-${curMonth}-${curDate}-${curHour-1}:${curMin}:${curSec}`) } },
                        { dateOfApt: { $lt: new Date(`${curYear}-${curMonth}-${curDate + 1}`) } }
                        ]
                },
                { user: req.params.userid }]
        })
            .populate('user')
            .populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'You have no Appointment for Today' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
        console.log(err);
    }
})


// =======================================  Getting UpComing Appointments of Users  ===========================================

router.get('/userApt/upcoming/:userid', async (req, res) => {
    try {
        const result = await Appointment.find({$and: [{ dateOfApt: { $gt: Date.now() }}, { user: req.params.userid }]}).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: "You don't have andy upcoming Appointments" })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting Appointment of Doctor ======================================

router.get(`/doctorApt/:doctorid`, async (req, res) => {
    const doctorAptList = await Appointment.find({ doctor: req.params.doctorid }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOrdered': -1 });

    if (!doctorAptList) {
        res.status(500).json({ success: false })
    }
    res.send(doctorAptList);
})


// =======================================  Getting Past Appointments of Doctors  ===========================================

router.get('/doctorApt/past/:doctorid', async (req, res) => {
    try {
        const result = await Appointment.find({ $and: [{ dateOfApt: { $lt: Date.now() } }, { doctor: req.params.doctorid }] }).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': -1 });


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: "You Don't have any Previous Appointment" })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting Today Appointments of Doctors  ===========================================

router.get('/doctorApt/today/:doctorid', async (req, res) => {
    try {

        const cDate = new Date();

        const curDate = cDate.getDate();
        const curMonth = cDate.getMonth()+1;
        const curYear = cDate.getFullYear();

        const curHour = cDate.getHours();
        const curMin = cDate.getMinutes();
        const curSec = cDate.getSeconds();


        const result = await Appointment.find({
            $and:
                [{
                    $and:
                        [{ dateOfApt: { $gte: new Date(`${curYear}-${curMonth}-${curDate}-${curHour-1}:${curMin}:${curSec}`) } },
                        { dateOfApt: { $lt: new Date(`${curYear}-${curMonth}-${curDate + 1}`) } }
                        ]
                },
                { doctor: req.params.doctorid }]
        })
            .populate('user')
            .populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });;

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'You have no Appointment for Today' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})


// =======================================  Getting UpComing Appointments of Doctors  ===========================================

router.get('/doctorApt/upcoming/:doctorid', async (req, res) => {
    try {
        const result = await Appointment.find({$and: [{ dateOfApt: { $gt: Date.now() }}, { doctor: req.params.doctorid }]}).populate('user').populate({path: 'doctor', populate: 'category'}).sort({ 'dateOfApt': 1 });;


        if (result.length == 0) {
            return res.status(404).json({ success: false, message: "You don't have any upcoming appointments" })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Appointment Routes (get)', error: err })
    }
})



module.exports = router;