const { check, validationResult } = require('express-validator');
let model = require('../models/index');
const {getCid} = require("../config/correlationId");
const {logger} = require('../logger/logger');
const db = require('../models');
const bcrypt = require('bcryptjs');

const perfils = [
    'ADMIN',
    'COMUM'
]

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

    async login(req, resp, next) {
        const cid = getCid(req);
        req.cid = cid;
        resp.header('x-cid', cid);
        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
        const {login, senha} = req.body;

        logger.info( `Tracking [${cid}]. Buscando usuario por nome`);
        model.usuarios.findOne({
            where: {
                login: login,
                senha: senha,
            }
        })
            .then( result => {
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
                        return resp.status(400).json({message: 'Acesso bloqueado, verifique suas permissões de acesso'})
                    }
                } else {
                    logger.warn( `Tracking [${cid}]. Login invalido`);
                    return resp.status(401).json({ message: 'Login inválido! Tente novamente'});
                }
            })
            .catch(error => {
                    logger.error( `Tracking [${cid}]. Erro ao tentar logar do usuario=(${usuario}), ex=(${error})`);
                    return resp.status(500).json({ message: error});
            });
    },

    async post(req, resp) {
        const {cid, orgId} = req;

        let {usuario,fone,login,senha,perfil,tecnico,ativo}=req.body;

        if(tecnico===undefined) {
            tecnico = false
        }
        if(ativo === undefined) {
            ativo = true
        }

        if(perfil === undefined) {
            perfil = 'COMUM'
        } else {
            const perfilresult = perfils.find(element => element === perfil)
            if(!perfilresult){
                const message = `Perfil informado é invalido ${perfil}`
                logger.warn( `Tracking [${cid}]. ${message}`);
                return resp.status(400).json({message: message})
            }
        }

        if(!usuario || !fone || !login || !senha || !orgId) {
            const message = 'Cancelado criacao de usuario por falta de parametro'
            logger.warn( `Tracking [${cid}]. ${message}`);
            return resp.status(400).json({message: message})
        }
        if(login.length <= 4) {
            const message = 'Cancelado criacao de usuario por login invalido (acima de 4 caracteres)'
            logger.warn( `Tracking [${cid}]. ${message}`);
            return resp.status(400).json({message: message})
        }
        if(senha===login || senha.length <= 4) {
            const message = 'Cancelado criacao de usuario por senha invalida (acima de 4 caracteres)'
            logger.warn( `Tracking [${cid}]. ${message}`);
            return resp.status(400).json({message: message})
        }

        model.usuarios.findOne({where: {login: login, org_id: orgId}}).then(result=> {
            if(result){
                logger.warn( `Tracking [${cid}]. Ja existe um usuario com esse login=(${result.login}), 
                usuario=(${result.usuario_id})`);
                return resp.status(400).json({message:'Login ja existe'})
            }
        })

        try {
            logger.info( `Tracking [${cid}]. Criando novo usuario`);
        
            model.usuarios.create({
                org_id  : orgId,
                usuario : usuario,
                fone    : fone,
                login   : login,
                senha   : senha,
                perfil  : perfil,
                tecnico : tecnico? 1:true,
                ativo   : ativo? 1:true
            })
            .then(result => {
                logger.info( `Tracking [${cid}]. Novo usuario criado=(${result.usuario_id}) org=(${orgId})`);
                return resp.status(201).json(result);
            })
        } catch (error) {
            logger.error( `Tracking [${cid}]. Erro ao tentar criar novo usuario na org=(${orgId}), ex=(${error})`);
            resp.status(500).json({message:error});
        }

    },

    async put(req, resp) {
        const {cid, orgId} = req;

        const {usuario,fone,senha,perfil,tecnico,ativo}=req.body;

        await check('usuarioId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.warn( `Tracking [${cid}]. Parametros invalidos na requisicao org=(${orgId}), 
            params=(${errors.array()})`);
            return resp.status(400).json({
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

            let senhaBcryp = senha ? senha : result.senha

            const statusTecnico = (tecnico===undefined) ? result.tecnico : (tecnico? 1 : 0)
            const statusAtivo = (ativo===undefined) ? result.ativo : (ativo? 1 : 0)

            let perfilFinal = perfil
            if(perfil === undefined) {
                perfilFinal = result.perfil
            } else {
                const perfilresult = perfils.find(element => element === perfil)
                if(!perfilresult){
                    const message = `Perfil informado é invalido ${perfil}`
                    logger.warn( `Tracking [${cid}]. ${message}`);
                    return resp.status(400).json({message: message})
                }
            }

            model.usuarios.update({
                usuario: usuario,
                fone: fone,
                senha: senhaBcryp,
                perfil: perfilFinal,
                tecnico: statusTecnico,
                ativo: statusAtivo
            },{ where:{
                    usuario_id: usuarioId,
                    org_id: orgId
                }
            })
                .then(r=>{
                    getUsuario(cid, orgId, usuarioId).then(response=> {
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
            return resp.status(400).json({
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