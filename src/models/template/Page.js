import Sequelize from 'sequelize'
import db from '../../../db.js'

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
        type:Sequelize.TEXT('long')
    },
    content:{
        type:Sequelize.TEXT('long')
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

export default Page