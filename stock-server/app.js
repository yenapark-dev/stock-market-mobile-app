var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require("helmet"); 
var cors = require("cors"); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var options = require("./knexfile.js");
const knex = require("knex")(options);
var app = express();

app.use(cors());
app.use(express.json());
  
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter)

module.exports = app;
