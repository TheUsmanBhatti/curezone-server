const expressJwt = require('express-jwt');

function authJwt(){

    const secret = process.env.secret;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        // isRevoked: isRevoked
    }).unless({
        path: [
            // `${api}/users`,
            `${api}/users/signin`,
            `${api}/users/signup`,
            `${api}/users/verifyotp`,
            `${api}/users/forgot-password`,
            `${api}/users/forgotpassword/verifyotp`,
            `${api}/doctors/signin`,
            `${api}/doctors/signup`,
            `${api}/doctors/addinfo`,
            `${api}/doctors/verifyotp`,
            `${api}/doctors/forgot-password`,
            `${api}/doctors/forgotpassword/verifyotp`,
            `${api}/admins/signin`,
            `${api}/admins/signup`,
        ]
    })
}

async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true)
    }

    done();
}

module.exports = authJwt;