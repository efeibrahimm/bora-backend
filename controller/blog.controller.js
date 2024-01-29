const blogService = require('../services/blog.services');
const EngineerService = require('../services/engineer.services');

exports.createBlog = async (req, res, next) => {
    try {
      // req.body'den gelen verileri al
      const { title, icerik, engineer_id} = req.body;
  
      // Blog oluşturma servisini çağır
      const createdBlog = await blogService.createBlog(title, icerik, engineer_id);
  
      // Başarıyla oluşturulan blogu yanıtla
      res.json({ status: true, success: 'Blog created successfully', blog: createdBlog });
    } catch (error) {
      // Hata durumunda hata mesajını ve durumu yanıtla
      console.error('Blog oluşturma sırasında bir hata oluştu:', error);
      res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
  };
exports.deleteBlogByTitle = async(req, res)=>{
    try {
        const { title } = req.params;

        const successRes = await blogService.deleteBlogByTitle(title);
        res.json({status:true,success:"Blog başariyla  silindi"});


    } catch (error) {
        throw error;
    }
}

exports.updateBlogContentByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const { newContent } = req.body;

        const updatedBlog = await blogService.updateContentByTitle(title, newContent);

        res.json({ status: true, success: "Blog içeriği başarıyla güncellendi", updatedBlog });
    } catch (error) {
      
        throw error;
    }
}

exports.allblogs = async (req, res) => {
    try {
        const allBlogs = await blogService.allblogs();
        res.json(allBlogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};
