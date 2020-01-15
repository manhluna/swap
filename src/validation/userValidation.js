import {check} from "express-validator/check";
import { tranValidation } from "../../lang/en"

let updatePhone = [
    check("phone", tranValidation.UPDATE_PHONE)
        .optional()
        .matches(/^(0)[0-9]{9,10}$/),   
];
let updateAddress = [
    check("address", tranValidation.UPDATE_ADDRESS)
        .optional()
        .isLength({min:3, max: 40})
];
let postComment = [
    check("comment", tranValidation.COMMENT_EMPTY)
    .not()
    .isEmpty()
];
let postEmailRecover = [
    check("email", tranValidation.EMAIL_INCORRECT)
        .isEmail()
        .trim()
];
let checkNewPassword = [
    check("new_password", tranValidation.PASSWORD_INCORRECT)
        .isLength({ min: 8})
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{8,}$/),
    check("new_re_password", tranValidation.PASSWORD_CONFIRM_INCORRECT)
        .custom((value, {req})=> value === req.body.new_password)
];

module.exports = {
    updatePhone: updatePhone,
    updateAddress: updateAddress,
    postComment: postComment,
    postEmailRecover: postEmailRecover,
    checkNewPassword: checkNewPassword
};