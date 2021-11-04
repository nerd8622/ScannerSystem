const http = require('http');
const crypto = require("crypto");
const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const sessionMiddleware = session({
  secret: secretStr,
  resave: true,
  saveUninitialized: true
});

const app = express();

app.use(express.static(`${__dirname}/../client/static`));
app.use(express.urlencoded({extended: true}));
app.use(sessionMiddleware);

const port = 8123;
const server = http.createServer(app);
const io = socketio(server);
io.use((socket, next) => {sessionMiddleware(socket.request, {}, next);});

app.post('/auth', (req, res) => {
  let username = req.body.usr;
  let password = crypto.createHash("sha256").update(req.body.psw).digest("base64");
  if (username && password) {
    if (username == "" && password == "") {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/');
    } else {
      res.send('Incorrect Username and/or Password!');
    }
  } else {
  res.send('Please enter Username and Password!');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/../client/login/index.html'));
});

app.get('/', (req, res) => {
  if (!req.session.loggedin){res.redirect('/login');}
  res.sendFile(path.join(__dirname, '/../client/index.html'));
});

io.on('connection', (sock) => {
	
});

server.on('error', (error) => {
  console.log('An error has occured: ' + error);
});

server.listen(port, () => {
  console.log('Http server running on port ' + port);
});
