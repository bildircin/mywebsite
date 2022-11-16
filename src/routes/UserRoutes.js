import express from 'express'
const router = express.Router()
import userController from '../controllers/UserController.js'

//router.get('/', userController.allUsers)
router.get('/kullanicilar', userController.allUsers)
router.get('/kullanici-ekle', userController.addUser)
router.get('/kullanici-guncelle/:id', userController.updateUser)
router.post('/addUserAjax', userController.addUserAjax)
router.post('/updateUserAjax', userController.updateUserAjax)
router.post('/deleteUserAjax', userController.deleteUserAjax)


export default router;