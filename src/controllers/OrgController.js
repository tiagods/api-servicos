const correlator = require('correlation-id');
const { check, validationResult } = require('express-validator');
let model = require('../models/index');

const getOrg = orgId => {
    return model.orgs.findOne({where: {org_id: orgId}}).then(response => { return response;});
};

module.exports = {
    async getOrg(orgId){
        return getOrg(orgId);
    },

    async post(req, resp) {
        let newOrg = correlator.withId(() => {
            return correlator.getId();
        });
        if(!newOrg){
            return resp.status(400).json({message: "Problema ao gerar o id"})
        }
        newOrg = 'TN-'+newOrg;
        const{nome,cnpj,endereco,bairro,cep,cidade,estado,
            celular,telefone,email,site}=req.body;

        model.orgs.create({
            org_id: newOrg,
            nome: nome,
            cnpj: cnpj,
            endereco: endereco,
            bairro: bairro,
            cep: cep,
            cidade: cidade,
            estado: estado,
            celular: celular,
            telefone: telefone,
            email: email,
            site: site
        })
        .then(org=>resp.status(201).json(org))
        .catch(error=>{resp.status(500).json({message:error})});
    },

    async get(req, resp) {
        const orgId = req.orgId
        getOrg(orgId)
            .then(org=> {
                if(!org) {
                    resp.status(400).json({message: 'Entidade nao encontrada'});
                }
                else {
                    resp.json(org);
                }
            })
            .catch(error=>resp.status(500).json({message:error}));
    },

    async put(req, resp) {
        const orgId = req.orgId
        const{nome,cnpj,endereco,bairro,cep,cidade,estado,
            celular,telefone,email,site}=req.body;
        try {
            const exists = await getOrg(orgId);
            if(!exists){
                return resp.status(400).json({message:'Entidade nao encontrada'})
            }
            model.orgs.update({
                    nome: nome,
                    cnpj: cnpj,
                    endereco: endereco,
                    bairro: bairro,
                    cep: cep,
                    cidade: cidade,
                    estado: estado,
                    celular: celular,
                    telefone: telefone,
                    email: email,
                    site: site
                },{ where:{
                        org_id: orgId
                    }
                })
                .then(result=>{
                    getOrg(orgId).then(response=>{
                        resp.json(response)
                    })
                });
        } catch (error) {
            resp.status(500).json({message:error})            
        }
    }
};