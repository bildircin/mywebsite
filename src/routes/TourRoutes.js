const express = require('express')
const router = express.Router()
const path = require('path')
const multer  = require('multer')

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'public/webUI/image')
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now() + "." + file.mimetype.substring(file.mimetype.search("/") + 1))
    }
})

const upload = multer({storage:storage})
const tourController = require('../controllers/TourController')

router.get('/turlar', tourController.allTour)
router.get('/tur-kaydet/:id?', tourController.createOrUpdateTour)
router.post('/createOrUpdateTourAjax', upload.fields([{ name: 'coverUrlFile' }, { name: 'headImgUrlFile' }]), tourController.createOrUpdateTourAjax)

module.exports = router;