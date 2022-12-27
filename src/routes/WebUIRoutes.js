import express from 'express'
const router = express.Router()
import webUIController from '../controllers/WebUIController.js'

router.use(webUIController.setSettings) // ilk olmalı buradaki currentLng setCurrenLang da kullanılıyor
router.use(webUIController.setCurrentLang)
router.use(webUIController.setLayoutContents)
router.use(webUIController.setNavigations)
router.use(webUIController.setLanguageCode)
router.get('/', webUIController.homePage)
router.get('/hakkimizda', webUIController.aboutPage)
router.get('/iletisim', webUIController.contactPage)
router.get('/turlar', webUIController.toursPage)
router.get('/tur-detay/:url', webUIController.tourSinglePage)
router.get('/blog', webUIController.blogsPage)
router.get('/blog-detay/:url', webUIController.blogSinglePage)

router.get('/404', webUIController.page404) 


export default router;