'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('logUserSessions', { 
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            primaryKey:true,
            autoIncrement:true
        },
        userId:{
            type:Sequelize.INTEGER
        },
        description:{
            type:Sequelize.STRING
        },
        isSuccess:{
            type:Sequelize.BOOLEAN,
            allowNull:false
        },
        ipAddress:{
            type:Sequelize.STRING
        },
        createdAt:{
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
     await queryInterface.dropTable('logUserSessions');
     
  }
};