import express from 'express'
const router = express.Router()
import settingsController from '../controllers/SettingsController.js'

router.get('/ayarlar', settingsController.settingPage)
router.post('/generalUpdateAjax', settingsController.generalUpdateAjax)
router.post('/emailUpdateAjax', settingsController.emailUpdateAjax)
router.post('/localizationUpdateAjax', settingsController.localizationUpdateAjax)

export default router;