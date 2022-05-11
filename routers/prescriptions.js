// =======================================  Importing Libraries  ================================================

const express = require('express');
const router = express.Router();
const { Prescription } = require('../models/prescription');
const { Medicine } = require('../models/medicine')


// =======================================  Getting All Prescriptions  ===========================================

router.get('/', async (req, res) => {
    try {
        const result = await Prescription.find()
        .populate('user', 'name')
        .populate('doctor', 'name')
        .populate({
            path: 'medicines'});

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Prescription Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Prescription Routes (get)', error: err })
    }
})


// =======================================  Posting Prescription  ================================================

router.post('/', async (req, res) => {
    try {

        const medicinesIds = Promise.all(req.body.medicines.map(async medicineItem => {
            let newMedicineItem = new Medicine({
                mName: medicineItem.mName,
                strength: medicineItem.strength,
                dosage: medicineItem.dosage,
                instruction: medicineItem.instruction
            })

            newMedicineItem = await newMedicineItem.save();

            return newMedicineItem._id;
        }))

        const medicinesIdsResolved = await medicinesIds;

        const insertPrescription = new Prescription({
            user: req.body.user,
            doctor: req.body.doctor,
            medicines: medicinesIdsResolved,
            advises: req.body.advises
        })

        const result = await insertPrescription.save();

        if (!result) {
            res.status(500).json({ success: false, message: 'Prescription Not Inserted' })
        }
        res.status(201).send(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Prescriptions Router (post)', error: err })
    }
})


// =======================================  Getting Prescription of User ========================================

router.get(`/userPre/:userid`, async (req, res) => {
    const userPreList = await Prescription.find({ user: req.params.userid }).populate('user', 'name')
    .populate('doctor', 'name avatar category')
    .populate({path: 'doctor', populate: 'category' })
    .populate({
        path: 'medicines'})
    .sort({ 'dateCreated': -1 });

    if (!userPreList) {
        res.status(500).json({ success: false })
    }
    res.send(userPreList);
})


module.exports = router;