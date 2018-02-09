const User = require('../../models/user');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');
        
    User.findByToken(token)
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            const path = req.originalUrl.split('/')[2];


            if (path === 'clients') {
                if (!user.client) {
                    return Promise.reject();
                }
            }

            if (path === 'doctors') {
                if (!user.doctor) {
                    return Promise.reject();
                }
            }

            req.user = user;
            req.token = token;
            next();
        })
        .catch((err) => {
            console.log('NOT AUTHENTICATED');
            res.status(401).send();
        });
}

module.exports = authenticate;