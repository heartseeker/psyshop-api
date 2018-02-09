const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const _ = require('lodash');



// load models
// ==============================================
const Doctor = require('../../models/doctor');
const Qualification = require('../../models/qualification');
const User = require('../../models/user');
const Affiliation = require('../../models/affiliation');
const Specialization = require('../../models/specialization');

// load Middlewares
// ==============================================
const authenticate = require('../middleware/authenticate');

// Utilities
// ==============================================
const crud = require('../../utilities/crud');

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
    res.status(200).json(req.user);
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
    const doctorBody = _.pick(req.body.doctor, ['first_name', 'last_name', 'professional_statement', 'practicing_from', 'is_guest']);

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
router.delete('/me', authenticate, (req, res) => {

    User.delete({ _id: req.user._id }, (err, result) => {
        if (err) {
            res.status(400).json(err);
            return;
        }
        res.status(200).json({msg: 'successfully deleted'});
    });

});

//============================================================================================>
// Qualifications
//============================================================================================>

// create doctor qualification
// ==============================================
router.post('/me/qualifications', authenticate , (req, res) => {

    const qualificationBody = _.pick(req.body, ['qualification_name', 'institute_name', 'procurement_year']);

    qualificationBody['_creator'] = req.user._id;
    
    const qualification = new Qualification(qualificationBody);

    qualification.save()
        .then((data) => {
            // update qualifications in user model
            User.update(
                { _id: req.user._id },
                { $push: { 'doctor.qualifications': data._id } },
                { 'upsert': true },
            )
            .then((data) => {
                res.status(200).json(data);
            });
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

// deleting qualifications
// ==============================================
router.delete('/me/qualifications/:qid', authenticate, (req, res) => {

    const { qid } = req.params;

    Qualification.delete({ _creator: req.user._id, _id: qid }, (err, result) => {
        if (err) {
            res.status(400).json(err);
            return;
        }
        res.status(200).json({msg: 'successfully deleted'});
    });

});

//============================================================================================>
// Affiliations
//============================================================================================>


// create affiliation
// ==============================================
router.post('/me/affiliations', authenticate , (req, res) => {

    const reqBody = _.pick(req.body, ['name', 'city', 'country', 'start_date', 'end_date']);

    reqBody['_creator'] = req.user._id;
    
    const model = new Affiliation(reqBody);

    const update = 'doctor.affiliations';

    crud.createUserDocument(model, User, update, req, res);

});


// update affiliation
// ==============================================
router.put('/me/affiliations/:id', authenticate , (req, res) => {
    crud.updateUserDocument(Affiliation, req.body, req.params.id, req, res);
});


// delete affiliation
// ==============================================
router.delete('/me/affiliations/:id', authenticate , (req, res) => {
    crud.deleteUserDocument(Affiliation, req.params.id, req, res);
});


// create specializations
// ==============================================
router.post('/me/specializations', authenticate, (req, res) => {
    
    const specialization_id = req.body.specialization_id;

    // check if specialization exist
    Specialization.findOne({_id: specialization_id})
        .then((count) => {
            
            // check if doctor specialization exist
            User.findOne({
                _id: req.user._id,
                'doctor.specializations': specialization_id
            }).then((data) => {
                if (data) {
                    return Promise.reject();
                }
                // insert specialization in doctor
                User.update(
                    { _id: req.user._id },
                    { $push: { 'doctor.specializations': specialization_id } },
                    { 'upsert': true },
                )
                .then((data) => {
                    res.status(200).json(data);
                });
            })
            .catch((err) => {
                res.status(400).json();
            });

            

        }, (err) => {
            res.status(400).json(err);
        }); 

});



// Admin API (Temporarily in here)
// create affiliation
// ==============================================
router.post('/specializations', (req, res) => {
    
    const special = new Specialization({
        specialization_name: req.body.specialization_name
    });

    special.save()
        .then((data) => {
            res.status(200).json(data);
        }, (err) => {
            res.status(400).json(err);
        })

});

module.exports = router;