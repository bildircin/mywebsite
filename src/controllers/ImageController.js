import {Op} from "sequelize"
import Image from "../models/Image.js"
import moment from 'moment'
import db from '../../db.js'
import { getCheckedBtn } from "../../globalFunctions.js"
import mime from 'mime-types'
import fs from 'fs'

const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

const all = async (req,res)=>{
    res.locals.title="Resimler"
    const images = await Image.findAll({})
    await res.render('image/images', {images})
}

const createImageAjax = async (req,res)=>{

    console.log(req.files)
 
    let fileObj = {}

    if(req.files != null && req.files.coverUrlFile){
        const file = req.files.coverUrlFile

        if (file.size > 3000001) {
            return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
        }else if(!whitelist.includes(file.mimetype)){
            return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
        }
        let fileType = mime.extension(file.mimetype)
        let fileName = Date.now() + '.' + fileType
        let fileUrl = '/webUI/public-image/' + fileName;
        fileObj =  {
            name:file.name,
            url:fileUrl
        }
        
        await file.mv('public/webUI/public-image/' + fileName)
    }else{
        return res.status(400).send({isSuccess:false, message: "Resim seçiniz"})
    }

    const t = await db.transaction()

    try{
        const image = await Image.create({
            title:fileObj.title ? fileObj.title : null,
            url: fileObj.url ? fileObj.url : dataSrcCoverUrl ? dataSrcCoverUrl : null
        }, { transaction: t })
        
        await t.commit()
        await res.send({isSuccess:true, message:'Resim eklendi', image})
    } catch(err){
        console.log(err)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const deleteImageAjax = async (req,res)=>{
    const id = req.body.id

    if(id == "" || id == null || id == undefined){
        return res.status(400).send({isSuccess:false, message: "Sayfayı yenileyip tekrar deneyiniz!"})
    }

    const t = await db.transaction()
    try {

        const imageId = await Image.destroy({
            where:{
                id
            }
        })
        //fs.unlinkSync(image.url);

        await t.commit()
        await res.send({isSuccess:true, message:'Resim silindi', imageId})
    } catch (error) {
        console.log(error)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

export default {
    all,
    createImageAjax,
    deleteImageAjax
}