'use strict';

module.exports = (sequelize, DataTypes) => {
    const usuarios = sequelize.define('usuarios', {
        usuario_id: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        org_id: DataTypes.STRING,
        usuario: DataTypes.STRING,
        fone: DataTypes.STRING,
        login: DataTypes.STRING,
        senha: DataTypes.STRING,
        perfil: DataTypes.STRING,
        tecnico: DataTypes.BOOLEAN,
        ativo: DataTypes.BOOLEAN
    }, {
        tableName: 'usuario',
        timestamps:false
    });
    return usuarios;
};