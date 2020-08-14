const correlator = require('express-correlation-id');
var express = require('express');
var routes = require('./routes/routes')
var cors = require('cors');

var app = express();

app.use(cors())
app.use(correlator());
app.use(express.json())
app.use(routes);

app.listen(3333);