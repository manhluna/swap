import { validationResult } from "express-validator/check";
import { auth } from "./../services/index";


let register = async (req, res)=>{
    let errArr = [];
    let successArr = [];
    let validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        console.log(errors);
        errors.forEach(item =>{
            errArr.push(item.msg);
        });
        req.flash("errors", errArr)
        return res.redirect("/register");  
    };

    try {
        let userCreateSuccess = await auth.register(req.body.email, req.body.password, req.protocol, req.get("host"));
        successArr.push(userCreateSuccess);
        req.flash("success", successArr);
        return res.redirect("/register");
    } catch (error) {
        errArr.push(error);
        req.flash("errors", errArr);
        return res.redirect("/register");
    };

      
};
let verifyAccount = async (req, res) =>{
    let errArr = [];
    let successArr = [];

    try {
        let verifySuccess = await auth.verifyAccount(req.params.token);
        successArr.push(verifySuccess);
        req.flash("success", successArr);
        return res.redirect("/login");
    } catch (error) {
        errArr.push(error);
        req.flash("errors", errArr);
        return res.redirect("/register");
    }
};
module.exports = {
    register: register,
    verifyAccount: verifyAccount
};
