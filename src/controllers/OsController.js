const { check, validationResult } = require('express-validator');
const moment = require('moment');
const model = require('../models/index');
const {getCliente} = require("./ClienteController");
const {getUsuario} = require("./UsuarioController");
const {logger} = require('../logger/logger');

const getOs = (cid, orgId, osId) => {
    return model.os.findOne({where:{os_id: osId, org_id: orgId}}).then(response=> {return response;});
}

module.exports = {

    async findAll(req, resp, next) {
        const {orgId, cid} = req

        logger.info( `Tracking [${cid}]. Listando os da org=(${orgId})`);
        model.os.findAll({
            where:{
                org_id: orgId
            }})
            .then(result=> {
                logger.info( `Tracking [${cid}]. Listando os pela org=(${orgId}). Total=(${result.length})`);
                result.forEach(item=> {
                    item.data = moment(item.data).format("dd/MM/yyyy DD:mm:ss");
                });
                return resp.json(result)})
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async findById(req, resp, next) {
        const {orgId, cid} = req

        await check('osId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
            params=(${errors.array()})`);
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const osId = req.params.osId;
        getOs(cid, orgId, osId)
            .then(response=> {
                if(response){
                    logger.info( `Tracking [${cid}]. Buscando o.s=(${osId}), org=(${orgId})`);
                    response.data = moment(response.data).format("dd/MM/yyyy DD:mm:ss");
                    return resp.json(response);
                }
                else {
                    logger.warn( `Tracking [${cid}]. Nao existe o.s=(${osId}), org=(${orgId})`);
                    return resp.status(400).json({message: 'Os nao existe'});
                }})
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar localizar o.s=(${osId}) org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error})
            });
    },

    async put(req, resp, next) {
        const {cid, orgId, usuarioId} = req;

        await check('osId').isInt().run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
                params=(${errors.array()})`);
            return resp.status(422).json({
                message: 'Argumentos invalidos',
                errors: errors.array()
            })
        }
        const osId = req.params.osId;

        try {
            const {
                cliente_id, tipo, aparelho, defeito,
                servico, valor, entrada, obs,
                usuario_tecnico_id, situacao, garantia
            } = req.body;

            const clienteExists = await getCliente(cid, orgId, cliente_id);
            if (!clienteExists) {
                logger.warn( `Tracking [${cid}]. Nao existe cliente=(${cliente_id}), org=(${orgId})`);
                return resp.status(400).json({message: 'Cliente invalido'});
            }
            if (usuario_tecnico_id) {
                getUsuario(cid, orgId, usuario_tecnico_id).then(response => {
                    if (!response) {
                        logger.warn( `Tracking [${cid}]. Nao existe tecnico=(${usuario_tecnico_id}), org=(${orgId})`);
                        return resp.json(400).json({message: 'Tecnico informado nao existe'});
                    }
                })
            }

            logger.info( `Tracking [${cid}]. Atualizando o.s=(${osId}), org=(${orgId})`);
            model.os.update({
                cliente_id: cliente_id,
                usuario_id: usuarioId,
                tipo: tipo,
                aparelho: aparelho,
                defeito: defeito,
                servico: servico,
                valor: valor,
                entrada: entrada,
                obs: obs,
                usuario_tecnico_id: usuario_tecnico_id,
                situacao: situacao,
                garantia: garantia,
            },{
                where:{
                    org_id: orgId,
                    os_id: osId
                }
            })
                .then(() => {
                    getOs(cid, orgId, osId).then(response=> {
                        logger.info( `Tracking [${cid}]. Atualizado o.s=(${osId}), org=(${orgId})`);
                        response.data = moment(response.data).format("dd/MM/yyyy DD:mm:ss");
                        return resp.json(response);
                    })
                })
        }catch(error){
            logger.error( `Tracking [${cid}]. Erro ao tentar atualizar o.s=(${osId}) org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        };
    },

    async post(req, resp, next) {
        const {cid, orgId, usuarioId} = req;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
                params=(${errors.array()})`);
            return resp.status(422).json({
                message: 'Argumentos invalidos',
                errors: errors.array()
            })
        }
        try{
            const {
                cliente_id, tipo, aparelho, defeito,
                servico, valor, entrada, obs,
                usuario_tecnico_id, situacao, garantia
            } = req.body;

            const clienteExists = await getCliente(cid, orgId, cliente_id);
            if (!clienteExists) {
                logger.warn( `Tracking [${cid}]. Cliente nao existe=(${cliente_id}) org=(${orgId})`);
                return resp.status(400).json({message: 'Cliente invalido'});
            }
            if (usuario_tecnico_id) {
                getUsuario(cid, orgId, usuario_tecnico_id).then(response => {
                    if (!response) {
                        logger.warn( `Tracking [${cid}]. Nao existe registo tecnico=(${usuario_tecnico_id}) org=(${orgId})`);
                        return resp.json(400).json({message: 'Tecnico informado nao existe'});
                    }
                })
            }
            logger.info( `Tracking [${cid}]. Criando novo registro de o.s org=(${orgId})`);

            model.os.create({
                cliente_id: cliente_id,
                org_id: orgId,
                usuario_id: usuarioId,
                tipo: tipo,
                aparelho: aparelho,
                defeito: defeito,
                servico: servico,
                valor: valor,
                entrada: entrada,
                obs: obs,
                usuario_tecnico_id: usuario_tecnico_id,
                situacao: situacao,
                garantia: garantia,
            })
                .then(response => {
                    logger.info( `Tracking [${cid}]. Registro criado, os=(${response.os_id}) org=(${orgId})`);
                    response.data = moment(response.data).format("dd/MM/yyyy DD:mm:ss");
                    return resp.json(response)
                })
        }catch(error){
            logger.error( `Tracking [${cid}]. Erro ao tentar criar o.s org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        }
    }
}