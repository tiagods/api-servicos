const { check, validationResult } = require('express-validator');
let model = require('../models/index');
const {getCid} = require("../config/correlationId");
const {logger} = require('../logger/logger');

const getUsuario = (orgId, usuarioId) => {
    return model.usuarios.findOne({where: {usuario_id: usuarioId, org_id: orgId}}).then(response => {
        return response;
    });
};

module.exports = {
    getUsuario(orgId, usuarioId){
        return getUsuario(orgId, usuarioId);
    },

    async login(req, res, next) {
        const cid = getCid(req);
        req.cid = cid;
        res.header('x-cid', cid);
        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
        const {usuario, senha} = req.body;

        model.usuarios.findOne({
            where: {
                login: usuario,
                senha: senha
            }
        }).then(result=> {
            if(result){
                req.usuarioId = result.usuario_id;
                req.orgId = result.org_id;
                req.role = ['ALL'];
                next();
            }
            else {
                logger.warn( `Tracking [${cid}]. Login invalido`);
                return res.status(400).json({message: 'Login inválido!'});
            }
        }).catch(error=>{res.status(500).json({message:error})});
    },

    async post(req, resp) {
        const orgId = req.orgId;
        const{usuario,fone,login,senha,perfil,tecnico,ativo}=req.body;

        model.usuarios.findOne({where: {login: login, org_id: orgId}}).then(result=> {
            if(result){
                return resp.status(400).json({message:'Login ja existe'})
            }
        })

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
            .then(org=>{resp.status(201).json(org);})
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async put(req, resp) {
        const orgId = req.orgId
        const{usuario,fone,senha,perfil,tecnico,ativo}=req.body;
        await check('usuarioId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }
        const usuarioId = req.params.usuarioId;
        try {
            const result = await getUsuario(orgId, usuarioId);
            if(!result){
                return resp.status(404).json({message:'Registro nao existe'})
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
                    getUsuario(orgId,usuarioId).then(response=>{
                        resp.json(response);
                    })
                });
        } catch (error) {
            resp.status(500).json({message:error})
        }
    },

    async get(req, resp) {
        const orgId = req.orgId
        model.usuarios.findAll({
            where: {
                org_id: orgId
            }
        })
            .then(result=>{
                return resp.json(result)})
            .catch(error=>{resp.status(500).json({message:error})});
    },

    async findById(req, resp) {
        const orgId = req.orgId
        await check('usuarioId').isInt().run(req);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return resp.status(422).json({
                message:'Argumentos invalidos',
                errors:errors.array()
            })
        }

        const usuario_id = req.params.usuarioId;
        getUsuario(orgId, usuario_id)
            .then(result=>{resp.status(200).json(result)})
            .catch(error=>{resp.status(500).json({message:error})});
    }
}