const mongoose = require('mongoose');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const {Schema } = mongoose;

const engineerSchema = new Schema({
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
    Ad_soyad:{
        type:String,
        required:false
        
    },
    token:{
        type:String
    }
    
});

engineerSchema.pre('save', async function () {
    try {
        var engineer = this;
        const salt = await bcrypt.genSalt(10);
        const hassPass = await bcrypt.hash(engineer.password,salt);

        engineer.password = hassPass;
    } catch (error) {
        throw error;
    }
});



engineerSchema.methods.comparePassword = async function(engineerPassword){
    try {
        const isMatch = await bcrypt.compare(engineerPassword,this.password);
        return isMatch;


    } catch (error) {
        throw error;
    }
}

const engineerModel = db.model('engineer',engineerSchema);

module.exports = engineerModel;