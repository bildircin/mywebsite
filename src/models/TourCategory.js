import Sequelize from 'sequelize'
import db from '../../db.js'
import Category from './Category.js'
import Tour from './Tour.js'

const TourCategory = db.define('TourCategory', {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    tourId: {
        type: Sequelize.INTEGER,
        references: {
          model: Tour, 
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
    tableName: 'toursCategories'
})

export default TourCategory