
var express = require('express'),
app = express(),
port = process.env.PORT || 3000;

var routes = require('./routers/routers'); //importing route
console.log('RESTful API server started on: ' + port);


app.listen(port);










