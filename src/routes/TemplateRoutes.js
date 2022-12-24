import express from 'express'
const router = express.Router()
import templateController from '../controllers/TemplateController.js'




router.get('/navigasyonlar', templateController.navigations)
router.post('/sequenceNavigationUpdateAjax', templateController.sequenceNavigationUpdateAjax)
router.post('/createOrUpdateNavAjax', templateController.createOrUpdateNavAjax)
router.post('/deleteNavigationAjax', templateController.deleteNavigationAjax)

router.get('/sayfalar', templateController.pages)
router.get('/sayfa-kaydet/:id?', templateController.createOrUpdatePage)
router.post('/createOrUpdatePageAjax', templateController.createOrUpdatePageAjax)

router.get('/dil-deger-guncelleme', templateController.createOrUpdateLanguageItem)
router.post('/createOrUpdateLanguageItemGetAjax', templateController.createOrUpdateLanguageItemGetAjax)
router.post('/createOrUpdateLanguageItemSaveAjax', templateController.createOrUpdateLanguageItemSaveAjax)
router.post('/createOrUpdateLanguageItemCreateAjax', templateController.createOrUpdateLanguageItemCreateAjax)







export default router;
