'use strict';

const { Sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const clientes = sequelize.define('clientes', {
    cliente_id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    org_Id: DataTypes.STRING,
    nome: DataTypes.STRING,
    endereco: DataTypes.STRING,
    num: DataTypes.STRING,
    comp: DataTypes.STRING,
    email: DataTypes.STRING,
    cpf: DataTypes.STRING,
    cnpj: DataTypes.STRING,
    rg: DataTypes.STRING,
    fone: DataTypes.STRING,
    cel: DataTypes.STRING,
    bairro: DataTypes.STRING,
  }, {
    tableName: 'cliente',
    timestamps:false
  });
  return clientes;
};