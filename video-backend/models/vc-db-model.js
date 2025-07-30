import User from "./vc-user-model";

class VCBackendUserDB{
    static #dbUrl = process.env.USER_DB_URL;
    static #dbUsername = process.env.USER_DB_USERNAME;
    static #dbUserPass = process.env.USER_DB_PASSWORD;
    static #dbconnection = undefined;
    static async initializeDBConnection(){
        // connect to DB , assign the same ot db connection;
    }
    static async userGet(username, password){
        const userObj = new User(username, password);
        const {id} = userObj;
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                reject("db not initialized yet");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })
        // fetch a uer from the DB
    }
    static async  userSet(username, password){
        // add a user 
        const userObj = new User(username, password);
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                reject("db not initialized yet");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })

    }
    static async closeDBConnetion(){
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                resolve("db not initialized yet hence not closed");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })
    }
}


module.exports = VCBackendUserDB