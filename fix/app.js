const _ = require('underscore');
const request = require('request');

const bit_addr = require('bitcoin-address')

const bip39 = require('bip39');
const bip32 = require('bip32');
const bitcoin = require('bitcoinjs-lib');

const explorer = require('blockchain.info/blockexplorer').usingNetwork(3)
const Socket = require('blockchain.info/Socket')

const blockcypher = require('blockcypher');

const bitcore = require('bitcore-lib');
const Transaction = bitcore.Transaction;
const UnspentOutput = Transaction.UnspentOutput;
const bitcoreExplorers = require("bitcore-explorers");
const insight = new bitcoreExplorers.Insight();
const {pushtx} = require('pushtx')
const decbtc = Math.pow(10,8)

const ether_addr = require('ethereum-address');
const FlexEther = require('flex-ether-fix');
const FlexContract = require('flex-contract-fix');
const {toWallet} = require('send-ether-fix');
const deceth = Math.pow(10,18)

//----------------Create----------------------------------------------
//[coin: btc | eth] [net: main | test3]
function new_cypher(coin,net,key){
    const a = new blockcypher(`${coin}`,`${net}`,`${key}`)
    return a
}

function new_eth(net,key){
    const e = new FlexEther({
        network: `${net}`,
        infuraKey: `${key}`,
        providerURI: `https://${net}.infura.io/v3/${key}`,
    })
    return e
}

function new_contract(eth,abi, deployed_at){
    const c = new FlexContract(abi, deployed_at, {
        eth: eth,
    })
    return c
}
//----------------BTC-WALLET----------------------------------------------
function btc_wallet(mnemonic,id) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const child = root.derivePath("m/44'/0'/0'/0/"+id);
    const Address = bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address;
    //console.log("BIP39 Seed:", seed.toString('hex'));
    //console.log("BIP32 Root Key: ", root.toBase58());
    return {Address: Address, PrivateKey: child.toWIF()};
}
//----------------ETH-WALLET----------------------------------------------
function eth_wallet(mnemonic, mnemonicIndex){
    return toWallet({mnemonic: mnemonic, mnemonicIndex: mnemonicIndex});
}
//----------------GET-BTC----------------------------------------------
async function btc_get(address,cb){
    let bal = await explorer.getBalance(address)
    cb(bal[address].final_balance)
}
//----------------GET-ETH----------------------------------------------
async function eth_get(eth,addr, cb){
    cb(await eth.getBalance(addr)/deceth)
}

async function token_get(contract,decimals,addr,cb){
    cb(await contract.balanceOf({args:{account: addr}})/Math.pow(10,decimals))
}
//----------------GET-BTC/ETH----------------------------------------------
function bal_get(api,address,cb){
    // let api = btcapi;
    // if (coin == 'eth') { api = ethapi; }
    api.getAddrBal(address,[],(err,data)=>{
        if (err !== null) {
            console.log(err);
        } else {
            cb({
                balance:data.balance/Math.pow(10,8), 
                unconfirmed:data.unconfirmed_balance/Math.pow(10,8),
                final:data.final_balance/Math.pow(10,8)
            })
        }
    });
}
//----------------SEND-ETH----------------------------------------------
async function eth_send(eth,FromAddress,PrivateKey,ReceiverAddress,amount,fee,cb){
    eth_get(eth,FromAddress,balance =>{
        if (eth_checkaddr(FromAddress,ReceiverAddress) && ok_send(balance,amount,fee)) {
            (async function(){
                cb(await eth.transfer(ReceiverAddress, amount,{key: PrivateKey}))
            })()
        } else {
            cb(false)
        }
    })
}

async function token_send(contract,decimals,from,to,amount,PrivateKey,fee,cb){
    token_get(contract,decimals,from,balance =>{
        if (eth_checkaddr(from,to) && ok_send(balance,amount,fee)) {
            (async function(){
                cb(await contract.transfer({
                    args: {
                        //[ _to & _value ] is two args of transfer method in Contract  <function transfer(address _to, uint _value) public whenNotPaused>
                        recipient: to,
                        amount: (amount*Math.pow(10,decimals)).toString()
                    },
                    key: PrivateKey
                }))
            })()
        } else {
            cb(false)
        }
    })
}
//----------------SEND-BTC----------------------------------------------
//Bitcore
//[net: 'mainnet' | 'testnet']
const getUtxosV1 = function(net,from,status,cb) {
    const url = `https://api.bitcore.io/api/BTC/${net}/address/${from}?unspent=${status}`;
    request(url,{json: true},(err, res, body)=>{
        let utxo = [];
        let balance = 0;
        for (let i = 0; i<body.length; i++){
            balance +=body[i].value
            utxo.push({
                address: body[i].address,
                txid: body[i].mintTxid,
                vout: body[i].mintIndex,
                scriptPubKey: body[i].script,
                satoshis: body[i].value
            })
        }

        let utxos = _.map(utxo, UnspentOutput);
        cb({
            balance: balance/decbtc,
            utxos: utxos
        })
    })
};

//Bitpay
const getUtxosV2 = (from,cb) =>{
    request({
        method: 'POST',
        url: 'https://insight.bitpay.com/api/addrs/utxo/',
        json: { addrs: from}
      },(err,res,utxo) =>{
        let balance=0;
        for (let i=0;i<utxo.length;i++) {
            balance+=utxo[i].satoshis
        }

        let utxos = _.map(utxo, UnspentOutput);
        cb({
            balance: balance/decbtc,
            utxos: utxos
        })
    })
}

//Bitpay
const getUtxosV3 = (from,cb)=>{
    insight.getUnspentUtxos(from, (err, utxos)=> {
        let balance = 0;
        for (var i = 0; i < utxos.length; i++) {
          balance +=utxos[i]['satoshis'];
        }
        cb({
            balance: balance/decbtc,
            utxos: utxos
        })
    });
}

const makeRaw = (utxos,from,to,amount,key,fee,cb)=>{
    amount=amount*decbtc
    fee=fee*decbtc
    let rawTx = new bitcore.Transaction()
    .from(utxos)
    .to(to, amount)
    .fee(fee)
    .change(from)
    .sign(key)
    .serialize()

    cb(rawTx)
}

//Bitcore
//[net: 'mainnet' | 'testnet']
const pushV1 = (net,rawTx,cb)=>{
    const url = `https://api.bitcore.io/api/BTC/${net}/tx/send`;
    request({
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        url: url,
        body: {'rawTx': rawTx},
        json: true
      },
      (err,res,body) =>{
        cb(body.txid)
    })
}

//BlockCypher
//[net: 'main' | 'test3'] [coin: 'btc' | 'eth']
const pushV2 = (coin,net,apiCode,rawTx,cb)=>{
    const api = new blockcypher(`${coin}`,`${net}`,`${apiCode}`);
    api.pushTX(rawTx,(err,res) => {
        cb(res)
    })
}

//Chua xac dinh
const pushV3 = (rawTx,cb)=>{
    pushtx(rawTx)
    .then(res => { cb(res)} )
    .catch(err => { })
}

//Blockchain.info
//[net: 0 | 3]
const pushV4 = (net,rawTx)=>{
    const pushTx = require('blockchain.info/pushtx').usingNetwork(net)
    pushTx.pushtx(rawTx,{apiCode:'56702dab-c2f2-41fb-8c96-e3edf191b9eb'})
}

//Bitpay
const pushV5 = (rawTx,cb)=>{
    insight.broadcast(rawTx, (error, txid)=>{
        cb(txid)
    });
}

const btc_send = (net,from,to,amount,key,fee,cb) =>{
    let net1= net;
    if (net == 'mainnet'){net1= 'prod'}
    if (btc_checkaddr(net1,from,to)){
        getUtxosV1(net,from,true,res1 =>{
            if (ok_send(res1.balance,amount,fee)){
                makeRaw(res1.utxos,from,to,amount,key,fee, res2 =>{
                    pushV1(net,res2, res3 => {
                        cb(res3)
                    })
                })
            } else {
                cb(false)
            }
        })
    } else {
        cb(false)
    }
}

const send_btc = (api_cypher,coin,net,from,to,amount,key,fee,cb) =>{
    let net1= net;
    let net2= 'test3';
    if (net == 'mainnet'){net1= 'prod'; net2= 'main'}
    if (btc_checkaddr(net1,from,to)){
        getUtxosV1(net,from,true,res1 =>{
            if (ok_send(res1.balance,amount,fee)){
                makeRaw(res1.utxos,from,to,amount,key,fee, res2 =>{
                    pushV2(coin,net2,api_cypher,res2, res3 => {
                        cb(res3)
                    })
                })
            } else {
                cb(false)
            }
        })
    } else {
        cb(false)
    }
}
//----------------CHECKADDRESS-BTC----------------------------------------------
//[net: 'prod' | 'testnet']
const btc_checkaddr = (net,from,to)=>{
    if (bit_addr.validate(from,net) && bit_addr.validate(to,net)) {
        return true
    }
    return false
}
//----------------CHECKADDRESS-ETH----------------------------------------------
const eth_checkaddr = (from,to)=>{
  if (ether_addr.isAddress(from) && ether_addr.isAddress(to)){
    return true;
  }
  return false;
}
//----------------MONITOR-BTC---------------------------------------------
function btc_monitor(){
    const socket = new Socket();
    this.addresses = [];
    this.bind = (address)=>{
        this.addresses.push(address)
    };
    this.watch = (cb) =>{
        const handle = event => { cb(event) }
        socket.onTransaction(handle, {
            addresses: this.addresses,
            setTxMini: true,
        })
    };
    this.block = (cb) =>{
        const handle = event => {
            cb({
                height: event.height,
                time: event.time
            })
        }
        socket.onBlock(handle)
    }
}
//----------------MONITOR-ETH---------------------------------------------
function token_monitors(contract,cb){
    const watcher = contract.Transfer.watch();
    watcher.on('data',(event) => {
    cb(event)
 });
}

function token_monitor(contract,address,cb){
    let watcher = contract.Transfer.watch({
        args: {
            'to': address
        }
    });
    watcher.on('data', (event) => {
        cb(event)
    });
}
//----------------MONITOR-BTC/ETH---------------------------------------------
function bal_monitor(api,address,url,cb){
    // let api = btcapi;
    // if (coin == 'eth') { api = ethapi; }
    let webhook = {
        event: "confirmed-tx",
        address: address,
        url: url
    };
    api.createHook(webhook, (err,data) =>{
        if (err !== null) {
            console.log(err);
        } else {
            cb(data.id)
        }
    });
}
//----------------BLOCK-BTC---------------------------------------------
async function btc_block(cb){
    let block = await explorer.getLatestBlock()
    cb({time: block.time, height: block.height})
}
//----------------BLOCK-ETH---------------------------------------------
async function eth_block(eth,cb){
    cb(await eth.getBlockNumber())
}
//----------------OK-SEND---------------------------------------------
const ok_send = (balance,amount,fee)=>{
    return balance-amount-fee>=0
}

module.exports={
    new_cypher: new_cypher,
    new_eth: new_eth,
    new_contract: new_contract,
    btc_wallet: btc_wallet,
    eth_wallet: eth_wallet,
    btc_get: btc_get,
    eth_get: eth_get,
    token_get: token_get,
    bal_get: bal_get,
    btc_send: btc_send,
    send_btc: send_btc,
    eth_send: eth_send,
    token_send: token_send,
    btc_checkaddr: btc_checkaddr,
    eth_checkaddr: eth_checkaddr,
    btc_monitor: btc_monitor,
    token_monitor: token_monitor,
    token_monitors: token_monitors,
    bal_monitor: bal_monitor,
    btc_block: btc_block,
    eth_block: eth_block,
    ok_send: ok_send,
    getUtxosV1: getUtxosV1,
    getUtxosV2: getUtxosV2,
    getUtxosV3: getUtxosV3,
    makeRaw: makeRaw,
    pushV1: pushV1,
    pushV2: pushV2,
    pushV3: pushV3,
    pushV4: pushV4,
    pushV5: pushV5,
};