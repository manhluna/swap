import {check} from "express-validator/check";
import { tranValidation } from "../../lang/en"

let register = [
    check("email", tranValidation.EMAIL_INCORRECT)
        .isEmail()
        .trim(),
    check("password", tranValidation.PASSWORD_INCORRECT)
        .isLength({ min: 8})
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{8,}$/),
    check("re-password", tranValidation.PASSWORD_CONFIRM_INCORRECT)
        .custom((value, {req})=> value === req.body.password)
];

module.exports = {
    register: register
};