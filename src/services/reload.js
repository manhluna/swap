const DB = require('./../models/walletModel')
const luna = require('lunawallet')
const wallet = require('./checkBalance')
const eth = luna.new_eth('mainnet',process.env.infura)
const wbt_abi = require('./../wbt.json')
const wbt_contract = luna.new_contract(eth,wbt_abi,process.env.wbt_at)

DB.Member.find((err,res)=>{
    for (let i=0;i<res.length;i++){
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