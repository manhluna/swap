import express from "express";
import expressEjsExtend from "express-ejs-extend";

/**
 * config view engine
 */
let viewConfig = (app)=>{
    app.use(express.static("./src/public"));
    app.engine("ejs", expressEjsExtend);
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
};

module.exports = viewConfig;