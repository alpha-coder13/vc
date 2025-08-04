const jwt = require('jsonwebtoken');
const VCBackendUserDB = require('../models/vc-db-model');

class JWThandlers{
    static isValidJWT(value){
        // handle JWT values
        // should return a promise

        return new Promise((resolve, reject)=>{
            jwt.verify(value,)
        })
    }
}


module.exports = JWThandlers;