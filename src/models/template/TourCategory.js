const Sequelize = require('sequelize')
const db = require('../../../db')
const Category = require('../Category')
const Tour = require('./Tour')

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

module.exports = TourCategory