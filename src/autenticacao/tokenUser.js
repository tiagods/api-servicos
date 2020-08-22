require("dotenv-safe").config();
let jwt = require('jsonwebtoken');
const {getCid} = require('../config/correlationId')
const {logger} = require('../logger/logger');

let refreshTokens = [];

module.exports = {
    validarTokenOrg(req, res, next) {
        const cid = getCid(req);
        res.header('x-cid', cid);
        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);

        let token = req.headers.authorization;
        const orgId = req.headers['x-tenant']

        if (!token) {
            logger.warn( `Tracking [${cid}]. No token provided`);
            return res.status(401).json({ message: 'No token provided.' });
        }
        if(!orgId) {
            logger.warn( `Tracking [${cid}]. Tenant not found`);
            return res.status(401).json({message: 'Bad credentials, tenant not found'})
        }
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err) return res.status(404).json({ message: 'Failed to authenticate token.' });
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

        logger.info( `Tracking [${cid}]. Gerando token para o usuario=${usuarioId}`);
        const token = jwt.sign({ usuarioId, orgId, role }, process.env.SECRET, {
            expiresIn: 30000 // expires in 5min
        });
        const refreshToken = jwt.sign({ usuarioId, orgId, role }, process.env.REFRESHTOKEN);
        refreshTokens.push(refreshToken);
        return res.json({ token: token, refreshToken: refreshToken });
    },

    obterNovoToken(req, res, next) {
        const cid = getCid(req);
        res.header('x-cid', cid);

        logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
        const { token } = req.headers.authorization;
        if (!token) {
            logger.warn( `Tracking [${cid}]. Token invalido`);
            return res.sendStatus(401).json({message: 'Token invalido'});
        }
        if (!refreshTokens.includes(token)) {
            logger.warn( `Tracking [${cid}]. Tentativa de refresh token invalido`);
            return res.sendStatus(403).json({message: 'Refresh token invalido'});
        }

        jwt.verify(token, process.env.REFRESHTOKEN, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            const token = jwt.sign({ usuarioId: user.usuarioId, orgId: user.orgId, role: user.role }, process.env.SECRET, { expiresIn: 30000 });
            res.json({token: token});
        });
    },

    logout(req, res) {
        const cid = getCid(req);
        const token = req.headers.authorization;
        logger.warn( `Tracking [${cid}]. Deslogando e encerando vida do token`);
        refreshTokens = refreshTokens.filter(t => t !== token);
        res.json({message: 'Logout ok'});
    }
}