const express = require('express');
const router = express.Router();
const { DocCategory } = require('../models/docCategory');

// ================================================  Getting All Categories  =================================================================

router.get(`/`, async (req, res) => {
    try {
        const categoryList = await DocCategory.find()
        res.status(200).send(categoryList);
    } catch (err) {
        res.status(500).json({success: false, message: 'Error in DocCategory Routes (get)', error: err})
    }
})


// ================================================  Getting Single Category with ID  ========================================================

router.get(`/:id`, async (req, res) => {
    try {
        const category = await DocCategory.findById(req.params.id)
        if(!category){
            return res.status(404).json({success: false, message: 'DocCategory Not Found'})
        }
        res.status(200).send(category)
    } catch (err) {
        res.status(500).json({success: false, message: 'Error in DocCategory Routes (get single)', error: err})
    }
})


// ================================================  Inserting New Category  ================================================================

router.post('/', async (req, res) => {
    try {
        const category = new DocCategory({
            name: req.body.name,
            icon: req.body.icon
        })

        const result = await category.save();
        res.status(201).send(result);
    } catch (err) {
        res.status(500).json({success: false, message: 'Error in DocCategory Routes (post)', error: err})
    }
})


// ================================================  Updating Category with ID  =============================================================

router.put('/:id', async (req, res) => {
    try {
        const result = await DocCategory.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            icon: req.body.icon
        }, {new: true})

        if(!result){
            return res.status(404).json({success: false, message: 'DocCategory Not Found'})
        }
        res.status(200).send(result)
    } catch (err) {
        res.status(500).json({success: false, message: 'Error in DocCategory Routes (update)', error: err})
    }
})


// ================================================  Deleting Category with ID  =============================================================

router.delete('/:id', async (req, res) => {
    try {
        const result = await DocCategory.findByIdAndRemove(req.params.id)
        if(!result){
            return res.status(404).json({success: false, message: 'DocCategory Not Found'})
        }
        res.status(200).json({success: true, message: 'DocCategory Deleted'})
    } catch (err) {
        res.status(500).json({success: false, message: 'Error in DocCategory Routes (delete)', error: err})
    }  
})

module.exports = router;