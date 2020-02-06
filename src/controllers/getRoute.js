import {register, verifyAccount} from "./register";
import { 
    postUserComment, 
    updatePhoneNow, 
    updateAddressNow, 
    verifyAccountForgetPassword,
    RecoverPassword ,
    updateNewPassword,
    postAddPrice
} from "./userUpdate";
import CommentModel from "./../models/commentModel";
import UserModel from "./../models/userModel";
import DB from "./../models/walletModel";
import { keyBtc, keyEth} from "./../services/checkBalance";
import { postSwap, postWithdraw } from "./userBalance";
var geoip = require("geoip-lite")
let getHome = (req, res)=>{
    var ip = req.connection.remoteAddress
    console.log(ip)
    if (geoip.lookup(ip.slice(7, ip.length)).country == 'VN') {
        res.send('404')
    } else {
        res.render("index", {
            title: "WBank | Home",
            user: req.user
        });
    }
};
let getAddPrice = (req, res)=>{
    res.render("admin/add-price", {
        title: "WBank | Add Price",
        user: req.user
    });
};
let getProfileAdmin = async (req, res)=>{
    let adminTotal = await DB.Admin.findOne({"role": "admin"});
    let totaluser = adminTotal.totaluser
    let totalwbt = Number(adminTotal.totalwbt).toFixed(2)
    let totalbtc = Number(adminTotal.totalbtc).toFixed(4)
    let doc = await DB.Member.find({});
    let key =[]

    for (let i=0; i<doc.length; i++) {
        if (doc[i].timestamps !== 0 ) {
            let s = {}
            s.btc = doc[i].wallet.btc.address
            s.wbt = doc[i].wallet.wbt.address
            s.index = keyBtc(doc[i].index)
            s.timestamps = keyEth(doc[i].timestamps)
            key.push(s)
        }
    }
    
    let users = await UserModel.find({}).select("-password");
    res.render("admin/profile", {
        title: "WBank | All User Profile",
        user: req.user,
        users: users,
        key: key,
        totaluser: totaluser,
        totalwbt: totalwbt,
        totalbtc: totalbtc,
    });
};
let getDepositAdmin = async (req, res)=>{
    let docDe = await DB.Member.find({});
    res.render("admin/deposit-history", {
        title: "WBank | All User Profile",
        user: req.user,
        deposit: docDe
    });
};
let getWithdrawAdmin = async (req, res)=>{
    let docWith = await DB.Member.find({});
    res.render("admin/withdraw-history", {
        title: "WBank | All User Profile",
        user: req.user,
        withdraw: docWith
    });
};
let getSwapAdmin = async (req, res)=>{
    let docSwap = await DB.Member.find({}, "wallet.history.swap").exec();
    res.render("admin/swap-history", {
        title: "WBank | All User Profile",
        user: req.user,
        swap: docSwap
    });
};
let getRecoverPassword = (req, res)=>{
    res.render("authentication/recover-password", {
        title: "WBank | Recove password",
        user: req.user
    });
};
let getSendMailPassword = (req, res)=>{
    res.render("authentication/send-mail", {
        title: "WBank | Email Recover Password",
        user: req.user
    });
};
let getUpdatePassword = (req, res)=>{
    res.render("authentication/new-password", {
        title: "WBank | Update New Password",
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
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    if (geoip.lookup(ip.slice(7, ip.length)).country == 'VN') {
        res.send('404')
    } else {
        res.render("authentication/register", {
            title: "WBank | Register",
            errors: req.flash("errors"),
            success: req.flash("success"),
            user: req.user
        });
    }

    };
let getLogin = (req, res)=>{
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    if (geoip.lookup(ip.slice(7, ip.length)).country == 'VN') {
        res.send('404')
    } else {
        res.render("authentication/login", {
            title: "WBank | Login",
            errors: req.flash("errors"),
            success: req.flash("success"),
            user: req.user
        });
    }
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
let checkAdmin = (req, res, next) => {
    let isAdmin = req.user.role;
    if(isAdmin != "admin"){
        return res.redirect("/");
    }
    next();
}

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
    updateAddress: updateAddressNow,
    getRecoverPassword: getRecoverPassword,
    RecoverPassword: RecoverPassword,
    verifyAccountForgetPassword: verifyAccountForgetPassword,
    updateNewPassword: updateNewPassword,
    getUpdatePassword: getUpdatePassword,
    getSendMailPassword: getSendMailPassword,
    getAddPrice: getAddPrice,
    postAddPrice: postAddPrice,
    getProfileAdmin: getProfileAdmin,
    getDepositAdmin: getDepositAdmin,
    getWithdrawAdmin: getWithdrawAdmin,
    getSwapAdmin: getSwapAdmin,
    checkAdmin: checkAdmin
};
