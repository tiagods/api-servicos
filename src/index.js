let express = require('express');
let routes = require('./routes/routes')
let cors = require('cors');

let app = express();

app.use(cors())
app.use(express.json())
app.use(routes);

app.listen(3333);