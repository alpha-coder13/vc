const jwt = require('jsonwebtoken');
const VCBackendUserDB = require('../models/vc-db-model');
const RequestParser = require('./request-parsers');
// const JWThandlers = require('./utils/jwt-handlers');
class JWThandlers{
    static isValidJWT(value){
        // handle JWT values
        // should return a promise

        return new Promise((resolve, reject)=>{
            jwt.verify(value,)
        })
    }
}



function handleAuthMiddleware(req){
    var cookieObj = RequestParser.cookieParsertoObj(req.headers.cookie);
    // console.log(cookieObj);

    var JWT =  cookieObj['vc_iss'];

    if(JWT == '' || JWT== undefined){
        // handle the error , returna  response header with redload rule
    }else{
        JWThandlers.isValidJWT(JWT) // will return a promise
    }
    var cookieStr =  RequestParser.cookieParsertoStr(cookieObj);
    // console.log(cookieStr);
    return true
}

module.exports = JWThandlers;