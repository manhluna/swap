const mongoose = require('mongoose');

//Schema
let Schema = mongoose.Schema;

let schemaAdmin = new Schema({
    role: {type:String, default: 'admin'},
    totalbtc:{type: Number, default:0},
    totalwbt:{type: Number, default:0},
    pricewbt:{type: Number, default:0},
    totaluser: {type: Number, default:0},
},{
    versionKey: false,
    timestamps: false
})

let schemaMember = new Schema({
        id: {
            type: String,
            default: "empty"
        },
        index: {type: Number, default: 0},
        timestamps:{type: Number, default: 0},
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

let Member = mongoose.model('Member', schemaMember,'members'); // members: name of collection
let Admin = mongoose.model('Admin', schemaAdmin,'admins');

module.exports ={
    Member: Member,
    Admin: Admin
}
