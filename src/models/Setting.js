import Sequelize from 'sequelize'
import db from '../../db.js'

export default db.define('Setting', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    key:{
        type:Sequelize.STRING,
        unique:true
    },
    value:{
        type:Sequelize.TEXT('long')
    }
},
{
    tableName: 'settings',
    timestamps: false
})

