'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('languageCodes', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        lng:{
            type:Sequelize.STRING(10),
            allowNull:false
        },
        name:{
            type:Sequelize.STRING,
            allowNull:false
        },
        nativeName:{
            type:Sequelize.STRING
        }
     });
     
  },

   async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('languageCodes');
     
  }
};