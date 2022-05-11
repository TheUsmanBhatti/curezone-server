const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema({
    mName: {
        type: String,
    },
    strength: {
        type: String,
    },
    dosage: {
        type: String,
    },
    instruction: {
        type: String,
    }
})

medicineSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

medicineSchema.set('toJSON', {
    virtuals: true,
});

exports.Medicine = mongoose.model('Medicine', medicineSchema);