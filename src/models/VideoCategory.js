import Sequelize from 'sequelize'
import db from '../../db.js'
import Category from './Category.js'
import Video from './Video.js'

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

export default VideoCategory