const blogModel = require('../model/blogModel');
const jwt = require('jsonwebtoken');

class blogService {
    static async createBlog(title, icerik, engineer_id, req) {
        try {
            // Blog modelini kullanarak yeni bir blog oluştur
            const newBlog = new blogModel({ title, icerik, engineer_id });

            // Oluşturulan blogu kaydet
            const savedBlog = await newBlog.save();

            return savedBlog;
        } catch (error) {
            throw error;
        }
    }


    static async deleteBlogByTitle(title) {
        try {
            // Belirtilen başlığa sahip blogu bul
            const blogToDelete = await blogModel.findOne({ title });

            // Blog bulunamazsa hata fırlat
            if (!blogToDelete) {
                throw new Error('Belirtilen başlık ile blog bulunamadı.');
            }

            // Blogu sil
            await blogToDelete.deleteOne();

            return blogToDelete;
        } catch (err) {
            throw err;
        }
    }

    static async updateBlogByTitle(title, newContent) {
        try {
            // Belirtilen başlığa sahip blogu bul ve içeriğini güncelle
            const updatedBlog = await this.findOneAndUpdate(
                { title },
                { icerik: newContent },
                { new: true } // Güncellenmiş blogu döndürmek için
            );

            // Blog bulunamazsa hata fırlat
            if (!updatedBlog) {
                throw new Error('Belirtilen başlık ile blog bulunamadı.');
            }

            return updatedBlog;
        } catch (err) {
            throw err;
        }
    }

    static async allblogs() {
        try {
            const blogs = await blogModel.find().populate('engineer_id');
            return blogs;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = blogService;