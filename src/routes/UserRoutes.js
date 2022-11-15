const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserController')

//router.get('/', userController.allUsers)
router.get('/kullanicilar', userController.allUsers)
router.get('/kullanici-ekle', userController.addUser)
router.get('/kullanici-guncelle/:id', userController.updateUser)
router.post('/addUserAjax', userController.addUserAjax)
router.post('/updateUserAjax', userController.updateUserAjax)
router.post('/deleteUserAjax', userController.deleteUserAjax)


module.exports = router;