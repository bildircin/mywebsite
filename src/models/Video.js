import Sequelize from 'sequelize'
import db from '../../db.js'

const Video = db.define('Video', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    title:{
        type:Sequelize.STRING
    },
    sequence:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    duration:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    url:{
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
    tableName: 'videos'
})

/* Video.belongsToMany(Category, { 
    through: 'VideoCategory' 
}) */

export default Video