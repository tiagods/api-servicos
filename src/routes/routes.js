const express = require('express');
const correlator = require('correlation-id');

const {submeterToken, logout, validarToken, validarOrg, obterNovoToken} = require('../autenticacao/tokenUser')
const ClienteController = require('../controllers/ClienteController');
const OrgController = require('../controllers/OrgController');
const UsuarioController = require('../controllers/UsuarioController');
const OsController = require('../controllers/OsController');
const routes = express.Router();

routes.post('/login', UsuarioController.login, submeterToken);
routes.post('/renovarToken', obterNovoToken)
routes.post('/logout', logout);

routes.post('/v1/orgs', validarToken, OrgController.post);
routes.get('/v1/orgs', validarToken, validarOrg, OrgController.get);
routes.put('/v1/orgs', validarToken, validarOrg,OrgController.put);

routes.post('/v1/clientes', validarToken, validarOrg,ClienteController.post);
routes.get('/v1/clientes', validarToken, validarOrg, ClienteController.get);
routes.get('/v1/clientes/:clienteId', validarToken, validarOrg, ClienteController.findById);
routes.put('/v1/clientes/:clienteId', validarToken, validarOrg, ClienteController.put);

routes.post('/v1/usuarios', validarToken, validarOrg,UsuarioController.post);
routes.put('/v1/usuarios/:usuarioId', validarToken, validarOrg,UsuarioController.put);
routes.get('/v1/usuarios/:usuarioId', validarToken, validarOrg,UsuarioController.findById);
routes.get('/v1/usuarios', validarToken, validarOrg,UsuarioController.get);

routes.post('/v1/os', validarToken, validarOrg, OsController.post);
routes.put('/v1/os/:osId', validarToken, validarOrg, OsController.put);
routes.get('/v1/os/:osId', validarToken, validarOrg, OsController.findById);
routes.get('/v1/os', validarToken, validarOrg, OsController.findAll);

routes.get('/', function(req, resp){
    console.log(req.path)
    resp.json('Hello world!! ' +correlator.getId())
    console.log('UserId='+req.userId+'=>Org='+req.orgId);
    correlator.withId(() => {
        console.log(correlator.getId()); // Writes a uuid to stdout
    });
})

module.exports = routes;