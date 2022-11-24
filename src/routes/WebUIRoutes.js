import express from 'express'
const router = express.Router()
import webUIController from '../controllers/WebUIController.js'

router.use(webUIController.setLang)
router.get('/', webUIController.homePage)
router.get('/hakkimizda', webUIController.aboutPage)
router.get('/iletisim', webUIController.contactPage)

export default router;