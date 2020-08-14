const { check, validationResult } = require('express-validator');
var model = require('../models/index');

module.exports = {
    async get(req, resp) {
        const orgId = req.headers['x-tenant']

        if(!orgId) {
            resp.status(422).json({message: 'Bad credentials'})
        }
        model.orgs.findOne({where: {org_id: orgId}})
            .then(org=> {
                if(!org) {
                    resp.status(404).json({message: 'Entidade nao encontrada'});
                }
                else {
                    let data = org
                    delete data.dataValues.org_id
                    resp.status(200).json(data);
                }
            })
            .catch(error=>resp.status(500).json({message:error}));
    },

    async put(req, resp) {
        const orgId = req.headers['x-tenant']

        if(!orgId) {
            resp.status(422).json({message: 'Bad credentials'})
        }

        const{nome,cnpj,endereco,bairro,cep,cidade,estado,
            celular,telefone,email,site}=req.body;

        try {
            const getOrg = orgId => {
                return model.orgs.findOne({where: {org_id: orgId}}).then(response => { return response;});
            };
            
            const exists = await getOrg(orgId);
            if(!exists){
                resp.status(404).json({message:'Entidade nao encontrada'})
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
                        let data = response
                        delete data.dataValues.org_id
                        resp.status(200).json(data)
                    })
                });
        } catch (error) {
            resp.status(500).json({message:error})            
        }
    },
};