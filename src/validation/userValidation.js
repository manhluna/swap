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

module.exports = {
    updatePhone: updatePhone,
    updateAddress: updateAddress,
    postComment: postComment
};