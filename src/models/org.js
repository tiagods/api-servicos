'use strict';
module.exports = (sequelize, DataTypes) => {
  const orgs = sequelize.define('orgs', {
    org_id: {
      type:DataTypes.STRING,
      primaryKey:true
    },
    nome: DataTypes.STRING,
    cnpj: DataTypes.STRING,
    endereco: DataTypes.STRING,
    bairro: DataTypes.STRING,
    cep: DataTypes.STRING,
    cidade: DataTypes.STRING,
    estado: DataTypes.STRING,
    celular: DataTypes.STRING,
    telefone: DataTypes.STRING,
    email: DataTypes.STRING,
    site: DataTypes.STRING,
    sobre: DataTypes.STRING
  }, {
    tableName: 'org',
    timestamps:false
  });
  return orgs;
};