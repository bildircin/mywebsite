import Sequelize from 'sequelize'
import db from '../../db.js'


export default db.define('sharedImage', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    title:{
        type:Sequelize.STRING(500)
    },
    url:{
        type:Sequelize.STRING(500)
    }
},
{
    tableName: 'sharedImages',
    timestamps: false
})