import {price, wsPrice} from "./../services/price";
import { _deposit, getUserID } from "./../services/checkBalance"
import DB from "./../models/walletModel";

let postSwap = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        socket.on("post-swap", async (agencyRegisterData)=>{
            let swapInfo = DB.Member.find({id:socket.request.user.username}); 
            let currentBtcBalance = swapInfo.wallet.btc.balance;
            let currentWbtBalance = swapInfo.wallet.wbt.balance;
            if(clients[currentUserId]){
                clients[currentUserId].forEach( (socketId) => {
                    io.sockets.connected[socketId].emit("post-swap-success", {
                        currentBtcBalance,
                        currentWbtBalance
                    });
                });
            }
        }); 
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}
let updateUserPhone = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        socket.on("update-phone", async (phoneUpdate)=>{
            if(clients[currentUserId]){
                clients[currentUserId].forEach( (socketId) => {
                    io.sockets.connected[socketId].emit("update-phone-success", phoneUpdate);
                });
            }
        }); 
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}
let updateUserAddress = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        socket.on("update-address", async (address)=>{
            if(clients[currentUserId]){
                clients[currentUserId].forEach( (socketId) => {
                    io.sockets.connected[socketId].emit("update-address-success", address);
                });
            }
        }); 
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}
let postWithdraw = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        socket.on("post-withdraw", async (data)=>{
            let withdrawInfo = DB.Member.find({id:socket.request.user.username}); 
            let currentBtcBalance = withdrawInfo.wallet.btc.balance;
            let currentWbtBalance = withdrawInfo.wallet.wbt.balance;
            if(clients[currentUserId]){
                clients[currentUserId].forEach( (socketId) => {
                    io.sockets.connected[socketId].emit("post-withdraw-success", {
                        currentBtcBalance,
                        currentWbtBalance
                    });
                });
            }
        }); 
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}
let postPrice = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        wsPrice(btcprice=>{
            price("wbt",wbtprice =>{
                if(clients[currentUserId]){
                    clients[currentUserId].forEach( (socketId) => {
                        io.sockets.connected[socketId].emit("post-price", {btcprice, wbtprice});
                    });
                }
            })         
        }); 
        
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}

let postDeposit = (io) => {
    let clients = {};
    io.on("connection", (socket)=>{ 
        let currentUserId = socket.request.user._id;
        if(clients[currentUserId]){
            clients[currentUserId].push(socket.id)
        } else {
            clients[currentUserId] = [socket.id];
        } 
        const later = require("later")
    const a = () =>{
        getUserID(socket.request.user.username, user=>{
            let currentBtcBal = user.wallet.btc.balance;
            let currentWbtBal = user.wallet.wbt.balance;

            if(clients[currentUserId]){
                clients[currentUserId].forEach( (socketId) => {
                    io.sockets.connected[socketId].emit("post-deposit", {
                        currentBtcBal,
                        currentWbtBal
                    });
                });
            }
        });
    }
    later.setInterval(a, later.parse.text('every 1 seconds'))
             
 
        
        
        
        socket.on("disconnect", ()=> {
            clients[currentUserId] = clients[currentUserId].filter((socketId)=>{
                return socketId !== socket.id;
            });
            if(!clients[currentUserId].length){
                delete clients[currentUserId];
            }
        });
    });
    
}

module.exports = {
    postSwap: postSwap,
    postWithdraw: postWithdraw,
    postPrice: postPrice,
    updateUserPhone: updateUserPhone,
    updateUserAddress: updateUserAddress,
    postDeposit: postDeposit
};