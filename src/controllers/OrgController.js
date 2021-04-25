const correlator = require('correlation-id');
const { check, validationResult } = require('express-validator');
let model = require('../models/index');
const {logger} = require('../logger/logger');

const getOrg = (cid, orgId) => {
    logger.info( `Tracking [${cid}]. Buscando org=${orgId}`);
    return model.orgs.findOne({where: {org_id: orgId}}).then(response => { return response;});
};

module.exports = {
    async getOrg(cid, orgId){
        return getOrg(cid, orgId);
    },

    async post(req, resp) {
        const {cid} = req
        const role = req.role
        const result = role.indexOf('ALL')

        if(result==-1) {
            logger.warn( `Tracking [${cid}]. Falha ao tentar gerar org=${newOrg}. Usuario sem permissão`);
            return resp.status(401).json({message: "Usuario sem permissão"})            
        }

        let newOrg = correlator.withId(() => {
            return correlator.getId();
        });
        if(!newOrg){
            logger.warn( `Tracking [${cid}]. Falha ao tentar gerar org=${newOrg}`);
            return resp.status(500).json({message: "Problema ao gerar o id"})
        }
        newOrg = 'TN-'+newOrg;
        logger.info( `Tracking [${cid}]. Novo id de org=${orgId}`);

        const{nome,cnpj,endereco,bairro,cep,cidade,estado,
            celular,telefone,email,site,sobre}=req.body;

        logger.info( `Tracking [${cid}]. Criando nova org`);
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
            site: site,
            sobre: sobre
        })
        .then(org=>{
            logger.info( `Tracking [${cid}]. Nova org criada (${org.org_id})`);
            resp.status(201).json(org)
        })
        .catch(error=>{
            logger.error( `Tracking [${cid}]. Erro ao tentar criar org=(${newOrg}), ex=(${error})`);
            resp.status(500).json({message:error});
        });
    },

    async get(req, resp) {
        const {orgId, cid} = req
        getOrg(cid, orgId)
            .then(org=> {
                if(!org) {
                    logger.warn( `Tracking [${cid}]. Nao encontrada org=(${orgId})`);
                    resp.status(400).json({message: 'Entidade nao encontrada'});
                }
                else {
                    logger.info( `Tracking [${cid}].Registro encontrado org=(${org.org_id})`);
                    resp.json(org);
                }
            })
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar buscar org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error})
            });
    },

    async put(req, resp) {
        const {orgId, cid} = req

        const{nome,cnpj,endereco,bairro,cep,cidade,estado,
            celular,telefone,email,site,sobre}=req.body;
        try {
            const exists = await getOrg(cid, orgId);
            if(!exists){
                logger.warn( `Tracking [${cid}]. Registro nao encontrado org=(${orgId})`);
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
                    site: site,
                    sobre: sobre
                },{ where:{
                        org_id: orgId
                    }
                })
                .then(result=>{
                    getOrg(cid, orgId).then(response=>{
                        if(response) {
                            logger.info(`Tracking [${cid}]. Registro atualizado org=(${response.org_id})`);
                            resp.json(response)
                        } else {
                            logger.warn(`Tracking [${cid}]. Registro nao encontrado org=(${orgId})`);
                            resp.status(400).json({message: 'Registro nao encontrado'})
                        }
                    })
                });
        } catch (error) {
            logger.error( `Tracking [${cid}]. Erro ao tentar atualizar org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error})            
        }
    }
};