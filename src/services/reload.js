const luna = require('lunawallet')
const wallet = require('./checkBalance')
const eth = luna.new_eth('mainnet',process.env.infura)
const wbt_abi = require('./../wbt.json')
const wbt_contract = luna.new_contract(eth,wbt_abi,process.env.wbt_at)

//connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/swap',{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },(err)=>{})

//Schema
var Schema = mongoose.Schema;

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

Member.find((err,res)=>{
    for (let i=0;i<res.length;i++){
        console.log(res[i].wallet.wbt.address)
        luna.token_monitor(wbt_contract, res[i].wallet.wbt.address, txs =>{
            let tx = {
                coin: 'wbt',
                hash: txs.transactionHash,
                value: txs.args.value/Math.pow(10,18),
                address: _address.eth
            }
            wallet._deposit(tx)
        })
    }
})