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
const Office = require('../../models/office');

// load Schemas
const OfficeAvailability = require('../../models/subdoc/availabilities');

// load Middlewares
// ==============================================
const authenticate = require('../middleware/authenticate');

// Utilities
// ==============================================
const crud = require('../../utilities/crud');




// ==============================================
// PUBLIC API's
// ==============================================

// API doctor routes
// ==============================================
router.get('/', (req, res) => {

    const doctors = [];

    User.find()
        .populate('doctor.qualifications')
        .populate('doctor.specializations')
        .populate({
            path: 'doctor.affiliations',
            populate: { path: 'offices' }
        })
        .then((data) => {
            const p = data.map(user => {
                if (user.doctor) {
                    doctors.push(user);
                }
            })

            Promise.all(p).then(() => {
                res.status(200).json(doctors);
            })
            
        }, (err) => {
            res.status(400).json(err);
        })
    
});


// API getting specific doctor
// ==============================================
router.get('/:id', (req, res) => {

    User.findOne({
        _id: req.params.id
    })
        .populate('doctor.qualifications')
        .populate('doctor.specializations')
        .populate({
            path: 'doctor.affiliations',
            populate: { path: 'offices' }
        })
        .then((data) => {

            if (!data && data.doctor) {
                res.status(400).json();
                return;
            }

            res.status(200).json(data);

        }, (err) => {
            res.status(400).json(err);
        })
    
});





// ==============================================
// PRIVATE API's
// ==============================================

// API login
// ==============================================
router.post('/login', (req, res) => {
    
    User.findByCredentials(req.body.email, req.body.password, req).then((user) => {
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


// get specific doctor qualification
// ==============================================
router.get('/me/qualifications/:id', authenticate , (req, res) => {

    Qualification.findOne({
        _creator: req.user._id,
        _id: req.params.id
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

// get affiliation
// ==============================================
router.get('/me/affiliations', authenticate , (req, res) => {

    Affiliation.findOne({
        _creator: req.user._id 
    })
    .populate('offices')
    .then((data) => {
        res.status(200).send(data);
    }, (err) => {
        res.status(400).send(err);
    });


});


// get specific affiliation
// ==============================================
router.get('/me/affiliations/:id', authenticate , (req, res) => {

    Affiliation.findOne({
        _creator: req.user._id,
        _id: req.params.id
    })
    .populate('offices')
    .then((data) => {
        res.status(200).send(data);
    }, (err) => {
        res.status(400).send(err);
    });


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
                    { 'upsert': true, new: true },
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


// update specializations
// ==============================================
router.put('/me/specializations/:id', authenticate , (req, res) => {
    crud.updateUserDocument(Specialization, req.body, req.params.id, req, res);
});


// create office
// ==============================================
router.post('/me/affiliations/:id/offices', authenticate , (req, res) => {

    // check if affiliation exists
    const count = _.findIndex(req.user.doctor.affiliations, function(o) { 
        return o._id == req.params.id; 
    });


    if (count < 0) {
        res.status(400).json();
        return;
    }

    const fields = [
        'time_slot_per_client_in_min',
        'first_consultation_fee',
        'followup_consultation_fee',
        'street_address',
        'city',
        'country',
        'zip'
    ];

    const reqBody = _.pick(req.body, fields);

    reqBody['_creator'] = req.user._id;
    
    const model = new Office(reqBody);

    model.save()
        .then((office) => {

            Affiliation.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { 'offices': office._id } },
                { 'upsert': true, new: true }
            ).then((data) => {
                res.status(200).send(data);
            });

        }, (err) => {
            res.status(400).json(err);
        });

});



// update office
// ==============================================
router.put('/me/offices/:id', authenticate , (req, res) => {
    crud.updateUserDocument(Office, req.body, req.params.id, req, res);
});


// create office availability
// ==============================================
router.post('/me/offices/:id/availabilities', authenticate , (req, res) => {
  
    const fields = [
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'reason_of_unavailability',
    ];

    const reqBody = _.pick(req.body, fields);

    reqBody['_creator'] = req.user._id;

    Office.findOneAndUpdate(
        { _id: req.params.id, _creator: req.user._id},
        { $push: { 'availabilities': reqBody } },
        { 'upsert': true, runValidators: true, new: true }
    ).then((data) => {
        res.status(200).send(data);
    }, (err) => {
        res.status(400).json(err);
    });
    
});


// read office availability
// ==============================================
router.get('/me/offices/:oid/availabilities/:aid', authenticate , (req, res) => {
  
    Office.findOne(
        { '_id': req.params.oid, '_creator': req.user._id, 'availabilities._id': req.params.aid },
    ).then((data) => {
        if (!data) {
            return Promise.reject(); 
        }
        res.status(200).json(data);
    }).catch(err => {
        res.status(400).json(err);
    });
    
});


// update office availability
// ==============================================
router.put('/me/offices/:oid/availabilities/:aid', authenticate , (req, res) => {
  
    const fields = [
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'reason_of_unavailability',
    ];

    const reqBody = _.pick(req.body, fields);

    reqBody['_creator'] = req.user._id;

    Office.findOneAndUpdate(
        { 
            '_id': req.params.oid,
             '_creator': req.user._id, 
             'availabilities._id': req.params.aid
        },
        { $set: { 'availabilities': reqBody } },
        { runValidators: true, new: true }
    ).then((data) => {
        res.status(200).send(data);
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