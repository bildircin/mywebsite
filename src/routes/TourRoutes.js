import express from 'express'
const router = express.Router()
import tourController from '../controllers/TourController.js'


router.get('/tur-listesi', tourController.allTour)
router.get('/tur-kaydet/:id?', tourController.createOrUpdateTour)
router.post('/createOrUpdateTourAjax', tourController.createOrUpdateTourAjax)

export default router;