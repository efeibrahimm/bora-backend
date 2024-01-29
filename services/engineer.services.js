const engineerModel = require('../model/engineerModel');
const blogModel = require('../model/blogModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');

class EngineerService{
    static async registerEngineer(email,password,Ad_soyad){
        try {
              const createEngineer = new engineerModel({email,password,Ad_soyad})
              return await createEngineer.save();
        } catch (err) {
            throw err;
        }
    }

    static async chechEngineer(email,password){
        try {
            return await engineerModel.findOne({email});
        } catch (error) {
            throw error;
        }
    }

    static async generateToken(tokenData,secretKey,jwt_expire){
        return jwt.sign(tokenData,secretKey,{expiresIn:jwt_expire});
    }

    static async  changePassword(email, currentPassword, newPassword) {
        try {
            
            const engineer = await engineerModel.findOne({email});
    
            if (!engineer) {
                throw new Error('Kullanıcı bulunamadı');
            }
    
            const isPasswordValid = await bcrypt.compare(currentPassword, engineer.password);
    
            if (!isPasswordValid) {
                throw new Error('Mevcut şifre geçersiz');
            }
    
            // Yeni şifreyi hashleme
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
            // Kullanıcıyı bul ve şifresini güncelle
            const updatedEngineer = await engineerModel.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true } // Güncellenmiş kullanıcıyı döndür
            );
    
            if (!updatedEngineer) {
                throw new Error('Kullanıcı bulunamadı');
            }
    
            return updatedEngineer;
        } catch (error) {
            throw error;
        }
    }
    static async getAllEngineers() {
        try {
            const engineers = await engineerModel.find();
            return engineers;
        } catch (error) {
            throw error;
        }
    }
    static async updateTokenById(id, newToken) {
        try {
          // MongoDB ObjectID'ye çevirme işlemi
          const objectId = new mongoose.Types.ObjectId(id); // 'new' anahtar kelimesini ekleyin
    
          // Veritabanında güncelleme işlemi
          const updatedEngineer = await engineerModel.findByIdAndUpdate(
            objectId,
            { $set: { token: newToken } },
            { new: true }
          );
    
          if (!updatedEngineer) {
            throw new Error('Mühendis bulunamadı');
          }
    
          return updatedEngineer;
        } catch (error) {
          throw error;
        }
      }
    
   
    
}

module.exports =  EngineerService;