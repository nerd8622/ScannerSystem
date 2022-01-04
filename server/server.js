const https = require('https');
const crypto = require("crypto");
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const path = require('path');
const schedule = require('node-schedule');
const csvParse = require('csv-parse');
const csvWriter = require('csv-writer');
const { passwords, secret, certphrase, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = require('./credentials.js');
const GoogleDrive = require('./gdrive.js');

var options = {
  key: fs.readFileSync(`${__dirname}/keys/selfsigned.key`),
  cert: fs.readFileSync(`${__dirname}/keys/selfsigned.crt`),
  passphrase: certphrase
};

const driveClient = new GoogleDrive(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN);

const students = {};
const livestudents = {};

fs.createReadStream(`${__dirname}/student_list.csv`).pipe(csvParse())
  .on('data', (data) => students[data[1]] = data.slice(2,4)).on('end', () => {
  console.log("loaded student database!")});

let rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.tz = "America/Denver";

schedule.scheduleJob(rule, () => {
  let day = new Date().toLocaleDateString('en-US', { timeZone: 'America/Denver' });
  driveClient.copyFile("1L8s_8B6sI2agZ02y3vCbO5xI6wMpxyOZASeFqxG9M_g", day).then(
    setTimeout(() => {  driveClient.clearSheet("1L8s_8B6sI2agZ02y3vCbO5xI6wMpxyOZASeFqxG9M_g"); }, 650));
  console.log("Updated Log File for New Day")
});

const csvStringifier = csvWriter.createArrayCsvStringifier({
  header: ["TIME", "TYPE", "ID", "LAST", "FIRST"],
});

fs.writeFile(`${__dirname}/scan_log.csv`, csvStringifier.getHeaderString(), (err) => {});

const log = (id, type) => {
  let time = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
  let data = [time, type, id, ...students[id]];
  let logString = csvStringifier.stringifyRecords([data]);
  fs.appendFile(`${__dirname}/scan_log.csv`, logString, (err) => {});
  driveClient.appendSheet("1L8s_8B6sI2agZ02y3vCbO5xI6wMpxyOZASeFqxG9M_g", data);
  console.log(`Event: ${time} | ${type} | ${id}`);
  return [time, id, ...students[id]];
};

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
    let data = log(id, "in");
    if (!livestudents[id]){
      livestudents[id] = data;
      sock.to("admins").emit("in", livestudents[id]);
    }
	});
	sock.on('out', (id) => {
    if (!students[id]){return;}
    log(id, "out");
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
