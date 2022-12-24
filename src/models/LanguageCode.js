import Sequelize from 'sequelize'
import db from '../../db.js'

export default db.define('LanguageCode', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    lng:{
        type:Sequelize.STRING(10),
        allowNull:false
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    nativeName:{
        type:Sequelize.STRING
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    }
},
{
    tableName: 'languageCodes',
    timestamps: false
})

