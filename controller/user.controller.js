const UserService = require('../services/user.sevices');
const bcrypt = require('bcrypt');

exports.register = async (req, res, next) => {
    try {
        const { email, password, ad_soyad } = req.body;


        // console.log(req.body);
        if (!ad_soyad) {
            throw new Error('ad_soyad field is required');
        }

        const successRes = await UserService.registerUser(email, password, ad_soyad);
        res.json({ status: true, success: "User Registered Successfully" });
    } catch (error) {
        console.error('User registration failed:', error);
        res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
    }
}




exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await UserService.chechUser(email);

        if (!user) {
            throw new Error('User dont exist');
        }

        const isMatch = await user.comparePassword(password);

        if (isMatch === false) {
            throw new Error('Password Invalid');
        }

        let tokenData = { _id: user._id, email: user.email };

        const token = await UserService.generateToken(tokenData, "secretKey", '1h');

        res.status(200).json({ status: true, token: token, user: user });

    } catch (error) {
        throw error;
    }
}
exports.changePassword = async (req, res, next) => {
    try {

        const { email, currentPassword, newPassword } = req.body;
        const updatedUser = await UserService.changePassword(email, currentPassword, newPassword);
        console.log('Şifre değiştirme başarılı:', updatedUser);
        res.json({ status: true, success: 'Password Changed Successfully', user: updatedUser });
    } catch (error) {
        console.error('Şifre değiştirme sırasında bir hata oluştu:', error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    }

};