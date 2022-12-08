'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('languageItems', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        key:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        lng:{
            type:Sequelize.STRING(10),
            allowNull:false
        },
        title:{
            type:Sequelize.STRING,
            allowNull:false
        },
        value:{
            type:Sequelize.STRING(1000)
        }
     });
     
  },

   async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('languageItems');
     
  }
};