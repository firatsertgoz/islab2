
var express = require('express'),
app = express(),
port = process.env.PORT || 3000;
bodyParser = require('body-parser');
var routes = require('./routers/routers'); //importing route
routes(app);
console.log('RESTful API server started on: ' + port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port);










