// =======================================  Importing Libraries  ================================================

const express = require('express');
const router = express.Router();
const { Review } = require('../models/review');
const { Doctor } = require('../models/doctor');


// =======================================  Getting All Reviews  ===========================================

router.get('/', async (req, res) => {
    try {
        const result = await Review.find()
            .populate('user', 'name')
            .populate('doctor', 'name')

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Review Record is Empty' })
        }

        res.status(200).send(result)
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Review Routes (get)', error: err })
    }
})


// =======================================  Getting Total Rating  ===========================================

router.get('/total-rating/:docId', async (req, res) => {
    try {
        const result = await Review.find({ doctor: req.params.docId }).select('rating')
        const doctor = await Doctor.findById(req.params.docId)

        const totalReviews = await Review.find({ doctor: req.params.docId }).countDocuments()

        if (result.length == 0) {
            return res.status(404).json({ success: false, message: 'Review Record is Empty' })
        }

        var finalArray = result.map(function (obj) {
            return obj.rating;
        });

        const sum = finalArray.reduce((partialSum, a) => partialSum + a, 0);
        
        const totalRating = sum/totalReviews

        doctor.rating = totalRating;
        await doctor.save()
        
        res.status(200).json({success: true, rating: totalRating})
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Review Routes (get)', error: err })
    }
})


// =======================================  Posting Review  ================================================

router.post('/', async (req, res) => {
    try {

        const insertReview = new Review({
            user: req.body.user,
            doctor: req.body.doctor,
            rating: req.body.rating,
            reviews: req.body.reviews
        })

        const result = await insertReview.save();

        if (!result) {
            res.status(500).json({ success: false, message: 'Review Not Inserted' })
        }
        res.status(201).send(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error in Reviews Router (post)', error: err })
    }
})


// =======================================  Getting Review of User ========================================

router.get(`/:doctorid`, async (req, res) => {
    const doctorReviewList = await Review.find({ doctor: req.params.doctorid })
        .populate('user', 'name avatar')
        .populate('doctor', 'name')
        .sort({ 'dateCreated': -1 });

    if (!doctorReviewList) {
        res.status(500).json({ success: false, message: 'No reviews to show' })
    }
    res.send(doctorReviewList);
})


module.exports = router;