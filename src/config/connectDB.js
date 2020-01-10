import mongoose from "mongoose";
import bluebird from "bluebird";

/**
 * connect Mongodb
 */

let connectDB = ()=>{
    mongoose.promise = bluebird;
    //mongodb://localhost:27017/astra
    let URI = `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    return mongoose.connect(URI, { useUnifiedTopology: true,useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
};
module.exports = connectDB;