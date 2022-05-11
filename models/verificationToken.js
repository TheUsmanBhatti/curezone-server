const mongoose = require('mongoose');

const verificationTokenSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
})

verificationTokenSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

verificationTokenSchema.set('toJSON', {
    virtuals: true,
});

exports.VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);