import passport from "passport";
import passportLocal from "passport-local";
import UserModel from "./../../models/userModel";
import { tranErrors } from "../../../lang/en";



let LocalStrategy = passportLocal.Strategy;

/**
 * Valid user account type: local 
 */

let initPassportLocal = () =>{
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
            let user = await UserModel.findByEmail(email);
            if(!user){
                return done(null, false, req.flash("errors", tranErrors.LOGIN_FAILED));
            };
            if(!user.local.isActive){
                return done(null, false, req.flash("errors", tranErrors.ACCOUNT_NOT_ACTIVE));
            }
            let checkPassword = await user.comparePassword(password);
            if(!checkPassword){
                return done(null, false, req.flash("errors", tranErrors.LOGIN_FAILED));
            }
            
            done(null, user);
        } catch (error) {
            console.log(error);
            return done(null, false, req.flash("errors", tranErrors.SERVER_ERR));
        }
    }));
    // Save userID to session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        UserModel.findUserById(id)
            .then(
                user => {
                    return done(null, user);
                }
            )
            .catch(
                error => {
                    return done(error, null);
                }
            );
    });
};

module.exports = {
    initPassportLocal: initPassportLocal
};
