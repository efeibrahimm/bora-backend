const mongoose = require('mongoose')

const connection = mongoose.createConnection('mongodb+srv://alialpershn09:qijEfFg7xiPadZKV@verimyolu.hjdbl51.mongodb.net/').on('open', ()=>{
    console.log("MongoDb Connected");
}).on('error',()=>{
    console.log("MongoDb Connection error");

})

module.exports = connection;