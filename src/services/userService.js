import UserModel from "./../models/userModel";
import CommentModel from "./../models/commentModel";
import { tranMail,tranSuccess, tranErrors, tranRecoverPassword } from "../../lang/en";
import bcrypt from "bcrypt";
import uuidv4 from "uuid/v4";
import sendMail from "./../config/mailer";
import { _import } from "./checkBalance";
const saltRounds = 7;
/**
 * update password
 * @param {userId} id 
 * @param {data update} dataUpdate 
 */

let postComment =  (id, dataUpdate) => {
    return new Promise(async (resolve, reject)=> {
        let currentUser = await UserModel.findUserById(id);
        if(!currentUser) {
            return reject(tranErrors.SERVER_ERR);
        }

        let newPost = new CommentModel({
            user: id,
            username: currentUser.username,
            comment: dataUpdate.comment
        });
        await newPost.save();
        resolve(true);
    });
}

/**
 * update password
 * @param {userId} id 
 * @param {data update} dataUpdate 
 */
let updatePhone = (id, dataUpdate) => {
    return new Promise(async (resolve, reject)=> {
        let currentUser = await UserModel.findUserById(id);
        if(!currentUser) {
            return reject(tranErrors.ACCOUNT_NOT_EXIST);
        }
        await UserModel.updatePhone(id, dataUpdate.phone);
        resolve(true);
    });
}
let addPrice = (price) => {
    return new Promise(async (resolve, reject)=> {
        await _import(price);
        resolve(true);
    });
}

let updateAddress = (id, dataUpdate) => {
    return new Promise(async (resolve, reject)=> {
        let currentUser = await UserModel.findUserById(id);
        if(!currentUser){
            return reject(tranErrors.SERVER_ERR);
        }
        await UserModel.updateAddress(id, dataUpdate.address);
        resolve(true);
    });
}
// send mail recover password
let postRecoverPassword = (email, protocol, host) => {
    return new Promise(async (resolve, reject)=> {
        let currentUser = await UserModel.findByEmail(email);
        if(!currentUser){
            return reject(tranErrors.SERVER_ERR);
        }
        let token = uuidv4();
        await UserModel.createTokenForgetPassword(email, token);
        let CurUser = await UserModel.findOne({"local.email": email});
        let linkRecoverPassword = `${protocol}://${host}/user/${CurUser.local.tokenRecoverPassword}`;
        //send email
        sendMail(email , tranRecoverPassword.SUBJECT, tranRecoverPassword.TEMPLATE(linkRecoverPassword))
        .then((success) => {
            resolve(tranSuccess.send_email_password_success(email));
        })
        .catch(async (error) => {
            console.log(error);
            reject(tranMail.SEND_FAILED);
        });
        resolve(true);
    });
}
let verifyAccountForgetPassword = (tokenRecoverPassword) => {
    return new Promise( async (resolve, reject) => {
        let userByToken = await UserModel.findByTokenRecoverPassword(tokenRecoverPassword);
        if(!userByToken){
            return reject(tranErrors.TOKEN_NULL);
        };
        resolve(true);
    });
};
//set new password
let updatePassword = (tokenRecoverPassword, newPassword) => {
    return new Promise(async (resolve, reject)=> {
        let currentUser = await UserModel.findOne({"local.tokenRecoverPassword": tokenRecoverPassword});
        if(!currentUser){
            return reject(tranErrors.SERVER_ERR);
        }
        let salt = bcrypt.genSaltSync(saltRounds);
        await UserModel.updatePassword(tokenRecoverPassword, bcrypt.hashSync(newPassword, salt));
        resolve(true);
    });
}


module.exports = {
    updatePhone: updatePhone,
    updateAddress: updateAddress,
    postComment: postComment,
    postRecoverPassword: postRecoverPassword,
    verifyAccountForgetPassword: verifyAccountForgetPassword,
    updatePassword: updatePassword,
    addPrice: addPrice
};
