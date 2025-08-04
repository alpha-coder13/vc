const { Model, DataTypes } = require("sequelize")
const VCBackendUserDB = require("./vc-db-model")

class UserLogin extends Model{
    // custom methods and variables that are not colliding with sequelizecan be added
}

UserLogin.init({
// model attributes
    username:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    id:{
        type:DataTypes.STRING(255),
        allowNull:false,
        autoIncrement:false,
        primaryKey:true,
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
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true,
        }
},{
    modelName:'vc_user_details',
    freezeTableName:true,
    sequelize:VCBackendUserDB.dbconnection,
    updatedAt:false,
    createdAt:false,
})

module.exports = UserLogin