const DB = require('./../models/walletModel')
const luna = require('lunawallet')
const wallet = require('./checkBalance')
const eth = luna.new_eth('mainnet',process.env.infura)
const wbt_abi = require('./../wbt.json')
const wbt_contract = luna.new_contract(eth,wbt_abi,process.env.wbt_at)

//connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/swap',{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },(err)=>{})
let Schema = mongoose.Schema;
//Schema
DB.Member.find((err,res)=>{
    for (let i=0;i<res.length;i++){
        if (res[i].wallet.wbt.address !== 'empty') {
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
    }
})