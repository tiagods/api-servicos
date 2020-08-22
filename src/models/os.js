'use strict';

module.exports = (sequelize, DataTypes) => {
    const os = sequelize.define('os', {
        os_id: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        cliente_id: DataTypes.INTEGER,
        org_id: DataTypes.STRING,
        usuario_id: DataTypes.INTEGER,
        tipo: DataTypes.STRING,
        aparelho: DataTypes.STRING,
        defeito: DataTypes.STRING,
        servico: DataTypes.STRING,
        valor: DataTypes.DECIMAL(10,2),
        entrada: DataTypes.DECIMAL(10,0),
        obs: DataTypes.TEXT,
        usuario_tecnico_id: DataTypes.INTEGER,
        situacao: DataTypes.STRING,
        garantia: DataTypes.STRING,
        createdAt: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'data'
        }
    }, {
        tableName: 'os',
    });
    return os;
}