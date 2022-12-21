'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
     await queryInterface.createTable('users', { 
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    nameAndSurname:{
        type:Sequelize.STRING,
        allowNull:false
    },
    userName:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    type:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:1
    },
    phone:{
        type:Sequelize.STRING,
        allowNull:true
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
     await queryInterface.dropTable('users');
     
  }
};