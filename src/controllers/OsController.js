const { check, validationResult } = require('express-validator');
const moment = require('moment');
const model = require('../models/index');
const {getCliente} = require("./ClienteController");
const {getUsuario} = require("./UsuarioController");
const {logger} = require('../logger/logger');

const getOs = (cid, orgId, osId) => {
    return model.os.findOne({where:{os_id: osId, org_id: orgId}}).then(response=> {return response;});
}

const getOs2 = (cid, orgId, osId) => {
    return model.sequelize.query(`
            select 
                o1.os_id,
                o1.usuario_id,
                o1.cliente_id,
                o1.org_id,
                o1.data,
                o1.tipo,
                o1.aparelho,
                o1.defeito,
                o1.servico,
                o1.valor,
                o1.entrada,
                o1.obs,
                o1.usuario_tecnico_id,
                o1.situacao,
                o1.garantia,
                cli.nome cliente_nome,
                u2.usuario usuario_nome,
                t1.usuario tecnico_nome
            from os o1
            inner join cliente cli
                on cli.cliente_id = o1.cliente_id 
            left join usuario u2
                on u2.usuario_id = o1.usuario_id 
            left join usuario t1
                on t1.usuario_id  = o1.usuario_tecnico_id 
            where o1.org_id = :orgId
            and o1.os_id = :osId
            limit 1
            `, {
                replacements: { orgId: orgId, osId: osId},
                mapToModel: false
            }
        ).then(response => {
            let result = response[0].map(e => {
                return {
                    os_id: e.os_id,
                    cliente: {
                        id: e.cliente_id,
                        nome: e.cliente_nome
                    },
                    usuario: {
                        id: e.usuario_id,
                        nome: e.usuario_nome
                    },
                    tecnico: {
                        id: e.usuario_tecnico_id,
                        nome: e.tecnico_nome
                    },
                    data: e.data ? moment(e.data).format("DD/MM/yyyy HH:mm:ss") : null,
                    tipo: e.tipo,
                    aparelho: e.aparelho,
                    defeito: e.defeito,
                    servico: e.servico,
                    valor: e.valor,
                    entrada: e.entrada,
                    obs: e.obs,
                    situacao: e.situacao,
                    garantia: e.garantia,
                }
            });
            return result.length == 0 ? [] : result[0]
        })
}

const tipos = [
    'OS',
    'Garantia'
]

const situacoes = [
    'ENTREGA FEITA',
    'ORÇAMENTO REPROVADO',
    'NA BANCADA',
    'RETORNOU',
    'AGUARDANDO APROVAÇÃO',
    'AGUARDANDO PEÇAS',
    'ESTÁ PRONTO, AVISAR CLIENTE',
    'ENTREGA FEIRA',
    'ABANDOANDO PELO CLIENTE',
    'SEM CONSERTO',
]

module.exports = {
    async findById2(req, resp, next) {
        const {orgId, cid} = req

        await check('osId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
            params=(${errors.array()})`);
            return resp.status(400).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const osId = req.params.osId;
        getOs2(cid, orgId, osId)
            .then(response => {
                if(response){
                    logger.info( `Tracking [${cid}]. Buscando o.s=(${osId}), org=(${orgId})`);
                    return resp.status(200).json(response);
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


    async findAll(req, resp, next) {
        const {orgId, cid} = req
        const { offset } = req.query

        logger.info( `Tracking [${cid}]. Listando os da org=(${orgId})`);

        model.sequelize.query(`
            select 
                o1.os_id,
                o1.usuario_id,
                o1.cliente_id,
                o1.org_id,
                o1.data,
                o1.tipo,
                o1.aparelho,
                o1.defeito,
                o1.servico,
                o1.valor,
                o1.entrada,
                o1.obs,
                o1.usuario_tecnico_id,
                o1.situacao,
                o1.garantia,
                cli.nome cliente_nome,
                u2.usuario usuario_nome,
                t1.usuario tecnico_nome
            from os o1
            inner join cliente cli
                on cli.cliente_id = o1.cliente_id 
            left join usuario u2
                on u2.usuario_id = o1.usuario_id 
            left join usuario t1
                on t1.usuario_id  = o1.usuario_tecnico_id 
            where o1.org_id = :orgId
            order by o1.os_id desc
            limit 10 offset :offset
            `, {
                replacements: { orgId: orgId, offset: offset ? Number(offset) : 0  },
                mapToModel: false
            }
        ).then(response => {
            let result = response[0].map(e => {
                return {
                    os_id: e.os_id,
                    cliente: {
                        id: e.cliente_id,
                        nome: e.cliente_nome
                    },
                    usuario: {
                        id: e.usuario_id,
                        nome: e.usuario_nome
                    },
                    tecnico: {
                        id: e.usuario_tecnico_id,
                        nome: e.tecnico_nome
                    },
                    data: e.data ? moment(e.data).format("DD/MM/yyyy HH:mm:ss") : null,
                    tipo: e.tipo,
                    aparelho: e.aparelho,
                    defeito: e.defeito,
                    servico: e.servico,
                    valor: e.valor,
                    entrada: e.entrada,
                    obs: e.obs,
                    situacao: e.situacao,
                    garantia: e.garantia,
                }
            });
            return resp.json(result)
        })
        .catch(error=> {
            resp.status(500).json({message:error})
        });
    },

    async findById(req, resp, next) {
        const {orgId, cid} = req

        await check('osId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
            params=(${errors.array()})`);
            return resp.status(400).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const osId = req.params.osId;
        getOs(cid, orgId, osId)
            .then(response => {
                if(response){
                    logger.info( `Tracking [${cid}]. Buscando o.s=(${osId}), org=(${orgId})`);
                    response.data = moment(response.data).format("dd/MM/yyyy HH:mm:ss");
                    return resp.status(200).json(response);
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
            return resp.status(400).json({
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
        const {
            cliente_id, tipo, aparelho, defeito,
            servico, valor, entrada, obs,
            usuario_tecnico_id, situacao, garantia
        } = req.body;

        if(!cliente_id || !tipo || !situacao || !orgId) {
            const message = 'Cancelado criacao de os por falta de parametro'
            logger.warn( `Tracking [${cid}]. ${message}`);
            return resp.status(400).json({message: message})
        }

        const situacaoResult = situacoes.find(element => element === situacao)
        if(!situacaoResult){
            const message = `Situacao informada é invalido ${situacao}`
            logger.warn( `Tracking [${cid}]. ${message}`);
            return resp.status(400).json({message: message})
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
                params=(${errors.array()})`);
            return resp.status(400).json({
                message: 'Argumentos invalidos',
                errors: errors.array()
            })
        }
        try{

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
                    response.data = moment(response.data).format("dd/MM/yyyy HH:mm:ss");
                    return resp.json(response)
                })
        }catch(error){
            logger.error( `Tracking [${cid}]. Erro ao tentar criar o.s org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        }
    }
}