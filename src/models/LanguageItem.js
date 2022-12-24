import Sequelize from 'sequelize'
import db from '../../db.js'

export default db.define('LanguageItem', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    key:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    lng:{
        type:Sequelize.STRING(10),
        allowNull:false
    },
    title:{
        type:Sequelize.STRING,
        allowNull:false
    },
    value:{
        type:Sequelize.STRING(1000)
    }
},
{
    tableName: 'languageItems',
    timestamps: false
})

