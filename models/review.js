const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
    },
    reviews: {
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

reviewSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

reviewSchema.set('toJSON', {
    virtuals: true,
});

exports.Review = mongoose.model('Review', reviewSchema);