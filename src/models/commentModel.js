import mongoose from "mongoose";

let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
    username: String,
    comment: {
        type: String,
        required: true
      },
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
});



module.exports = mongoose.model("comment", CommentSchema);
