//connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/swap',{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },(err)=>{})

//Schema
var Schema = mongoose.Schema;

var schemaAdmin = new Schema({
    role: {type:String, default: 'admin'},
    totalbtc:{type: Number, default:0},
    totalwbt:{type: Number, default:0},
    pricewbt:{type: Number, default:0},
},{
    versionKey: false,
    timestamps: false
})

var Admin = mongoose.model('Admin', schemaAdmin,'admins');

const admin = new Admin({
    pricewbt: 1.28,
})
admin.save()