var http = require('http');
var express = require('express');
var webpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var share = require('./share');
var database = require('./database')
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash') // session 관련해서 사용됨. 로그인 실패시 session등 클리어하는 기능으로 보임.
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var devPort = 4001;

var server = http.createServer(app);

//serializer와 deseriazlier는 필수로 구현해야 함.

// 인증 후, 사용자 정보를 Session에 저장함
passport.serializeUser(function(user, done) {
    console.log('serialize');
    done(null, user);
});

// 인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.
passport.deserializeUser(function(user, done) {
    //findById(id, function (err, user) {
    console.log('deserialize');
    console.log(user);
    done(null, user);
    //});
});


passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }
    ,function(req,email, password, done) {
        if(email=='hello@naver.com' && password=='world'){
            var user = { 'userid':'hello',
                          'email':'hello@naver.com'};
            return done(null,user);
        }else{
            return done(null,false);
        }
    }
));


if(process.env.NODE_ENV === 'development'){
    console.log('Server is running on development mode');

    var config = require('../webpack.dev.config');
    var compiler = webpack(config);
    var devServer = new webpackDevServer(compiler, config.devServer);
    devServer.listen(devPort, () => {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded());
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
resave: false,
saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static(__dirname + '/../build'));




database.init(function(error, db){ // database init
    if(error) {
      console.log(error);
    }
    app.db = db;  //app.db 초기화
});



app.get('/login', function(req, res){
  res.render('login');
})
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        res.render('home');
    });

app.get('/project', function(req, res){  // 프로젝트의 파일 목록
  //var query = { name:req.params.project };
  var cursor = req.app.db.collection('project').find();
  cursor.each(function(err,doc){
    if(err){
      console.log(err);
    }else{
      if(doc != null){
        console.log(doc);  // doc 은 1개씩 읽어들이는 json
      }
    }
  });
});
app.get('/login/confirm', function(req, res){
  //var query = { email : req.params.email , password : req.params.password };
  var cursor = req.app.db.collection('user').find();
  cursor.each(function(err,doc){
    if(err){
      console.log(err);
    }else{
      if(doc != null){
        console.log(doc); //로그인 가능한지 확인
      }
    }
  });
});


//shareDB 처리기
share.init(server);

server.listen(port, function (err) {
    if (err) {
        throw err;
    }
    console.log('Express listening on port', port);
});
function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/login');
}
