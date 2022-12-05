import Sequelize from 'sequelize'
import db from '../../db.js'


export default db.define('Image', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    title:{
        type:Sequelize.STRING,
        allowNull:false
    },
    url:{
        type:Sequelize.STRING,
        allowNull:false,
    }
},
{
    tableName: 'images',
    timestamps: false
})