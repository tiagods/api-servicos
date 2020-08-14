const express = require('express');
const correlator = require('express-correlation-id');
const OrgController = require('../controllers/OrgController');
const routes = express.Router();

routes.get('/orgs', OrgController.get);
routes.put('/orgs', OrgController.put);

routes.get('/clientes/')

routes.get('/', function(req, resp){
    resp.json('Hello world!!' +correlator.getId())
})

module.exports = routes;