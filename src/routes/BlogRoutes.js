import express from 'express'
const router = express.Router()
import blogController from '../controllers/BlogController.js'

router.get('/blog-listesi', blogController.blogs)
router.get('/blog-kaydet/:id?', blogController.createOrUpdateBlog)
router.post('/createOrUpdateBlogAjax', blogController.createOrUpdateBlogAjax)



export default router;