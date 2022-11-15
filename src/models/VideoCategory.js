const Sequelize = require('sequelize')
const db = require('../../db')
const Category = require('./Category')
const Video = require('./Video')

const VideoCategory = db.define('VideoCategory', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    videoId: {
        type: Sequelize.INTEGER,
        references: {
          model: Video, 
          key: 'id'
        }
    },
    categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: Category,
          key: 'id'
        }
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
    tableName: 'videosCategories'
})

module.exports = VideoCategory