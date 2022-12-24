import Sequelize from 'sequelize'
import db from '../../db.js'

export default db.define('PageContent', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    key:{
        type:Sequelize.STRING
    },
    languageCode:{
        type:Sequelize.STRING(10)
    },
    value:{
        type:Sequelize.TEXT('long')
    }
},
{
    tableName: 'pageContents',
    timestamps: false
})

