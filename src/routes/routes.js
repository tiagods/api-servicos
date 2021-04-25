const express = require('express');
const {getCid} = require('../config/correlationId')
const {logger} = require('../logger/logger');
const {submeterToken, logout, validarTokenOrg, obterNovoToken} = require('../autenticacao/tokenUser')
const ClienteController = require('../controllers/ClienteController');
const OrgController = require('../controllers/OrgController');
const UsuarioController = require('../controllers/UsuarioController');
const OsController = require('../controllers/OsController');
const routes = express.Router();

routes.post('/login', UsuarioController.login, submeterToken);
routes.post('/renovarToken', obterNovoToken)
routes.post('/logout', logout);

routes.get('/validarToken', validarTokenOrg, function(req, resp){
    resp.json({message: 'Autenticacao valida'})
});

routes.post('/v1/orgs', validarTokenOrg, OrgController.post);
routes.get('/v1/orgs', validarTokenOrg, OrgController.get);
routes.put('/v1/orgs', validarTokenOrg, OrgController.put);

routes.post('/v1/clientes', validarTokenOrg, ClienteController.post);
routes.get('/v1/clientes', validarTokenOrg, ClienteController.get);
routes.get('/v1/clientes/:clienteId', validarTokenOrg, ClienteController.findById);
routes.put('/v1/clientes/:clienteId', validarTokenOrg, ClienteController.put);

routes.post('/v1/usuarios', validarTokenOrg, UsuarioController.post);
routes.put('/v1/usuarios/:usuarioId', validarTokenOrg,UsuarioController.put);
routes.get('/v1/usuarios/:usuarioId', validarTokenOrg,UsuarioController.findById);
routes.get('/v1/usuarios', validarTokenOrg, UsuarioController.get);

routes.post('/v1/os', validarTokenOrg, OsController.post);
routes.put('/v1/os/:osId', validarTokenOrg, OsController.put);
routes.get('/v1/os/:osId', validarTokenOrg, OsController.findById2);
routes.get('/v1/os', validarTokenOrg, OsController.findAll);

routes.get('/', function(req, resp, next) {
    let cid = getCid(req)
    resp.header('x-cid', cid);
    logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);
    resp.json('Hello world!! ' +cid)
})

routes.post('/nova-senha', function(req, resp, next) {
    let cid = getCid(req)
    resp.header('x-cid', cid);
    logger.info( `Tracking [${cid}]. Request from ${req.method} ${req.path}`);

    resp.json('Hello world!! ' +cid)
})

module.exports = routes;