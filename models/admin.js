const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
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
        type: String,
        default: ''
    },
    phoneNo: {
        type: String,
        default: ''
    },
    role:{
        type: String,
        default: 'admin'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

adminSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

adminSchema.set('toJSON', {
    virtuals: true,
});

exports.Admin = mongoose.model('Admin', adminSchema);