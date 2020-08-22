const { check, validationResult } = require('express-validator');
const model = require('../models/index');
const {getCliente} = require('ClienteController')
const {getUsuario} = require('UsuarioController')


const getOs = (orgId, osId) => {
    model.os.findOne({where:{os_id: osId, org_id: orgId}}).then(response=> {return response});
}

module.exports = {

    async findAll(req, resp, next) {
        const orgId = req.orgId;
        model.os.findAll({
            where:{
                org_id: orgId
            }})
            .then(response=> {return resp.json(response)})
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async findById(req, resp, next) {
        const orgId = req.orgId;
        await check('osId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const osId = req.params.osId;
        getOs(orgId, osId)
            .then(response=> {return resp.json(response)})
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async put(req, resp, next) {
        try {
            const {orgId, usuarioId} = req;

            await check('osId').isInt().run(req);

            const {
                cliente_id, tipo, aparelho, defeito,
                servico, valor, entrada, obs,
                usuario_tecnico_id, situacao, garantia
            } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return resp.status(422).json({
                    message: 'Argumentos invalidos',
                    errors: errors.array()
                })
            }
            const clienteExists = await getCliente(orgId, cliente_id);
            if (!clienteExists) {
                return resp.status(400).json({message: 'Cliente invalido'});
            }
            if (usuario_tecnico_id) {
                getUsuario(orgId, usuario_tecnico_id).then(response => {
                    if (!response) {
                        return resp.json(400).json({message: 'Tecnico informado nao existe'});
                    }
                })
            }
            const osId = req.params.osId;

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
                    getOs(orgId, osId).then(data=> resp.json(data))
                })
        }catch(error){
            resp.status(500).json({message:error});
        };
    },

    async post(req, resp, next) {
        try{
            const {orgId, usuarioId} = req;

            const {
                cliente_id, tipo, aparelho, defeito,
                servico, valor, entrada, obs,
                usuario_tecnico_id, situacao, garantia
            } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return resp.status(422).json({
                    message: 'Argumentos invalidos',
                    errors: errors.array()
                })
            }
            const clienteExists = await getCliente(orgId, cliente_id);
            if (!clienteExists) {
                return resp.status(400).json({message: 'Cliente invalido'});
            }
            if (usuario_tecnico_id) {
                getUsuario(orgId, usuario_tecnico_id).then(response => {
                    if (!response) {
                        return resp.json(400).json({message: 'Tecnico informado nao existe'});
                    }
                })
            }

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
                    return resp.json(response)
                })
        }catch(error){
            resp.status(500).json({message:error});
        }
    }
}