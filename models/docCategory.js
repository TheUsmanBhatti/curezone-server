const mongoose = require('mongoose');

const docCategorySchema = mongoose.Schema({
    name: {
         type: String,
         required: true
    },
    icon: {
        type: String,
    }
})

docCategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
})

docCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.DocCategory = mongoose.model('DocCategory', docCategorySchema);