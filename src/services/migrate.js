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

let schemaUser = new Schema({
    username: String,
    phone: { type: Number, default: null },
    address: { type: String, default: null },
    role: { type: String, default: "user" },
    local: {
        email: { type: String, trim: true },
        password: String,
        isActive: { type: Boolean, default: false },
        verifyToken: String,
        tokenRecoverPassword: { type: String, default: null }
    },
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
})

var User = mongoose.model('User', schemaUser,'users');

const user = new User({
    username: "wbtadmin",
    role: "admin",
    local: {
        isActive: true,
        email: "wbtadmin@gmail.com",
        password: "$2a$07$eXZw64iQS4dsfQ3.IfHTpO3trfP25Z7gTUewKxX6qZ7UMI5yIVWPq",
        tokenRecoverPassword: null,
        verifyToken: null,
    }
})
user.save()

let schemaMember = new Schema({
    id: {
        type: String,
        default: "wbtadmin"
    },
    index: {type: Number, default: 0},
    timestamps:{type: Number, default: 1500000000000.0},
    wallet:{
        btc:{
            address:{type: String, default: 'empty'},
            balance:{type: Number, default: 0}, //So du kha dung
            pending:{type: Number, default: 0} //So du dang cho <khong kha dung>
        },
        wbt:{
            address:{type: String, default: 'empty'},
            balance:{type: Number, default: 0},
            pending:{type: Number, default: 0}
        },
        history: {
            deposit: [{
                timestamps:{type: Date, default: Date.now}, //Dau thoi gian
                currency: {type: String, default: 'empty'}, //Loai tien
                tx:{type: String, default: 'empty'}, //tx
                amount:{type: Number, default: 0}, //Luong tien
            }],
            withdraw: [{
                timestamps:{type: Date, default: Date.now},
                currency: {type: String, default: 'empty'},
                tx:{type: String, default: 'empty'},
                amount:{type: Number, default: 0},
            }],
            swap: [{
                timestamps:{type: Date, default: Date.now}, //dau thoi gian
                from: {type: String, default: 'empty'}, //loai tien doi
                to: {type: String, default: 'empty'}, // Loai tien duoc doi
                amount:{type: Number, default: 0}, //so luong
                rate: {type: Number, default: 0}, //ty gia
            }]
        },
    },
  },
  {
    versionKey: false,
    timestamps: false
  });

let Member = mongoose.model('Member', schemaMember,'members'); 

const member = new Member({})
member.save()