import express from 'express'
const router = express.Router()
import imageController from '../controllers/ImageController.js'

router.get('/resimler', imageController.all)
router.post('/createImageAjax', imageController.createImageAjax)


export default router;