const userModel = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserService {
    static async registerUser(email, password, ad_soyad) {
        try {
            if (ad_soyad === undefined || ad_soyad === null) {
                throw new Error('ad_soyad is required');
            }
    
            const createUser = new userModel({ email, password, ad_soyad });
            return await createUser.save();
        } catch (err) {
            throw err;
        }
    }
    

    static async chechUser(email, password) {
        try {
            return await userModel.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    static async generateToken(tokenData, secretKey, jwt_expire) {
        return jwt.sign(tokenData, secretKey, { expiresIn: jwt_expire });
    }

    static async changePassword(email, currentPassword, newPassword) {
        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                throw new Error('Mevcut şifre geçersiz');
            }

            // Yeni şifreyi hashleme
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Kullanıcıyı bul ve şifresini güncelle
            const updatedUser = await userModel.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true } // Güncellenmiş kullanıcıyı döndür
            );

            if (!updatedUser) {
                throw new Error('Kullanıcı bulunamadı');
            }

            return updatedUser;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;