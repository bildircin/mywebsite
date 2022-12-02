import express from 'express'
const router = express.Router()
import webUIController from '../controllers/WebUIController.js'

router.use(webUIController.setLang)
router.use(webUIController.setLayoutContents)
router.use(webUIController.setNavigations)
router.get('/', webUIController.homePage)
router.get('/hakkimizda', webUIController.aboutPage)
router.get('/iletisim', webUIController.contactPage)
router.get('/turlar', webUIController.toursPage)

export default router;