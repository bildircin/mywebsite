import express from 'express'
const router = express.Router()
import multer  from 'multer'
import tourController from '../controllers/TourController.js'

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'public/webUI/image')
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now() + "." + file.mimetype.substring(file.mimetype.search("/") + 1))
    }
})

const upload = multer({storage:storage})

router.get('/turlar', tourController.allTour)
router.get('/tur-kaydet/:id?', tourController.createOrUpdateTour)
router.post('/createOrUpdateTourAjax', upload.fields([{ name: 'coverUrlFile' }, { name: 'headImgUrlFile' }]), tourController.createOrUpdateTourAjax)

export default router;