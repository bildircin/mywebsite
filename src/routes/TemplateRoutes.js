const express = require('express')
const router = express.Router()
const path = require('path')
const templateController = require('../controllers/TemplateController')

router.get('/navigasyonlar', templateController.navigations)
router.post('/sequenceNavigationUpdateAjax', templateController.sequenceNavigationUpdateAjax)
router.post('/createOrUpdateNavAjax', templateController.createOrUpdateNavAjax)
router.post('/deleteNavigationAjax', templateController.deleteNavigationAjax)

module.exports = router;