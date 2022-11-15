const express = require('express')
const router = express.Router()
const path = require('path')


const multer  = require('multer')
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        console.log(__dirname)
        cb(null, 'public/videos')
    },

    filename:(req, file, cb)=>{
        console.log(file.mimetype)
        cb(null, Date.now() + "." + file.mimetype.substring(file.mimetype.search("/") + 1))
    }
})

const upload = multer({storage:storage})
const videoController = require('../controllers/VideoController')

router.get('/videolar', videoController.allVideos)
router.get('/video-ekle', videoController.addVideo)
router.get('/video-guncelle/:id', videoController.updateVideo)
router.get('/kategori-videolar', videoController.videosToCategory)
router.post('/addVideoAjax', upload.single('videoFile'), videoController.addVideoAjax)
router.post('/updateVideoAjax', videoController.updateVideoAjax)
router.post('/updateVideoFileAjax', upload.single('videoFile'), videoController.updateVideoFileAjax)
router.post('/deleteVideoAjax', videoController.deleteVideoAjax)
router.post('/videosToCategoryAjax', videoController.videosToCategoryAjax)
//router.post('/videosToCategoryUpdateAjax', videoController.videosToCategoryUpdateAjax)

module.exports = router;