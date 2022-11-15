const Sequelize = require('sequelize')
const db = require('../../../db')

const Navigation = db.define('Navigation', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    parentId:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    title:{
        type:Sequelize.STRING
    },
    link:{
        type:Sequelize.STRING
    },
    sequence:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    description:{
        type:Sequelize.STRING
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },
    isDeleted:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    createdAt:{
        type:Sequelize.DATE,
        allowNull:false
    },
    updatedAt:{
        type:Sequelize.DATE,
        allowNull:false
    }
},
{
    tableName: 'navigations',
})


module.exports = Navigation