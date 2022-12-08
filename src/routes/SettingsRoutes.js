import express from 'express'
const router = express.Router()
import settingsController from '../controllers/SettingsController.js'

router.get('/ayarlar', settingsController.settingPage)

export default router;