import { tranErrors, tranSuccess } from "../../lang/en";
import {user} from "../services/index";
import { validationResult } from "express-validator/check";


let postUserComment = async (req, res)=> {
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
        let updateUserItem = req.body;
        await user.postComment(req.user._id, updateUserItem);
        let result = {
            message: tranSuccess.POST_COMMENT_SUCCESS
        };
        return res.redirect("/review");
    } catch (error) {
        return res.status(500).send(error);
    }
};
let updatePhoneNow = async (req, res)=> {
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
        let updateUserItem = req.body;
        await user.updatePhone(req.user._id, updateUserItem);
        let result = {
            message: tranSuccess.POST_COMMENT_SUCCESS
        };
        return res.redirect("/review");
    } catch (error) {
        return res.status(500).send(error);
    }
};
let updateAddressNow = async (req, res)=> {
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
        let updateUserItem = req.body;
        await user.updateAddress(req.user._id, updateUserItem);
        let result = {
            message: tranSuccess.POST_COMMENT_SUCCESS
        };
        return res.redirect("/review");
    } catch (error) {
        return res.status(500).send(error);
    }
};



module.exports = {
    postUserComment: postUserComment,
    updatePhoneNow: updatePhoneNow,
    updateAddressNow: updateAddressNow
};
