const express = require('express');

const router = express.Router();

// load models
// ==============================================
const Doctor = require('../../models/doctor');

// API doctor routes
// ==============================================
router.get('/', (req, res) => {

    Doctor.find().then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    })
    
});

// create a doctor
// ==============================================
router.post('/', (req, res) => {

    const doctor = new Doctor(req.body);

    doctor.save().then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    });

});

// select a doctor
// ==============================================
router.get('/:id', (req, res) => {

    Doctor.findOne({_id: req.params.id}).then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    })
    
});

module.exports = router;