const Sequelize = require('sequelize')
const db = require('../../../db')

const Page = db.define('Page', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    title:{
        type:Sequelize.STRING
    },
    url:{
        type:Sequelize.STRING
    },
    header:{
        type:Sequelize.STRING
    },
    content:{
        type:Sequelize.STRING
    },
    seoKeywords:{
        type:Sequelize.STRING
    },
    seoDescription:{
        type:Sequelize.STRING
    },
    coverUrl:{
        type:Sequelize.STRING
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
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
    tableName: 'pages'
})

/* Video.belongsToMany(Category, { 
    through: 'VideoCategory' 
}) */

module.exports = Page