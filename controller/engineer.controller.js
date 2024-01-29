const EngineerService = require('../services/engineer.services');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

exports.register = async (req, res, next) => {
    try {
        const { email, password, Ad_soyad } = req.body;

        const successRes = await EngineerService.registerEngineer(email, password, Ad_soyad);
        res.json({ status: true, success: "Engineer Registered Succesfuly" });


    } catch (error) {
        throw error;
    }
}


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const engineer = await EngineerService.chechEngineer(email);
        if (!engineer) {
            throw new Error('engineer dont exist');
        }

        const isMatch = await engineer.comparePassword(password);

        if (isMatch === false) {
            throw new Error('Password Invalid');
        }

        let tokenData = { _id: engineer._id, email: engineer.email };

        const token = await EngineerService.generateToken(tokenData, "secretKey", '1h');

        res.status(200).json({ status: true, token: token });

    } catch (error) {
        throw error;
    }
}
exports.changePassword = async (req, res, next) => {
    try {

        const { email, currentPassword, newPassword } = req.body;
        const updatedEngineer = await EngineerService.changePassword(email, currentPassword, newPassword);
        console.log('Şifre değiştirme başarılı:', updatedEngineer);
        res.json({ status: true, success: 'Password Changed Successfully', engineer: updatedEngineer });
    } catch (error) {
        console.error('Şifre değiştirme sırasında bir hata oluştu:', error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    }

}
exports.getAllEngineers = async (req, res) => {
    try {
        const engineers = await EngineerService.getAllEngineers();
        res.json({ status: true, engineers });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
exports.updateTokenById = async (req, res) => {
    try {
        const { _id, newToken } = req.body;
        const updatedEngineer = await EngineerService.updateTokenById(_id, newToken);
        res.json({ status: true, updatedEngineer });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

