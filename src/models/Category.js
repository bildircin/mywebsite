const Sequelize = require('sequelize')
const db = require('../../db')
const Video = require('./Video')

const Category = db.define('Category', {
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
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    sequence:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
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
    tableName: 'categories'
})

/* Category.belongsToMany(Video, { 
    through: 'VideoCategory' 
}) */

module.exports = Category