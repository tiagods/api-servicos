const { check, validationResult } = require('express-validator');
const model = require('../models/index');

const getCliente = (orgId, clienteId) => {
    return model.clientes.findOne({where: {cliente_id: clienteId, org_id: orgId}}).then(response => {
        return response;
    });
};
module.exports = {
    getCliente(orgId, clienteId){
      return getCliente(orgId, clienteId);
    },

    async post(req, resp) {
        const orgId = req.orgId
        const{nome,cnpj,endereco,bairro,num,comp,email,
            cpf,rg,fone,cel}=req.body;
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
            .then(org=>{
                delete org.dataValues.org_id;
                resp.status(201).json(org);
            })
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async get(req, resp){
        const orgId = req.orgId
        model.clientes.findAll({
            where: {
                org_id: orgId
            }
        })
        .then(result=>{
            resp.status(200).json(result)})
        .catch(error=>{resp.status(500).json({message:error})});
    },
    async findById(req, resp) {
        const orgId = req.orgId
        await check('clienteId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const cli_id = req.params.clienteId;
        getCliente(orgId, cli_id).then(result=>{
            if(!result){
                resp.status(400).json({message: 'Cliente nao encontrado'})
            }
            else resp.status(200).json(result)
        }).catch(error=>{resp.status(500).json({message:error})});
    },
    async put(req, resp) {
        const orgId = req.orgId
        await check('clienteId').isInt().run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(422).json({
                message: 'Argumentos invalidos',
                error: errors.array()
            })
        }
        try {
            const{nome,cnpj,endereco,bairro,num,comp,email,
                cpf,rg,fone,cel}=req.body;

            const cli_id = req.params.clienteId;
            const result = await getCliente(orgId, cli_id);
            if (!result) {
                return resp.status(400).json({message: 'Cliente nao encontrado'})
            }
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
                    getCliente(orgId, cli_id).then(response=>{
                        return resp.json(response);
                    })
                });
        }catch (error) {
            resp.status(500).json({message:error})
        }
    }
}