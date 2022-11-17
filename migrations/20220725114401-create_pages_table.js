'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('pages', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        title:{
            type:Sequelize.STRING
        },
        url:{
            type:Sequelize.STRING
        },
        pageHeader:{
            type:Sequelize.TEXT('long')
        },
        pageContent:{
            type:Sequelize.TEXT('long')
        },
        seoKeywords:{
            type:Sequelize.STRING
        },
        seoDescription:{
            type:Sequelize.STRING
        },
        coverUrl:{
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
     await queryInterface.dropTable('pages');
     
  }
};