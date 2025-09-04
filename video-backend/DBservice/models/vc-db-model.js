
class VCBackendUserDB{
    static #dbUrl = process.env.USER_DB_URL;
    static #dbUsername = process.env.USER_DB_USERNAME;
    static #dbUserPass = process.env.USER_DB_PASSWORD;
    static dbconnection = undefined;
    static async initializeDBConnection(){
        // connect to DB , assign the same ot db connection;
        if(VCBackendUserDB.dbconnection !== undefined){
            return {messaging : 'DB already initialized', connectionStatus : '204db', status : 'failure'};
        }
        const {Sequelize} = require('sequelize');
        const path =require('path');
        require('dotenv').config(path.resolve(process.cwd(),'.env'));


        VCBackendUserDB.dbconnection = new Sequelize(process.env.MYSQL_DATABASE,
            process.env.MYSQL_USER,
            process.env.MYSQL_PASSWORD,
            {
                host:process.env.MYSQL_HOSTNAME,
                dialect:'mysql',
            }
        ) 
        try{
          await  VCBackendUserDB.dbconnection.authenticate();
           return {messaging :'', connectionStatus : '200db', status : 'success'};
        }catch(err){
            VCBackendUserDB.dbconnection = undefined;
            return {messaging : err.message, stack : err.stack ,connectionStatus : '500db', status : 'failure'};
        }
            
    }

    static async closeDBConnetion(){

            if(VCBackendUserDB.dbconnection == undefined){
                return {messaging :'DB not instanstiated hence unable to close', connectionStatus : '200db', status : 'failure'};
            }
            try{
                await VCBackendUserDB.dbconnection.close();
                VCBackendUserDB.dbconnection = undefined;
                 return {messaging :'connection closed', connectionStatus : '200db', status : 'success'};

            }catch(err){
               return {messaging :err.message, connectionStatus : '500db', status : 'failure'};
            }
                // VCBackendUserDB.#dbconnection // methds declaration

    }
}

VCBackendUserDB.initializeDBConnection().then((data)=>{
    console.log(data);
}).catch(err =>
    console.log(err.message)
)

module.exports = VCBackendUserDB