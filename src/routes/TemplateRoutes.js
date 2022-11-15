const express = require('express')
const router = express.Router()
const path = require('path')
const templateController = require('../controllers/TemplateController')

router.get('/navigasyonlar', templateController.navigations)
router.post('/sequenceNavigationUpdateAjax', templateController.sequenceNavigationUpdateAjax)
router.post('/createOrUpdateNavAjax', templateController.createOrUpdateNavAjax)
router.post('/deleteNavigationAjax', templateController.deleteNavigationAjax)

router.get('/sayfalar', templateController.pages)
router.get('/sayfa-kaydet/:id?', templateController.createOrUpdatePage)







module.exports = router;
