'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('videos', { 
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
     });
     
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('videos');
     
  }
};