const mongoose = require('mongoose');

const verificationTokenSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
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

exports.VerificationToken1 = mongoose.model('VerificationToken1', verificationTokenSchema);