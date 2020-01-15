require('dotenv').config()
const {price, wsPrice } = require('./price');
const DB = require('./../models/walletModel')
const luna = require('lunawallet')
const eth = luna.new_eth('mainnet',process.env.infura)
const wbt_abi = require('./../wbt.json')
const wbt_contract = luna.new_contract(eth,wbt_abi,process.env.wbt_at)

const MyWallet = require('blockchain.info/MyWallet')
const options = {
    apiCode: process.env.apiCode,
    apiHost: process.env.apiHost
}
const Vi = new MyWallet(process.env.apiId, process.env.apiPassword, options)

const Receive = require('blockchain.info/Receive')
const myReceive = new Receive(process.env.xpubKey, process.env.webhook, process.env.apiCode,{
__unsafe__gapLimit: 100,
})

const map = new Map();
const N = (arg)=>{
    return arg === undefined || arg === null || arg === '' || arg === {}
}

const O = (key,value)=>{
    if (typeof key === 'string') {
        key = [key]
        value = [value]
    }
    let obj = {}
    for (let i=0;i<key.length;i++){
        obj[key[i]] = value[i]
    }
    return obj
}

function history(currency,tx,amount){
    this.currency = currency;
    this.tx = tx;
    this.amount = amount;
}

function swaphistory(from,to,amount,rate){
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.rate = rate;
}

const getUserID = (id,cb) => {
    DB.Member.findOne({id: id}, (err,res) =>{
        cb(res)
    })
}

const getUserAR = (filter,cb) => {
    DB.Member.findOne(filter, (err,res) =>{
        cb(res)
    })
}

const getAdmin = (cb) => {
    DB.Admin.findOne({role: 'admin'}, (err,res) =>{
        cb(res)
    })
}

// const getAllUser = (cb1,cb2) => {
//     DB.Member.find((err,res) => {
//         cb1(res)
//     })

//     DB.User.find((err,res) => {
//         cb2(res)
//     })
// }

const keyBtc = (index) =>{
    return luna.btc_wallet(process.env.phrase, index).PrivateKey
}

const path = (timestamp)=>{
    return ~~(timestamp*Math.pow(10,-2) - 15*Math.pow(10,9))
}

const keyEth = (timestamps) =>{
    let index = path(timestamps)
    return luna.eth_wallet(process.env.phrase, index).key.slice(2,66)
}

//kiem tra so du
function _balance(currency,id,amount,cb){
    DB.Member.findOne({id:id},`wallet.${currency}.balance`,(err,res)=>{
        let cur = currency
        cb({value: res.wallet[cur].balance, comfirm: res.wallet[cur].balance >= amount})
    })   
}

const addressTo = (path)=>{
    return {
        eth: luna.eth_wallet(process.env.phrase,path).address,
        ekey: luna.eth_wallet(process.env.phrase,path).key.slice(2,66)
    }
}

const _deposit = (tx)=>{
    const dep = new history(tx.coin, tx.hash, tx.value)
    const filter = O(`wallet.${tx.coin}.address`,tx.address)
    const up_member = O(`wallet.${tx.coin}.balance`,tx.value)
    const up_admin = O(`total${tx.coin}`,tx.value)
    DB.Member.updateOne(filter,{$inc: up_member, $push: {'wallet.history.deposit': dep}},{new: true, safe: true, upsert: true},(err,res)=>{
        getUserAR(filter, user => event_handle(user))
    })
    DB.Admin.updateOne({role: 'admin'},{$inc: up_admin},{new: true},(err,res)=>{})
}

const _setaddress = (id,address,bit_address)=>{
    DB.Admin.findOne({role: 'admin'},(err,res)=>{
        DB.Member.updateOne({id: id},{$set:{'wallet.btc.address': bit_address, 'wallet.wbt.address': address.eth, 'index': res.totaluser +1}},{new: true},(err,res)=>{
            getUserID(id, user => event_handle(user))
        })
    })
    DB.Admin.updateOne({role:'admin'},{$inc:{'totaluser': 1}},{new:true},(err,res)=>{

    })
}

const _withdraw = (id,coin,address,amount)=>{
    _balance(coin,id,amount, res => {
        if (res.comfirm) {
            const sr = addressTo(process.env.root)
            switch (coin)
            {
                case 'btc':{
                    Vi.getAccountBalance(0)
                    .then((bit) => {
                        if (bit.balance > amount*Math.pow(10,8)) {

                            Vi.send(address,amount*Math.pow(10,8),{
                                from: 0,
                                feePerByte: 6
                            })
                            .then((tx) => handle_withdraw(id,coin,tx.tx_hash,amount))
                            .catch((err) => console.log(err))
                        }
                    })
                    .catch((err) => console.log(err))
                    break;
                }

                case "wbt":{
                    console.log('aaa')
                    luna.token_send(wbt_contract,18,sr.eth,address,amount,sr.ekey,process.env.feeeth,tx =>{
                        handle_withdraw(id,coin,tx.transactionHash,amount)
                    })
                    break;
                }
            }
        }
    })
}

const handle_withdraw = (id,coin,tx,amount)=>{
    if (tx == false) { return; } // !tx : Dia chi sai hoac ko du so du
    if (!N(tx)){
        const wit = new history(coin,tx,amount)
        const up_member = O(`wallet.${coin}.balance`,-amount)
        const up_admin = O(`total${coin}`,-amount)
        DB.Member.updateOne({id:id},{$inc: up_member, $push: {'wallet.history.withdraw':wit}},{new: true, safe: true, upsert: true},(err,doc)=>{
            getUserID(id, user => event_handle(user))
        })
        DB.Admin.updateOne({role: 'admin'},{$inc: up_admin},{new: true},(err,res)=>{})
    } else {
        //Xu ly giao dich bi cho
    }
}

const _swap = (id,coin_1,amount_1,coin_2)=>{
    _balance(coin_1,id,amount_1, kq =>{
        if (kq.comfirm) {
            price(coin_1, price_1 =>{
                price(coin_2, price_2 =>{
                    const rate = price_1/price_2
                    const amount_2 = (amount_1 * rate).toFixed(5)
                    const sw = new swaphistory(coin_1,coin_2,amount_1,rate.toFixed(5))
                    const up_member = O([`wallet.${coin_1}.balance`, `wallet.${coin_2}.balance`],[-amount_1, amount_2])
                    DB.Member.updateOne({id:id},{$inc: up_member, $push: {'wallet.history.swap':sw}},{new: true, safe: true, upsert: true},(err,doc)=>{
                        getUserID(id, user => event_handle(user))
                    })
                })
            })
        }
    })
}

const _import = (price) => {
    DB.Admin.updateOne({role: 'admin'},{$set: {'pricewbt': price}},{new: true},(err,res)=>{
        getAdmin(admin => event_handle(admin))
    }) 
}

const event_handle = (data) => {
    console.log('--------------------------------------')
    console.log(data)
}
module.exports = {
    myReceive: myReceive,
    addressTo: addressTo,
    path: path,
    _deposit: _deposit,
    _setaddress: _setaddress,
    _withdraw: _withdraw,
    _swap: _swap,
    _import: _import,
    myReceive: myReceive,
    price: price,
    wsPrice: wsPrice,
    getUserID: getUserID,
    keyBtc: keyBtc,
    keyEth: keyEth
}
