import Sequelize from 'sequelize'
import db from '../../db.js'

const Tour = db.define('Tour', {
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
        type:Sequelize.STRING(500),
        allowNull:false
    },
    description:{
        type:Sequelize.TEXT('long')
    },
    sequence:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    coverUrl:{
        type:Sequelize.STRING(500)
    },
    headImgUrl:{
        type:Sequelize.STRING(500)
    },
    flashDealUrl:{
        type:Sequelize.STRING(500)
    },
    day:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    persons:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    price:{
        type:Sequelize.INTEGER,
        defaultValue:0,
        allowNull:false
    },
    startedAt:{
        type:Sequelize.DATE,
        allowNull:false
    },
    finishedAt:{
        type:Sequelize.DATE,
        allowNull:false
    },
    overview:{
        type:Sequelize.TEXT('long')
    },
    dayList:{
        type:Sequelize.TEXT('long')
    },
    amenities:{
        type:Sequelize.TEXT('long')
    },
    isFlashDeal:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    isPopular:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
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
    tableName: 'tours'
})

/* Video.belongsToMany(Category, { 
    through: 'VideoCategory' 
}) */

export default Tour