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

// update a doctor
// ==============================================
router.put('/:id', (req, res) => {

    Doctor.findOne({_id: req.params.id}).then((data) => {
        data.first_name = req.body.first_name;
        data.last_name = req.body.last_name;
        data.professional_statement = req.body.professional_statement;
        data.practicing_from = req.body.practicing_from;

        data.save().then((updatedData) => {
            res.status(200).json(updatedData);
        }, (err) => {
            res.status(400).json(err);
        });

    }, (err) => {
        res.status(400).json(err);
    })

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

// deleting a doctor
// ==============================================
router.delete('/:id', (req, res) => {

    Doctor.deleteOne({_id: req.params.id}).then((data) => {
        res.status(200).json({msg: 'successfully deleted'});
    }, (err) => {
        res.status(400).json(err);
    });
    
});

module.exports = router;