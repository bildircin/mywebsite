'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('navigations', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        parentId:{
            type:Sequelize.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        title:{
            type:Sequelize.STRING
        },
        link:{
            type:Sequelize.STRING
        },
        sequence:{
            type:Sequelize.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        description:{
            type:Sequelize.STRING
        },
        isActive:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            defaultValue:true
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
     });
     
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('navigations');
     
  }
};