require("dotenv-safe").config();
let jwt = require('jsonwebtoken');

let refreshTokens = [];

module.exports = {

    //depois de logar deve assinar token
    submeterToken(req, res, next) {
        const {usuarioId, orgId, role} =  req;
        const token = jwt.sign({ usuarioId, orgId, role }, process.env.SECRET, {
            expiresIn: 30000 // expires in 5min
        });
        const refreshToken = jwt.sign({ usuarioId, orgId, role }, process.env.REFRESHTOKEN);
        refreshTokens.push(refreshToken);
        return res.json({ token: token, refreshToken: refreshToken });
    },

    obterNovoToken(req, res, next) {
        const { token } = req.headers.authorization;
        if (!token) {
            return res.sendStatus(401).json({message: 'Token invalido'});
        }
        if (!refreshTokens.includes(token)) {
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

    validarToken(req, res, next) {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'No token provided.' });
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err) return res.status(404).json({ message: 'Failed to authenticate token.' });
            req.usuarioId = decoded.usuarioId;
            req.orgId = decoded.orgId;
            req.role = decoded.role;
            next();
        });
    },

    validarOrg(req, resp, next) {
        const orgId = req.headers['x-tenant']
        if(!orgId) {
            return resp.status(401).json({message: 'Bad credentials, tenant not found'})
        }
        const orgAutorizada = req.orgId;
        console.log('OrgTenant='+orgId+'-OrgAutorizada='+orgAutorizada)
        if(orgId != orgAutorizada){
            return resp.status(401).json({message: 'Acesso nao autorizado a essa org'})
        }
        next();
    },

    logout(req, res) {
        const token = req.headers.authorization;
        refreshTokens = refreshTokens.filter(t => t !== token);
        res.json({message: 'Logout ok'});
    }
}