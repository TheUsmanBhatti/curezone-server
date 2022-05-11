const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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
    otpVerified: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default: 'user'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);