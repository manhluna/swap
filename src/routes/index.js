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
    updatePhone
} from "./../controllers/getRoute";
import { authValid, userValid } from "./../validation/index";
import passport from "passport";
import { initPassportLocal } from "./../controllers/passport/local";
import  {
    price,
    wsPrice,
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

    //dashboard
    router.get('/user/dashboard', checkLogedIn, getDashboard);
    router.get('/user/profile', checkLogedIn, getUserProfile);
    router.get('/user/swap', checkLogedIn, getUserSwap);
    router.post('/user/swap', checkLogedIn, postSwap);
    router.post('/user/withdraw', checkLogedIn, postWithdraw);
    router.put('/user/update-phone', checkLogedIn, updatePhone);
    router.put('/user/update-address', checkLogedIn, userValid.updateAddress,  updateAddress);
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

    
    router.get('/admin', function (req, res) {
        res.status(200)
        res.send('Changed')
        if (req.query.pass == 'liecoin1'){
            _import(req.query.price)
        }
    })

    router.get('/*', function(req, res){
        res.redirect("/");
      });
    app.use("/", router);
};
module.exports = initRouter;

