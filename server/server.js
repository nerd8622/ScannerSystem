const https = require('https');
const crypto = require("crypto");
const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');
const csvParse = require('csv-parse');
const csvWriter = require('csv-writer');
const { passwords, secret, certphrase } = require('./credentials.js');

var options = {
  key: fs.readFileSync(`${__dirname}/keys/selfsigned.key`),
  cert: fs.readFileSync(`${__dirname}/keys/selfsigned.crt`),
  passphrase: certphrase
};

const students = {};
const livestudents = {};
fs.createReadStream(`${__dirname}/student_list.csv`).pipe(csvParse())
  .on('data', (data) => students[data[1]] = data.slice(2,4)).on('end', () => {
  console.log("loaded student database!")});

const logger = csvWriter.createArrayCsvWriter({
  path: `${__dirname}/scan_log.csv`,
  header: ["TIME", "TYPE", "ID", "LAST", "FIRST"]
});

const sessionMiddleware = session({
  secret: secret,
  resave: true,
  saveUninitialized: true
});

const app = express();

app.use(express.static(`${__dirname}/../client/static`));
app.use(express.urlencoded({extended: true}));
app.use(sessionMiddleware);

const port = 443;
const server = https.createServer(options, app);
const io = socketio(server);
io.use((socket, next) => {sessionMiddleware(socket.request, {}, next);});

app.post('/auth', (req, res) => {
  let username = req.body.usr;
  let password = crypto.createHash("sha256").update(req.body.psw).digest("base64");
  if (username && password) {
    if (passwords[username] == password) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/admin');
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
  res.sendFile(path.join(__dirname, '/../client/index.html'));
});

app.get('/admin', (req, res) => {
  if (!req.session.loggedin){res.redirect('/login');}
  else{res.sendFile(path.join(__dirname, '/../client/admin/index.html'));}
});

app.get('/download', (req, res) => {
  if (!req.session.loggedin){res.redirect('/login');}
  else{res.download(`${__dirname}/scan_log.csv`);}
});

io.on('connection', (sock) => {
  const username = sock.request.session.username;
  if (username){
	  sock.join("admins");
	  sock.emit("init", Object.values(livestudents));
  }
  sock.on('in', (id) => {
    if (!students[id]){return;}
    let time = new Date().toUTCString();
    logger.writeRecords([[time, "in", id, ...students[id]]]).then(() => {console.log(`Event: ${time} | in | ${id}`);});
    if (!livestudents[id]){
      livestudents[id] = [time, id, ...students[id]];
      sock.to("admins").emit("in", livestudents[id]);
    }
	});
	sock.on('out', (id) => {
    if (!students[id]){return;}
    let time = new Date().toUTCString();
    logger.writeRecords([[time, "out", id, ...students[id]]]).then(() => {console.log(`Event: ${time} | out | ${id}`);});
	  sock.to("admins").emit("out", id);
	  delete livestudents[id];
	});
});

server.on('error', (error) => {
  console.log('An error has occured: ' + error);
});

server.listen(port, () => {
  console.log('Https server running on port ' + port);
});
