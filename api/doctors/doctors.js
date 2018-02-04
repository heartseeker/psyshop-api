const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const _ = require('lodash');



// load models
// ==============================================
const Doctor = require('../../models/doctor');
const Qualification = require('../../models/qualification');
const User = require('../../models/user');

// load Middlewares
// ==============================================
const authenticate = require('../middleware/authenticate');


// API login
// ==============================================
router.post('/login', (req, res) => {
    
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    })
    .catch((e) => {
        res.status(401).send();
    });

});

// API logout route
// ==============================================
router.delete('/me/logout', authenticate,  (req, res) => {
    
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    })
    .catch(() => {
        res.status(400).send();
    });

});



// API doctor self route
// ==============================================
router.get('/me', authenticate,  (req, res) => {
    res.send(req.user);
});


// API doctor routes
// ==============================================
router.get('/', (req, res) => {

    Doctor.find().populate('qualifications').then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    })
    
});

// create a doctor
// ==============================================
router.post('/', (req, res) => {

    const userBody = _.pick(req.body, ['email', 'password']);
    const doctorBody = _.pick(req.body.doctor, ['first_name', 'last_name', 'professional_statement', 'practicing_from']);

    const user = new User(userBody);
    user.doctor = doctorBody;
    
    user.save()
        .then(() => {
            return user.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth', token).json(user);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

// update a doctor
// ==============================================
router.put('/me', authenticate , (req, res) => {
    
    User.findTokenAndUpdate(req).then((user) => {
        res.send(user);
    })
    .catch((err) => {
        res.status(400).json(err);
    })

});


// deleting a doctor
// ==============================================
router.delete('/me', (req, res) => {

    // console.log(req.params.id);
    const idUser = mongoose.Types.ObjectId(req.params.id);

    Doctor.delete({ _id: req.params.id }, (err, result) => {
        if (err) {
            res.status(400).json(err);
            return;
        }
        res.status(200).json({msg: 'successfully deleted'});
    });

});

// create doctor qualification
// ==============================================
router.post('/me/qualifications', authenticate , (req, res) => {

    const qualificationBody = _.pick(req.body, ['qualification_name', 'institute_name', 'procurement_year']);

    qualificationBody['_creator'] = req.user._id;
    
    const qualification = new Qualification(qualificationBody);

    qualification.save()
        .then((data) => {
            res.status(200).json(data);
        }, (err) => {
            res.status(400).json(err);
        });

});


// get doctor qualification
// ==============================================
router.get('/me/qualifications', authenticate , (req, res) => {

    Qualification.find({
        _creator: req.user._id
    })
    .then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    });

});


// updating doctor qualification
// ==============================================
router.put('/me/qualifications/:qid', authenticate, (req, res) => {

    const { qid } = req.params;

    Qualification.findOneAndUpdate(
        { _creator: req.user._id, _id: qid}, 
        { $set: req.body  },
        { new: true }
    )
    .then((data) => {
        if (!data) {
            res.status(400).json();
            return;
        }
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    });
});


module.exports = router;