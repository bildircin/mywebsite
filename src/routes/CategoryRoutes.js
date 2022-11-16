import express from 'express'
const router = express.Router()
import categoryController from '../controllers/CategoryController.js'

router.get('/kategoriler', categoryController.allCategories)
router.get('/kategori-ekle', categoryController.addCategory)
router.get('/kategori-guncelle/:id', categoryController.updateCategory)
router.post('/addCategoryAjax', categoryController.addCategoryAjax)
router.post('/updateCategoryAjax', categoryController.updateCategoryAjax)
router.post('/deleteCategoryAjax', categoryController.deleteCategoryAjax)

router.get('/kategori-siralama', categoryController.sequenceCategory)
router.post('/seqenceCategoryUpdateAjax', categoryController.seqenceCategoryUpdateAjax)

export default router;