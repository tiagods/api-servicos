const { check, validationResult } = require('express-validator');
let model = require('../models/index');
const {getCid} = require("../config/correlationId");
const {logger} = require('../logger/logger');
const db = require('../models');

const getUsuario = (cid, orgId, usuarioId) => {
    return model.usuarios.findOne({where: {usuario_id: usuarioId, org_id: orgId}}).then(response => {
        logger.info( `Tracking [${cid}]. Buscando usuario=(${usuarioId}) em org=(${orgId})`);
        return response;
    });
};

module.exports = {
    getUsuario(cid, orgId, usuarioId){
        return getUsuario(cid, orgId, usuarioId);
    },

    async login(req, res, next) {
        const cid = getCid(req);
        req.cid = cid;
        res.header('x-cid', cid);
        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
        const {usuario, senha} = req.body;

        logger.info( `Tracking [${cid}]. Buscando usuario por nome e senha`);
        model.usuarios.findOne({
            where: {
                login: usuario,
                senha: senha,
            }
        })
            .then(result=> {
                if(result) {
                    if(result.ativo != undefined && result.ativo==1) {
                        logger.info(`Tracking [${cid}]. Usuario encontrado (${result.usuario_id})`);
                        req.usuarioId = result.usuario_id;
                        req.orgId = result.org_id;
                        req.role = ['ALL'];
                        req.cid = cid;
                        next();
                    } else {
                        logger.warn( `Tracking [${cid}]. Acesso bloqueado. (${result.usuario_id})`);
                        return res.status(400).json({message: 'Acesso bloqueado, verifique suas permissões de acesso'})
                    }
                } else {
                    logger.warn( `Tracking [${cid}]. Login invalido`);
                    return res.status(400).json({message: 'Login inválido!'});
                }
            })
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar criar novo cliente na org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error});
            });
    },

    async post(req, resp) {
        const {cid, orgId} = req;

        const{usuario,fone,login,senha,perfil,tecnico,ativo}=req.body;

        model.usuarios.findOne({where: {login: login, org_id: orgId}}).then(result=> {
            if(result){
                logger.warn( `Tracking [${cid}]. Ja existe um usuario com esse login=(${result.login}), 
                usuario=(${result.usuario_id})`);
                return resp.status(400).json({message:'Login ja existe'})
            }
        })
        logger.info( `Tracking [${cid}]. Criando novo usuario`);
        model.usuarios.create({
            org_id: orgId,
            usuario: usuario,
            fone: fone,
            login: login,
            senha: senha,
            perfil: perfil,
            tecnico: tecnico? tecnico:true,
            ativo: ativo?ativo:true
        })
            .then(result=>{
                logger.info( `Tracking [${cid}]. Novo usuario criado=(${result.usuario_id}) org=(${orgId}), ex=(${error})`);
                resp.status(201).json(result);
            })
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar criar novo usuario na org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error});
            });
    },

    async put(req, resp) {
        const {cid, orgId} = req;

        const{usuario,fone,senha,perfil,tecnico,ativo}=req.body;
        await check('usuarioId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
            params=(${errors.array()})`);
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const usuarioId = req.params.usuarioId;
        try {
            const result = await getUsuario(cid, orgId, usuarioId);
            if(!result){
                logger.warn( `Tracking [${cid}]. Registro nao existe usuario=(${usuarioId}, org=(${orgId})`);
                return resp.status(400).json({message:'Registro nao existe'})
            }
            model.orgs.update({
                usuario: usuario,
                fone: fone,
                senha: senha ? senha:result.senha,
                perfil: perfil,
                tecnico: tecnico? tecnico:result.tecnico,
                ativo: ativo?ativo:result.ativo
            },{ where:{
                    usuario_id: usuarioId,
                    org_id: orgId
                }
            })
                .then(r=>{
                    getUsuario(cid, orgId,usuarioId).then(response=>{
                        resp.json(response);
                        if(response){
                            logger.info( `Tracking [${cid}]. Registro atualizado usuario=(${usuarioId}, org=(${orgId})`);
                            return resp.json(response);
                        }
                        else {
                            logger.warn(`Tracking [${cid}]. Registro nao encontrado, usuario=(${usuario_id}), org=(${orgId})`);
                            return resp.status(400).json({message: 'Registro nao existe'});
                        }

                    })
                });
        } catch (error) {
            logger.error( `Tracking [${cid}]. Erro ao tentar atualizar usuario=(${usuarioId}), org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        }
    },

    async get(req, resp) {
        const {cid, orgId} = req;

        // const result = await db.sequelize.query('SELECT * FROM cliente WHERE org_id = :orgId', {
        //     replacements: {orgId: orgId},
        //     type: db.sequelize.QueryTypes.SELECT
        // });
        // return resp.json(result);
        logger.info( `Tracking [${cid}]. Listando usuarios da org=(${orgId})`);
        model.usuarios.findAll({
            where: {
                org_id: orgId
            }, logging: console.log
        })
            .then(result=>{
                logger.info( `Tracking [${cid}]. Listando usuarios pela org=(${orgId}). Total=(${result.length})`);
                return resp.json(result)})
            .catch(error=>{
                logger.error( `Tracking [${cid}]. Erro ao tentar listar usuarios org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error});
            });
    },

    async findById(req, resp) {
        const {cid, orgId} = req;

        await check('usuarioId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn(`Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
                params=(${errors.array()})`);
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const usuario_id = req.params.usuarioId;
        getUsuario(cid, orgId, usuario_id)
            .then(result=>{
                if(result) {
                    logger.info(`Tracking [${cid}]. Encontrado usuario=(${usuario_id}), org=(${orgId}).`);
                    resp.json(result)
                }
                else {
                    logger.warn(`Tracking [${cid}]. Registro nao encontrado, usuario=(${usuario_id}), org=(${orgId})`);
                    return resp.status(400).json({message: 'Registro nao existe'});
                }
            })
            .catch(error=>{
                logger.error(`Tracking [${cid}]. Erro ao tentar listar usuarios org=(${orgId}), ex=(${error})`);
                resp.status(500).json({message:error});
            });
    }
}