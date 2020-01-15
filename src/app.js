require('dotenv').config();
import express from "express";
import connectDB from "./config/connectDB";
import viewConfig from "./config/viewConfig";
import initRouter from "./routes/index";
import bodyParser from "body-parser";
import connectFlash from "connect-flash";
import { configSession, sessionStore } from "./config/session";
import passport from "passport";
import http from "http";
import socketio from "socket.io";
import initSockets from "./sockets/index";
import passportSocketIo from "passport.socketio";
import cookieParser from "cookie-parser";
const https = require('https');
const fs = require('fs');
//init app

var sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'liecoin1'
  };

let app = express();
// init server with socket.io
let server = http.createServer(app);
https.createServer(sslOptions, app).listen(443)

let io = socketio(server);
//config database
connectDB();
//config session
configSession(app);
//config view engine
viewConfig(app);
//config body parseur
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Enable err messages
app.use(connectFlash());
app.use(cookieParser());
//config passport
app.use(passport.initialize());
app.use(passport.session());
//config routes
initRouter(app);
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    success: (data, accept) => {
        if(!data.user.logged_in){
            return accept("Invalid User", false);
        }
        return accept(null, true);
    },
    fail: (data, message, error, accept) => {
        if(error){
            console.log("failed connection to socket.io: ", message );
            return accept(new Error(message), false);
        }
    }
}));

//config socket;
initSockets(io);


server.listen(process.env.APP_PORT, ()=>{
    console.log(` listening on port: ${process.env.APP_PORT}`);
});