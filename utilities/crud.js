module.exports = {

    createUserDocument(saveClass, updateClass, update, req, res) {
        saveClass.save()
        .then((data) => {
            // update qualifications in user model
            updateClass.update(
                { _id: req.user._id },
                { $push: { [update]: data._id } },
                { upsert: true, runValidators: true },
            )
            .then((data) => {
                res.status(200).json(data);
            });
        }, (err) => {
            res.status(400).json(err);
        });
    },

    updateUserDocument(saveClass, body, id, req, res) {
        saveClass.findOneAndUpdate(
            { _creator: req.user._id, _id: id}, 
            { $set: body  },
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
    },

    deleteUserDocument(saveClass, id, req, res) {
        saveClass.delete({ _creator: req.user._id, _id: id }, (err, result) => {
            if (err) {
                res.status(400).json(err);
                return;
            }
            res.status(200).json({msg: 'successfully deleted'});
        });
    }

}