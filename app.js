var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var logger = require('morgan');
var flash = require('connect-flash');
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var compression = require('compression');
var helmet = require('helmet');

var app = express();

app.use(helmet());

//db connection
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/lib_development';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ key: 'sid',secret: 'keyboard cat', resave: true,
saveUninitialized: true, cookie: { maxAge: 60000 }}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(compression()); //Compress all routes
app.use(express.static(path.join(__dirname, 'public')));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//set current user
app.get('*', function(req, res, next){
  res.locals.current_user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
