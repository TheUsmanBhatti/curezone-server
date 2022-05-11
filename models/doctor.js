const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: [true, 'Already have an account on this email']
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    dob: {
        type: Date,
        default: ''
    },
    phoneNo: {
        type: String,
        default: ''
    },
    isFilled: {
        type: Boolean,
        default: false
    },
    about: {
        type: String,
        default: ''
    },
    education: {
        type: String,
        default: ''
    },
    consultationDays: [{
        type: String
    }],
    consultationTime: [{
        type: Date
    }],
    fee : {
        type: String,
        default: ''
    },
    meetingSlots: [{
        type: String
    }],
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocCategory'
    },
    rating:{
        type: Number,
        default: 0
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default: 'doctor'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

doctorSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

doctorSchema.set('toJSON', {
    virtuals: true,
});

exports.Doctor = mongoose.model('Doctor', doctorSchema);