'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('pageContents', { 
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
     });
     
  },

   async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('pageContents');
     
  }
};