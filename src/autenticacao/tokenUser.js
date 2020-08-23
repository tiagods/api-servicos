require("dotenv-safe").config();
let jwt = require('jsonwebtoken');
const {getCid} = require('../config/correlationId')
const {logger} = require('../logger/logger');

let refreshTokens = [];

module.exports = {
    validarTokenOrg(req, res, next) {
        const cid = getCid(req);
        req.cid = cid;
        res.header("Content-Type", "application/json");
        res.header('x-cid', cid);
        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);

        let token = req.headers.authorization;
        const orgId = req.headers['x-tenant'];

        if (!token) {
            logger.warn( `Tracking [${cid}]. Nenhum token encontrado`);
            return res.status(422).json({ message: 'Nenhum token encontrado.'});
        }
        if(!orgId) {
            logger.warn( `Tracking [${cid}]. Tenant nao encontrato`);
            return res.status(422).json({message: 'Falta de credenciais, tenant nao encontrado'})
        }
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err) {
                logger.error( `Tracking [${cid}]. Falha ao tentar authenticate token`);
                return res.status(403).json({ message: 'Falha ao tentar authenticate token.' });
            }
            req.usuarioId = decoded.usuarioId;
            req.orgId = decoded.orgId;
            req.role = decoded.role;
            const orgAutorizada = decoded.orgId;
            if(orgId != orgAutorizada){
                logger.warn( `Tracking [${cid}]. Acesso negado a org= ${orgId}, org permitida=${orgAutorizada}, usuario=${decoded.usuarioId}`);
                return res.status(401).json({message: 'Acesso nao autorizado a essa org'})
            }
            next()
        });
    },

    //depois de logar deve assinar token
    submeterToken(req, res, next) {
        const {usuarioId, orgId, role, cid} =  req;

        logger.info( `Tracking [${cid}]. Gerando token e tokenRefresh para o usuario=${usuarioId}`);
        const token = jwt.sign({ usuarioId, orgId, role }, process.env.SECRET, {
            expiresIn: 30000 // expires in 5min
        });
        const refreshToken = jwt.sign({ usuarioId, orgId, role }, process.env.REFRESHTOKEN);
        refreshTokens.push(refreshToken);
        logger.info( `Tracking [${cid}]. Tokens gerados com sucesso para o usuario=${usuarioId}`);
        return res.json({ org_id: orgId, token: token, refreshToken: refreshToken });
    },

    obterNovoToken(req, res, next) {
        const cid = getCid(req);
        res.header('x-cid', cid);

        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
        logger.info( `Tracking [${cid}]. Gerando  novo token para o usuario=${usuarioId}`);
        const { token } = req.headers.authorization;
        if (!token) {
            logger.warn( `Tracking [${cid}]. Token invalido ou nao informado`);
            return res.status(422).json({message: 'Token invalido ou nao informado'});
        }
        if (!refreshTokens.includes(token)) {
            logger.warn( `Tracking [${cid}]. Tentativa de refresh token invalido`);
            return res.status(403).json({message: 'Refresh token invalido'});
        }

        jwt.verify(token, process.env.REFRESHTOKEN, (err, user) => {
            if (err) {
                logger.error( `Tracking [${cid}]. Falha ao tentar validar token`);
                return res.status(403).json('Falha ao tentar validar token');
            }
            const token = jwt.sign({ usuarioId: user.usuarioId, orgId: user.orgId, role: user.role }, process.env.SECRET, { expiresIn: 30000 });
            logger.info( `Tracking [${cid}]. Token renovado para o usuario=${usuarioId}`);
            res.json({token: token});
        });
    },

    logout(req, res) {
        const cid = getCid(req);
        const token = req.headers.authorization;
        logger.info( `Tracking [${cid}]. Deslogando e encerando vida do token`);
        refreshTokens = refreshTokens.filter(t => t !== token);
        res.json({message: 'Logout ok'});
    }
}