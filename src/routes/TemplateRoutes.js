import express from 'express'
const router = express.Router()
import templateController from '../controllers/TemplateController.js'
import multer  from 'multer'

const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'public/webUI/image')
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now() + "." + file.mimetype.substring(file.mimetype.search("/") + 1))
    }
})

const fileFilter = (req, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
      //return cb(new Error('file is not allowed'))
      cb(null, false)
    }
}

const upload = multer({storage:storage, fileFilter:fileFilter})

router.get('/navigasyonlar', templateController.navigations)
router.post('/sequenceNavigationUpdateAjax', templateController.sequenceNavigationUpdateAjax)
router.post('/createOrUpdateNavAjax', templateController.createOrUpdateNavAjax)
router.post('/deleteNavigationAjax', templateController.deleteNavigationAjax)

router.get('/sayfalar', templateController.pages)
router.get('/sayfa-kaydet/:id?', templateController.createOrUpdatePage)
router.post('/createOrUpdatePageAjax', upload.fields([{ name: 'coverUrlFile' }]), templateController.createOrUpdatePageAjax)







export default router;
