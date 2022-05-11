const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    medicines : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
    }],
    advises : [{
        type: String,
    }],
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

prescriptionSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

prescriptionSchema.set('toJSON', {
    virtuals: true,
});

exports.Prescription = mongoose.model('Prescription', prescriptionSchema);