const { check, validationResult } = require('express-validator');
const model = require('../models/index');
const {logger} = require('../logger/logger');
const db = require('../models/index');

const getCliente = (cid, orgId, clienteId) => {
    logger.info( `Tracking [${cid}]. Buscando cliente=(${clienteId}) em org=(${orgId})`);
    return model.clientes.findOne({where: {cliente_id: clienteId, org_id: orgId}}).then(response => {
        return response;
    });
};

module.exports = {
    getCliente(cid, orgId, clienteId){
        return getCliente(cid, orgId, clienteId);
    },

    async post(req, resp) {
        const {orgId, cid} = req
        const{nome,cnpj,endereco,bairro,num,comp,email,
            cpf,rg,fone,cel}=req.body;

        logger.info( `Tracking [${cid}]. Criando novo cliente na org (${orgId})`);
        model.clientes.create({
            org_id: orgId,
            nome: nome,
            endereco: endereco,
            num: num,
            comp: comp,
            email: email,
            cpf: cpf,
            cnpj: cnpj,
            rg: rg,
            fone: fone,
            cel: cel,
            bairro: bairro
        })
            .then(cliente=>{
                logger.info( `Tracking [${cid}]. Cliente (${cliente.cliente_id}) criado na org (${orgId})`);
                resp.status(201).json(cliente);
            })
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar criar novo cliente na org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error});
            });
    },

    async get(req, resp){
        const {orgId, cid} = req
        const { offset } = req.query

        logger.info( `Tracking [${cid}]. Listando clientes da org=(${orgId})`);
        
        model.sequelize.query(`
            select * 
            from cliente
            where org_id = :orgId
            order by cliente_id desc
            limit 10 offset :offset
        `, {
            replacements: { orgId: orgId, offset: offset ? Number(offset) : 0  },
            mapToModel: false
        }).then(result=>{
            logger.info( `Tracking [${cid}]. Listando clientes pela org=(${orgId}). Total=(${result.length})`);
            resp.json(result[0]);
        })
        .catch(error=>{
            logger.error( `Tracking [${cid}]. Erro ao listar clientes na org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        });
    },

    async findById(req, resp) {
        const {orgId, cid} = req
        await check('clienteId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), params=(${errors.array()})`);
            return resp.status(400).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const cli_id = req.params.clienteId;
        getCliente(cid, orgId, cli_id).then(result=>{
            if(!result){
                logger.warn( `Tracking [${cid}]. Cliente=(${cli_id}) nao encontrado`);
                resp.status(400).json({message: 'Cliente nao encontrado'})
            }
            else {
                logger.info( `Tracking [${cid}]. Cliente=(${cli_id}) encontrado`);
                resp.status(200).json(result)
            }
        }).catch(error=>{
            logger.error( `Tracking [${cid}]. Erro ao buscar cliente=(${cli_id}) na org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error})
        });
    },

    async put(req, resp) {
        const {orgId, cid} = req
        await check('clienteId').isInt().run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), params=(${errors.array()})`);
            return resp.status(400).json({
                message: 'Argumentos invalidos',
                error: errors.array()
            })
        }
        const cli_id = req.params.clienteId;

        try {
            const{nome,cnpj,endereco,bairro,num,comp,email,
                cpf,rg,fone,cel}=req.body;

            const result = await getCliente(cid, orgId, cli_id);
            if (!result) {
                logger.warn( `Tracking [${cid}]. Cliente nao existe org=(${orgId}), cliente=(${cli_id})`);
                return resp.status(400).json({message: 'Cliente nao encontrado'})
            }
            logger.info( `Tracking [${cid}]. Atualizando cliente=(${cli_id}), org=(${orgId})`);
            model.clientes.update({
                nome: nome,
                endereco: endereco,
                num: num,
                comp: comp,
                email: email,
                cpf: cpf,
                cnpj: cnpj,
                rg: rg,
                fone: fone,
                cel: cel,
                bairro: bairro,
            },{
                where: {
                    org_id: orgId,
                    cliente_id: cli_id
                }
            })
                .then(result=>{
                    getCliente(cid, orgId, cli_id).then(response=>{
                        if(response){
                            logger.info(`Tracking [${cid}]. Cliente atualizado=(${cli_id}), org=(${orgId})`);
                            return resp.json(response);
                        }
                        else {
                            logger.warn(`Tracking [${cid}]. Registro nao encontrado, cliente=(${cli_id}), org=(${orgId})`);
                            return resp.status(400).json({message: 'Registro nao existe'});
                        }
                    })
                });
        }catch (error) {
            logger.error( `Tracking [${cid}]. Erro ao tentar atualizar registro do cliente=(${cli_id}), org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error})
        }
    }
}