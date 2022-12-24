import express from 'express'
const router = express.Router()
import pageContentController from '../controllers/PageContentController.js'


router.get('/icerik-guncelleme', pageContentController.createOrUpdatePageContent)
router.post('/createOrUpdatePageContentGetValueAjax', pageContentController.createOrUpdatePageContentGetValueAjax)
router.post('/createOrUpdatePageContentSetValueAjax', pageContentController.createOrUpdatePageContentSetValueAjax)

export default router;
