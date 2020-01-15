import mongoose from "mongoose";
import bcrypt from "bcrypt";

let Schema = mongoose.Schema;

let UserSchema = new Schema({
    username: String,
    phone: {
        type: Number,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: "user"
    },
    local: {
        email: {
            type: String,
            trim: true
        },
        password: String,
        isActive: {
            type: Boolean,
            default: false
        },
        verifyToken: String,
        tokenRecoverPassword: {
            type: String,
            default: null
        }
    },
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
});

UserSchema.statics = {
    createNew(item){
        return this.create(item);
    },
    findByEmail(email){
        return this.findOne({"local.email": email}).exec();
    },
    findByRole(role){
        return this.findOne({"role": role}).exec();
    },
    findUserById(id){
        return this.findById(id).select('-password').exec();
    },
    removeById(id){
        return this.findByIdAndRemove(id).exec();
    },
    findByToken(token){
        return this.findOne({"local.verifyToken": token}).exec();
    },
    findByTokenRecoverPassword(token){
        return this.findOne({"local.tokenRecoverPassword": token}).exec();
    },
    verifyUser(token){
        return this.findOneAndUpdate(
            {"local.verifyToken": token},
            {"local.isActive": true, "local.verifyToken": null}
        ).exec();
    }, 
    createTokenForgetPassword(email, token){
        return this.findOneAndUpdate(
            {"local.email": email},
            {"local.tokenRecoverPassword": token}
        ).exec();
    }, 
    verifyUserForgetPassword(token){
        return this.findOneAndUpdate(
            {"local.tokenForgetPassword": token}
        ).exec();
    },  
    updatePhone  (id, item){
        return this.findByIdAndUpdate(id, {"phone": item}).exec();
    },
    updateAddress  (id, item){
        return this.findByIdAndUpdate(id, {"address": item}).exec();
    },
    updatePassword  (token, item){
        return this.findOneAndUpdate(
            {"local.tokenRecoverPassword": token},
            {"local.password": item, "local.tokenRecoverPassword": null}
        ).exec();
    },
    findAll(){
        return this.find({},'_id local.email phone address balance').exec();
    }
};

UserSchema.methods = {
    comparePassword(password){
        return bcrypt.compare(password, this.local.password);
    }
};

module.exports = mongoose.model("user", UserSchema);
