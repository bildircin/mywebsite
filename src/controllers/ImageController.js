import Image from "../models/Image.js"
import db from '../../db.js'
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

    //query
    const page = req.query.page ? parseInt(req.query.page) : 1
    const limit = 6
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const imageCount = await Image.count({})
    const paginatedResults = {
        pageCount:Math.ceil(imageCount / limit),
        page
    }
    if (endIndex < imageCount) {
        paginatedResults.next = {
            page: page + 1
        }
    }
    if (startIndex > 0) {
        paginatedResults.previous = {
            page: page - 1
        }
    }
    const t = await db.transaction()

    try {
        const images = await Image.findAll({
            offset:startIndex,
            limit:limit,
            order:[
                ['id', 'DESC']
            ]
        })
        
        console.log(paginatedResults)
        await t.commit()
        await res.render('image/images', {images, paginatedResults})
    } catch (error) {
        await t.rollback()
        await res.render('image/images', {images:[], paginatedResults})
    }
}

const createImageAjax = async (req,res)=>{

    console.log(req.files)
 
    let fileObj = {}

    if(req.files != null && req.files.coverUrlFile){
        const file = req.files.coverUrlFile

        if (file.size > 5000000) {
            return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
        }else if(!whitelist.includes(file.mimetype)){
            return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
        }
        let fileType = mime.extension(file.mimetype)
        let fileName = Date.now() + '.' + fileType
        let fileUrl = '/webUI/image/' + fileName;
        fileObj =  {
            name:file.name,
            url:fileUrl
        }
        
        await file.mv('public/webUI/image/' + fileName)
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

        const image = await Image.findOne({where: { id }
         }).then((result) => {
            return Image.destroy({where:{id}})
                .then((u) => {return result})
         })
        fs.unlinkSync('public' + image.url);

        await t.commit()
        await res.send({isSuccess:true, message:'Resim silindi', image})
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