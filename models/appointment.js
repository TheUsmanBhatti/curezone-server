const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    dateOfApt:{
        type: Date,
    },
    slotOfApt:{
        type: String
    },
    dateAptCreated:{
        type: Date,
        default: Date.now
    }
})

appointmentSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

appointmentSchema.set('toJSON', {
    virtuals: true,
});

exports.Appointment = mongoose.model('Appointment', appointmentSchema);