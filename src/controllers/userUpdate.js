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
let postAddPrice = async (req, res)=> {
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
        await user.addPrice(req.body.price);
        let result = {
            message: tranSuccess.POST_COMMENT_SUCCESS
        };
        return res.redirect("/");
    } catch (error) {
        return res.redirect("/admin/add-price");
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
let verifyAccountForgetPassword = async (req, res) =>{
    let errArr = [];
    req.session.tokenpass = req.params.tokenRecoverPassword;
    try {
        await user.verifyAccountForgetPassword(req.params.tokenRecoverPassword);
        return res.redirect("/user/new-password");
    } catch (error) {
        errArr.push(error);
        req.flash("errors", errArr);
        return res.redirect("/user/recover-password");
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
let RecoverPassword = async (req, res)=> {
    let errArr = [];
    let validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item =>{
            errArr.push(item.msg);
        });
        req.flash("errors", errArr)
        return res.redirect("/user/recover-password");   
    };
    try {
        let emailRecoverPassword = req.body.email;
        await user.postRecoverPassword(emailRecoverPassword, req.protocol, req.get("host"));
        return res.redirect("/user/send-mail-password");
    } catch (error) {
        errArr.push(error);
        req.flash("errors", errArr);
        return res.status(500).send(error);
    }
};
let updateNewPassword= async (req, res)=> {
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
        await user.updatePassword(req.session.tokenpass, updateUserItem.new_password);
        let result = {
            message: tranSuccess.UPDATE_PASSWORD_SUCCESS
        };
        return res.redirect("/login");
    } catch (error) {
        return res.status(500).send(error);
    }
};



module.exports = {
    postUserComment: postUserComment,
    updatePhoneNow: updatePhoneNow,
    updateAddressNow: updateAddressNow,
    verifyAccountForgetPassword: verifyAccountForgetPassword,
    RecoverPassword: RecoverPassword,
    updateNewPassword: updateNewPassword,
    postAddPrice: postAddPrice
};
