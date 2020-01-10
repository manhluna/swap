import { tranSuccess } from "../../lang/en";
import { validationResult } from "express-validator/check";
import {
    price,
    wsPrice,
    _deposit,
    _setaddress,
    _withdraw,
    _swap,
    _import
} from "./../services/checkBalance";

let postSwap = async (req, res)=> {
    let errArr = [];
    let validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item =>{
            errArr.push(item.msg);
        });
        return res.status(500).send(errArr);  
    };
    try {
        await _swap(req.user.username, req.body.coin_1, req.body.amount_1, req.body.coin_2);
        let result = {
            message: tranSuccess.SWAP_SUCCESS
        };
        return res.status(200).send(result); 
    } catch (error) {
        return res.status(500).send(error);
    }
};
let postWithdraw = async (req, res)=> {
    let errArr = [];
    let validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item =>{
            errArr.push(item.msg);
        });
        return res.status(500).send(errArr);  
    };
    try {
        await _withdraw(req.user.username, req.body.coin, req.body.address, req.body.amount);
        let result = {
            message: tranSuccess.SWAP_SUCCESS
        };
        return res.status(200).send(result); 
    } catch (error) {
        return res.status(500).send(error);
    }
};

module.exports = {
    postSwap: postSwap,
    postWithdraw: postWithdraw,
    price: price,
    wsPrice: wsPrice
};