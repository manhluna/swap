const DB = require('./../models/walletModel')
const delay = require('delay')
const binance = require('node-binance-api')().options({
  APIKEY: '6eKAHwLiaEWJY4F0KmNazf0qEp0llEExCcQUY5YzE1HrCvm53iUGWHtZ0EMu1GCa',
  APISECRET: 'hBEo6hJwYkwAGbxXBxdCGoe9QgKdDthcwsm16eeBkEHowOjnDIdRE6tHpJkmeFj9',
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
})

const price = (coin,cb)=>{
  if (coin === 'btc') {
    binance.prices('BTCUSDT', (error, ticker) => {
      cb(ticker.BTCUSDT)
    });
  }
  
  if (coin === 'wbt') {
    DB.Admin.findOne({role: 'admin'},'pricewbt',(err,res)=>{
      cb(res.pricewbt)
    })
  }
}
const wsPrice = (cb)=>{
  // binance.websockets.trades(['BTCUSDT'], (trades) => {
  //   let {e:eventType, E:eventTime, s:symbol, p:price, q:quantity, m:maker, a:tradeId} = trades
  //   cb(price)
  // });
  setInterval(()=>{
    price('btc', x => cb(x))
  },10000)
}


module.exports ={
  price: price,
  wsPrice:wsPrice
}