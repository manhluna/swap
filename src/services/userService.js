import UserModel from "./../models/userModel";
import CommentModel from "./../models/commentModel";
import { tranErrors } from "../../lang/en";

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


module.exports = {
    updatePhone: updatePhone,
    updateAddress: updateAddress,
    postComment: postComment
};
