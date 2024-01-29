const mongoose = require('mongoose');
const db = require('../config/db');
const engineerModel = require('./engineerModel');

const { Schema } = mongoose;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    icerik: {
        type: String,
        required: true
    },
    engineer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: engineerModel,
        require: true
    },
    onay_durumu: {
        type: Boolean,
        default: false
    }
});



const blogModel = db.model('blog', blogSchema);

module.exports = blogModel;