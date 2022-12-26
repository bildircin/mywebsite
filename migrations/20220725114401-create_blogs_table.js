'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
    await queryInterface.createTable('blogs', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        title:{
            type:Sequelize.STRING('1000')
        },
        url:{
            type:Sequelize.STRING(500),
            allowNull:false
        },
        headImgUrl:{
            type:Sequelize.STRING('500')
        },
        releaseDate:{
            type:Sequelize.DATE,
            allowNull:false
        },
        description:{
            type:Sequelize.TEXT('long')
        },
        tags:{
            type:Sequelize.STRING('1000')
        },
        isActive:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            defaultValue:true
        }
    });
     
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:*/
     await queryInterface.dropTable('blogs');
     
  }
};