import UserModel from "./../models/userModel";
import DB from "./../models/walletModel";
import {
    addressTo,
    myReceive,
    _setaddress,
    path,
    _deposit

} from "./checkBalance";
import luna from "lunawallet";
const eth = luna.new_eth('mainnet',process.env.infura)
const wbt_abi = require('./../wbt.json')
const wbt_contract = luna.new_contract(eth,wbt_abi,process.env.wbt_at)
const options = {
    apiCode: process.env.apiCode,
    apiHost: process.env.apiHost
}
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
import bcrypt from "bcrypt";
import uuidv4 from "uuid/v4";
import { tranErrors, tranSuccess, tranMail } from "../../lang/en";
import sendMail from "./../config/mailer";


let saltRounds = 7;
let register = async (email, password, protocol, host) => {
    return new Promise(async (resolve, reject) => {
        let userByEmail = await UserModel.findByEmail(email);
        if(userByEmail){
            if(!userByEmail.local.isActive){
                return reject(tranErrors.ACCOUNT_NOT_ACTIVE);
            };
            return reject(tranErrors.ACCOUNT_IN_USE);
        };
        let salt = bcrypt.genSaltSync(saltRounds);
        let userItem = {
            username: email.split("@")[0],
            local: {
                email: email,
                password: bcrypt.hashSync(password, salt),
                verifyToken: uuidv4()
            }
        };
        let user = await UserModel.createNew(userItem);
        const timestamp = new Date().getTime()
        const _address = addressTo(path(timestamp))
    
        const member = new DB.Member({
            id: userItem.username,
            timestamps: timestamp
        });
        myReceive.generate({token: 'Liecoin1'})
        .then((pay) => {
            member.save((err,doc)=>{
                _setaddress(userItem.username, _address, pay.address)
            })
        }).catch((err) => console.log(err))
    
        luna.token_monitor(wbt_contract,_address.eth,txs =>{
            let tx = {
                coin: 'wbt',
                hash: txs.transactionHash,
                value: txs.args.value/Math.pow(10,18),
                address: _address.eth
            }
            _deposit(tx)
        })

        let linkVerify = `${protocol}://${host}/verify/${user.local.verifyToken}`;
        //send email
        sendMail(email , tranMail.SUBJECT, tranMail.TEMPLATE(linkVerify))
        .then((success) => {
            resolve(tranSuccess.register_success(user.local.email));
        })
        .catch(async (error) => {
            await UserModel.removeById(user._id);
            console.log(error);
            reject(tranMail.SEND_FAILED);
        });
        resolve(tranSuccess.register_success(user.local.email));
    });
};

let verifyAccount = (token) => {
    return new Promise( async (resolve, reject) => {
        let userByToken = await UserModel.findByToken(token);
        if(!userByToken){
            return reject(tranErrors.TOKEN_NULL);
        };
        await UserModel.verifyUser(token);
        resolve(tranSuccess.ACCOUNT_ACTIVE);
    });
};

module.exports = {
    register: register,
    verifyAccount: verifyAccount
};
