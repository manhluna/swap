require("dotenv").config()
import session from "express-session";
import connectMongo from "connect-mongo";

let MongoStore = connectMongo(session);


/**
 * save session in mongodb
 */
let sessionStore = new MongoStore({
    url: `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    autoReconnect: true
});
/**
 * config session
 * @param app from express module
 */
let configSession = (app)=>{
    app.use(session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000*60*60*24, // 1 day
        }
    }));
};

module.exports = {
    configSession: configSession,
    sessionStore: sessionStore
};