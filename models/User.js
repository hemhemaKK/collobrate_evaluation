const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name:{type:String, required:[true, 'please enter your name']},
        email:{type:String, required:[true, 'please enter your email']},
        password:{type:String, required:[true, 'please enter your password']},
        role:{enum:["admin", "member"]}
    }
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

userSchema.methods.matchPassword = function (enteredPassword){
    return bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)
module.exports = User;