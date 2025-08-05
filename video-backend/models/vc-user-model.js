const { Model, DataTypes, Op } = require("sequelize")
const VCBackendUserDB = require("./vc-db-model")
const {createHmac, createHash} = require('crypto');

class UserLogin extends Model{
    // custom methods and variables that are not colliding with sequelizecan be added
}

UserLogin.init({
// model attributes
    id:{
        type:DataTypes.STRING(255),
        allowNull:false,
        autoIncrement:false,
        primaryKey:true,
    },
    username:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    secret_key:{
        type:DataTypes.STRING(255),
        allowNull:false
    }
},{
    // model options  | connection String | modelName
    sequelize:VCBackendUserDB.dbconnection,
    modelName:"vc_user_login",
    tableName:"vc_user_login",
    freezeTableName:true,
    updatedAt:false,
    createdAt:false,
})



class UserDetails extends Model{};

UserDetails.init({
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true,
        },
        first_name:{
            type:DataTypes.CHAR(50)
        },
        last_name:{
            type:DataTypes.CHAR(50)
        },
        email:{
            type:DataTypes.CHAR(100)
        },
        mobile:{
            type:DataTypes.CHAR(11)
        },
        userid:{
            type:DataTypes.STRING(255),
        }
},{
    modelName:'vc_user_details',
    freezeTableName:true,
    sequelize:VCBackendUserDB.dbconnection,
    updatedAt:false,
    createdAt:false,
})


// UserLogin.sync({alter:true});
// UserDetails.sync({alter:true});

UserLogin.hasOne(UserDetails,{
    onUpdate:'CASCADE',
    onDelete:'CASCADE',
    foreignKey:{
        name:'userid',
    }
})

UserDetails.belongsTo(UserLogin);






async function getUser(userIdentifier, mode){ // mode = LOOKUPLOGIN | LOOKUPDATA

  try{
    const userIdArray = await UserDetails.findAll({
            attributes:["userid","first_name","last_name"],
            where:{
                [Op.or]:[{email:userIdentifier},{mobile:userIdentifier}] // Op is a set of operators provided by sequelize 
            }
        })

        
        if(userIdArray.length == 0) return  {status : 'failure', message :'user not found', data: "" } // return messaging for not found user;

        const foundUser = userIdArray[0];

        if(mode == "LOOKUPDATA"){
            return {status : 'success', message :'user data found', data: {...userIdArray[0].dataValues} }
        }



        const userLoginDetails = await UserLogin.findAll({
            attributes:["secret_key"],
            where:{
                'id': foundUser.getDataValue('userid'),
            }
        })

        if(userLoginDetails.length == 0) return {status : 'failure', message :'user not found', data: "" };

        return {status : 'success', message :'user data found', data: {...userLoginDetails[0].dataValues} }
    }catch(err){
        return {status : 'failure', message :err.message, data: "" }
    }
    // findAll returns empty Array if no data is found
    // console.log(userId);

}


async function createUser({username , userpass}) {
    try{
        const userPresent = await getUser(username,"LOOKUPLOGIN");
        if(userPresent.data !== "") return {status : 'failure', message:'user creation failure, the user already exsists', data:''}
        const userId = createHash('SHA256').update(`${username}-${userpass}`).update(process.env.MYSQL_USERPASS_SALT).digest('base64')
        const secretKey = createHash('SHA256').update(username).update(process.env.MYSQL_USERSECRET_SALT).digest('base64')
        const createUser = await UserLogin.create({
            'id':userId,
            'username':username,
            'secret_key':secretKey,
        })
        
        let updateUserDetail = UserDetails.build({
            userid : userId,
        })
        
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        const mobileTestUS = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
        const mobileTestIN = /^(\+91[-.\s]?)?[6-9]\d{9}$/
        const mobileTestOthers = /^(\+[1-9]\d{0,3}[-.\s]?)?\d{10,14}$/ 

        if(emailRegexp.test(`${username}`)){
            updateUserDetail.email = username
        }else if(mobileTestIN.test(`${username}`) || mobileTestOthers.test(`${username}`) || mobileTestUS.test(`${username}`)){
            updateUserDetail.mobile = username
        }else{
            throw new Error('invalid Data Type')
        }

        updateUserDetail =  await updateUserDetail.save();
        console.log(updateUserDetail,createUser);

    }catch(err){
        return {status : 'failure', message :err.message, data: err.stack } // error here
    }
}

// getUser('amardeepsaha13@gmail.com','LOOKUPDATA').then(console.log)

createUser({username:'amardeepsaha13@gmail.vom', password:'AmardeepSaha1234'}).then(console.log).catch(console.error);


module.exports = { UserLogin, UserDetails}