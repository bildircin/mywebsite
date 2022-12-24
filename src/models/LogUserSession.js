import Sequelize from 'sequelize'
import db from '../../db.js'

const LogUserSession = db.define('LogUserSession', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:Sequelize.INTEGER
    },
    description:{
        type:Sequelize.STRING
    },
    isSuccess:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    },
    ipAddress:{
        type:Sequelize.STRING
    },
    createdAt:{
        type:Sequelize.DATE,
        allowNull:false
    }
},
{
    tableName: 'logUserSessions',
    updatedAt: false
})

/* Category.belongsToMany(Video, { 
    through: 'VideoCategory' 
}) */

export default LogUserSession