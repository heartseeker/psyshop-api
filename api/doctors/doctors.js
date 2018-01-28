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

    Doctor.findOneAndUpdate(req.params.id, { $set: req.body }, {new: true}).then((data) => {
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

// deleting a doctor
// ==============================================
router.delete('/:id', (req, res) => {

    Doctor.deleteOne({_id: req.params.id}).then((data) => {
        res.status(200).json({msg: 'successfully deleted'});
    }, (err) => {
        res.status(400).json(err);
    });
    
});

// create doctor qualification
// ==============================================
router.post('/:id/qualifications', (req, res) => {

    const doctor = Doctor.findOne({_id: req.params.id}).then((doctor) => {
        doctor.qualifications.push(req.body);
        return doctor.save();
    })
    .then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    });

});


// updating doctor qualification
// ==============================================
router.put('/:id/qualifications/:qid', (req, res) => {

    const { id, qid } = req.params;

    const doctor = Doctor.findOneAndUpdate(
        { '_id': id, 'qualifications._id': qid}, 
        { $set: { 'qualifications.$': req.body } },
        { new: true }
    )
    .then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    });
});


module.exports = router;