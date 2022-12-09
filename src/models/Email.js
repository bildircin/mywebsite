import Sequelize from 'sequelize'
import db from '../../db.js'


export default db.define('Email', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    host:{
        type:Sequelize.STRING
    },
    port:{
        type:Sequelize.INTEGER
    },
    secure:{
        type:Sequelize.BOOLEAN,
        defaultValue:true
    },
    email:{
        type:Sequelize.STRING
    },
    password:{
        type:Sequelize.STRING
    }
},
{
    tableName: 'emails',
    timestamps:false
})