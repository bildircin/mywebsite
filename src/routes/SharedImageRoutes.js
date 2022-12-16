import express from 'express'
const router = express.Router()
import sharedImageController from '../controllers/SharedImageController.js'

router.get('/paylasilan-resimler', sharedImageController.all)
router.post('/createSharedImageAjax', sharedImageController.createSharedImageAjax)
router.post('/deleteSharedImageAjax', sharedImageController.deleteSharedImageAjax)


export default router;