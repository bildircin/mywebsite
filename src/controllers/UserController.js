import { Op } from "sequelize"
import User from '../models/User.js'
import moment from 'moment'
import { getCheckedBtn } from "../../globalFunctions.js"


const allUsers = async (req,res)=>{
    res.locals.title="Kullanıcılar"
    if(req.user && req.user.type == 1){
        const users = await User.findAll({
            where:{
                isDeleted:false
            }
        })
        await res.render('user/users', {users})
    }
    await res.render('layouts/notAuthorized')
}

const addUser = async (req,res)=>{
    res.locals.title="Yeni Ekle"
    if(req.user.type == 0){
        await res.render('layouts/notAuthorized')
    }
    await res.render('user/addUser')
}

const updateUser = async (req,res)=>{

    res.locals.title = ""
    if(req.user.type == 0){
        await res.render('layouts/notAuthorized')
    }
    const id = req.params.id
    const user = await User.findByPk(id, {
        where:{
            isDeleted:false
        }
    }).then(user=>{
        res.locals.title = user.name
        res.render('user/updateUser', {isSuccess:true, user})
    }).catch(err=>{
        res.render('user/updateUser', {isSuccess:false, user:{}})
    })
}

const addUserAjax = async (req,res)=>{
    
    const { nameAndSurname, userName, email, type, isActive, password, password2 } = req.body

    const isUserName = await User.findOne({ where: { userName } })
    const isEmail = await User.findOne({ where: { email } })

    
    if (!(nameAndSurname && userName && email && password && password2)) {
        return res.status(400).send({isSuccess:false, message: "Lütfen zorunlu alanları doldurun."})
    }
    if (isUserName) {
        return res.status(409).send({isSuccess:false, message: "Bu kullanıcı adı kayıtlı. Lütfen tekrar deneyin."})
    }
    if (isEmail) {
        return res.status(409).send({isSuccess:false, message: "Bu email adresi kayıtlı. Lütfen tekrar deneyin."})
    }
    if (password != password2) {
        return res.status(400).send({isSuccess:false, message: "Şifre tekrarı aynı olmalıdır. Lütfen tekrar deneyin."})
    }
    /*
    if (!req.user.type) {
        return res.status(409).send({isSuccess:false, message: "Bu işlemi yapma yetkiniz yok"})
    }
    */

    // bosluk kontrolu
    if(userName.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz kullanıcı adı. Lütfen tekrar deneyin."})
    }
    if(email.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz email. Lütfen tekrar deneyin."})
    }
    if(password.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz parola. Lütfen tekrar deneyin."})
    }
   
    const user = await User.create({
        nameAndSurname,
        userName,
        email: email.toString().toLowerCase(),
        password: password,
        type: type,
        isActive:getCheckedBtn(isActive),
        isDeleted:false,
        phone:0,
        createdAt: moment(),
        updatedAt: moment()
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu"})
        console.log(err)
    })
    await res.send({isSuccess:true, message: "Kullanıcı başarıyla eklendi"})
        
}

const updateUserAjax = async (req,res)=>{

    const {id, nameAndSurname, userName, email, type, isActive, password, password2 } = req.body
    const isUserName = await User.findOne({ where: { 
        userName ,
        id:{
            [Op.ne]: id,
        }
    } })
    const isEmail = await User.findOne({ where: { 
        email ,
        id:{
            [Op.ne]: id,
        }
    } })
    
    if (!(nameAndSurname && userName && email && password && password2)) {
        return res.status(400).send({isSuccess:false, message: "Lütfen zorunlu alanları doldurun."})
    }
    if (isUserName) {
        return res.status(409).send({isSuccess:false, message: "Bu kullanıcı adı kayıtlı. Lütfen tekrar deneyin."})
    }
    if (isEmail) {
        return res.status(409).send({isSuccess:false, message: "Bu email adresi kayıtlı. Lütfen tekrar deneyin."})
    }
    if (password != password2) {
        return res.status(400).send({isSuccess:false, message: "Şifre tekrarı aynı olmalıdır. Lütfen tekrar deneyin."})
    }

    /* if (!req.user.type) {
        return res.status(409).send({isSuccess:false, message: "Bu işlemi yapma yetkiniz yok"})
    } */

    // bosluk kontrolu
    if(userName.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz kullanıcı adı. Lütfen tekrar deneyin."})
    }
    if(email.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz email. Lütfen tekrar deneyin."})
    }
    if(password.trim().search(' ') != -1){
        return res.status(409).send({isSuccess:false, message: "Geçersiz parola. Lütfen tekrar deneyin."})
    }
    
    
    const user = await User.update({
        nameAndSurname:nameAndSurname.trim(),
        userName:userName.trim(),
        email: email.toString().toLowerCase(),
        password: password.trim(),
        type: type,
        isActive:getCheckedBtn(isActive),
        isDeleted:false,
        phone:0,
        updatedAt: moment()
    }, {
        where:{
            id
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu"})
    })
    
    res.send({isSuccess:true, message: "Kullanıcı başarıyla güncellendi"})
}

const deleteUserAjax = async (req,res)=>{

    const id = req.body.id

    const user = await User.update({
        isDeleted:true,
        updatedAt: moment()
    }, {
        where:{
            id
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id})
    })
    await res.send({isSuccess:true, message: "Kullanıcı başarıyla silindi", id})
}



export default {
    allUsers,
    addUser,
    updateUser,
    addUserAjax,
    updateUserAjax,
    deleteUserAjax
}