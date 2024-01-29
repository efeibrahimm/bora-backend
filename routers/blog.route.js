const router = require('express').Router();
const blogController = require("../controller/blog.controller");


router.delete('/delete/:title', blogController.deleteBlogByTitle);
router.put('/update/:title', blogController.updateBlogContentByTitle);
router.post('/addblog', blogController.createBlog);
router.get('/allblogs', blogController.allblogs);

module.exports= router;