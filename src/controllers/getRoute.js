import {register, verifyAccount} from "./register";
import { postUserComment, updatePhoneNow, updateAddressNow } from "./userUpdate";
import CommentModel from "./../models/commentModel";
import DB from "./../models/walletModel";
import { postSwap, postWithdraw } from "./userBalance";
let getHome = (req, res)=>{
    res.render("index", {
        title: "WBank | Home",
        user: req.user
    });
};
let getReview = async (req, res)=>{
    let counts = await CommentModel.countDocuments();
    let posts = await CommentModel.find().sort({ date: -1 });
    res.render("review", {
        title: "WBank | Home",
        user: req.user,
        posts : posts,
        countPost: counts
    });
};

let getConfirmMail = (req, res)=>{
    res.render("auth/confirm-mail", {
        title: "WBank | Confirm Email",
        user: req.user
    });
};
let getDashboard =  async (req, res) => {
        let doc = await DB.Member.findOne({id: req.user.username});
        let btcAddressQr = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${doc.wallet.btc.address}%20world&choe=UTF-8`
        let wbtAddressQr = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${doc.wallet.wbt.address}%20world&choe=UTF-8`
        res.render("user/dashboard", {
            title: "WBank | Dashboard",
            user:req.user,

            walletBtc: doc.wallet.btc.address,
            walletWbt: doc.wallet.wbt.address,
            btcAddressQr: btcAddressQr,
            wbtAddressQr: wbtAddressQr
        });     
};
let getUserProfile = async (req, res) => {
    let doc = await DB.Member.findOne({id: req.user.username});
    res.render("user/profile", {
        title: "WBank | Dashboard",
        user:req.user,
        deposit: doc.wallet.history.deposit,
        withdraw: doc.wallet.history.withdraw,
        swap: doc.wallet.history.swap
    });
};
let getUserSwap = async (req, res) => {
    let docSwap = await DB.Member.findOne({id: req.user.username});
    res.render("user/swap", {
        title: "WBank | Dashboard",
        user:req.user,
        amountBtc: docSwap.wallet.btc.balance,
        amountWbt: docSwap.wallet.wbt.balance
    });
};


let getRegister = (req, res)=>{
        res.render("authentication/register", {
            title: "WBank | Register",
            errors: req.flash("errors"),
            success: req.flash("success"),
            user: req.user
        });
    };
let getLogin = (req, res)=>{
        res.render("authentication/login", {
            title: "WBank | Login",
            errors: req.flash("errors"),
            success: req.flash("success"),
            user: req.user
        });
    };
let getLogout = (req, res) => {
    req.logout();
    return res.redirect("/login");
};

let checkLogedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.redirect("/login");
    };
    next();
};

let checkLogedOut = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect("/");
    };
    next();
};

module.exports = {
    getHome: getHome,
    getReview: getReview,
    getRegister: getRegister,
    getLogin: getLogin,
    postRegister: register,
    verifyAccount: verifyAccount,
    getLogout: getLogout,
    checkLogedIn: checkLogedIn,
    checkLogedOut: checkLogedOut,
    getConfirmMail: getConfirmMail,
    postComment: postUserComment,
    getUserProfile: getUserProfile,
    getUserSwap: getUserSwap,
    postSwap: postSwap,
    getDashboard: getDashboard,
    postWithdraw: postWithdraw,
    updatePhone: updatePhoneNow,
    updateAddress: updateAddressNow
};
