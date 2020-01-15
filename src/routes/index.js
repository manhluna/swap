import express from "express";
import {
    getHome,  
    getReview,
    getRegister,
    getLogin,
    postRegister,
    verifyAccount,
    getLogout,
    checkLogedIn,
    checkLogedOut,
    getConfirmMail,
    postComment,
    getDashboard,
    getUserProfile,
    getUserSwap,
    postSwap,
    postWithdraw,
    updateAddress,
    updatePhone,
    getRecoverPassword,
    RecoverPassword,
    verifyAccountForgetPassword,
    updateNewPassword,
    getUpdatePassword,
    getSendMailPassword,
    getAddPrice,
    postAddPrice,
    getProfileAdmin,
    getDepositAdmin,
    getWithdrawAdmin,
    getSwapAdmin,
    checkAdmin
} from "./../controllers/getRoute";
import { authValid, userValid } from "./../validation/index";
import passport from "passport";
import { initPassportLocal } from "./../controllers/passport/local";
import  {
    _deposit,
    _setaddress,
    _withdraw,
    _swap,
    _import
    } from "./../services/checkBalance";

// Init all passport
initPassportLocal();
let router = express.Router();
/**
 * init routes 
 */
let initRouter = (app)=>{
    // page route
    router.get('/', getHome );
    router.get('/review', getReview );
    router.get('/confirm-mail', getConfirmMail );
    router.get('/register', checkLogedOut, getRegister );
    router.get('/login', checkLogedOut, getLogin );
    router.get('/verify/:token', checkLogedOut, verifyAccount );
    router.post('/register', checkLogedOut, authValid.register, postRegister);


    //login
    router.post('/login', checkLogedOut, passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: true,
        failureFlash: true
    }), );

    router.get('/logout', checkLogedIn, getLogout);

    //post routes
    router.post('/posts', checkLogedIn, userValid.postComment, postComment);
    // admin
    router.get('/admin/add-price', checkLogedIn, checkAdmin, getAddPrice);
    router.post('/admin/add-price', checkLogedIn, checkAdmin, postAddPrice);
    
    router.get('/admin/profile', checkLogedIn, checkAdmin, getProfileAdmin);
    router.get('/admin/deposit-history', checkLogedIn, checkAdmin, getDepositAdmin);
    router.get('/admin/withdraw-history', checkLogedIn, getWithdrawAdmin);
    router.get('/admin/swap-history', checkLogedIn, checkAdmin, getSwapAdmin);


    //dashboard
    router.get('/user/dashboard', checkLogedIn, getDashboard);
    router.get('/user/profile', checkLogedIn, getUserProfile);
    router.get('/user/swap', checkLogedIn, getUserSwap);
    router.post('/user/swap', checkLogedIn, postSwap);
    router.post('/user/withdraw', checkLogedIn, postWithdraw);
    router.put('/user/update-phone', checkLogedIn, updatePhone);
    router.put('/user/update-address', checkLogedIn, userValid.updateAddress,  updateAddress);

    router.get('/user/recover-password', checkLogedOut,  getRecoverPassword);
    router.get('/user/send-mail-password', checkLogedOut,  getSendMailPassword);
    router.post('/user/recover-password', checkLogedOut, userValid.postEmailRecover,  RecoverPassword);
    router.get('/user/new-password', checkLogedOut,  getUpdatePassword);
    router.get('/user/:tokenRecoverPassword', checkLogedOut,  verifyAccountForgetPassword);
    router.post('/user/update-password', checkLogedOut, userValid.checkNewPassword,  updateNewPassword);
    //wallet
    
    router.get('/btc', function (req, res) {
        res.status(200);
    
        if ((req.query.token == 'Liecoin1') && (req.query.confirmations == process.env.cons) ){
            let tx = {
                coin: 'btc',
                hash: req.query.transaction_hash,
                value: req.query.value/Math.pow(10,8),
                address: req.query.address
            }
            _deposit(tx)
        }
    })

    
    // router.get('/admin', function (req, res) {
    //     res.status(200)
    //     res.send('Changed')
    //     _import(req.query.price)
    // })

    router.get('/*', function(req, res){
        res.redirect("/");
      });
    app.use("/", router);
};
module.exports = initRouter;

