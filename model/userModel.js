const mongoose = require('mongoose');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const {Schema } = mongoose;

const userSchema = new Schema({
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    ad_soyad:{
        type:String,
        required:false
        
    },
    token:{
        type:String,
        
    }
});

userSchema.pre('save', async function () {
    try {
        var user = this;
        const salt = await bcrypt.genSalt(10);
        const hassPass = await bcrypt.hash(user.password,salt);

        user.password = hassPass;
    } catch (error) {
        throw error;
    }
});



userSchema.methods.comparePassword = async function(userPassword){
    try {
        const isMatch = await bcrypt.compare(userPassword,this.password);
        return isMatch;


    } catch (error) {
        throw error;
    }
}

const userModel = db.model('user',userSchema);

module.exports = userModel;