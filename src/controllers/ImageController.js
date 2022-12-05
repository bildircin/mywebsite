import {Op} from "sequelize"
import Image from "../models/Image.js"
import moment from 'moment'
import db from '../../db.js'
import { getCheckedBtn } from "../../globalFunctions.js"
import mime from 'mime-types'

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

const createOrUpdate = async (req,res)=>{

    const id = req.params.id

    if(id == undefined || id == null || id == ""){
        res.locals.title="Yeni Ekle"
        let categories = await Category.findAll({
            where:{
                isDeleted:false,
                isActive:true
            }
        })
        const tour = Tour.build()
        tour.isActive = true
        await res.render('tour/createOrUpdateTour', {isSuccess:false, tour, categories, categoryIds:[]})
    }else{

        let categoryIds = await TourCategory.findAll({
            where:{
                tourId:id            
            }
        })
        categoryIds = categoryIds.map(el => el.categoryId)
        
        let categories = await Category.findAll({
            where:{
                [Op.or]:[
                    {
                        isDeleted:false,
                        isActive:true
                    },
                    {
                        id:categoryIds
                    }
                ]
            }
        })
    
        const tour = await Tour.findByPk(id, {
            where:{
                isDeleted:false
            }
        }).then(tour=>{
            res.locals.title = tour.title + ' Güncelleme'
            res.render('tour/createOrUpdateTour', {isSuccess:true, tour, categories, categoryIds})
        }).catch(err=>{
            res.render('tour/createOrUpdateTour', {isSuccess:false, tour:{}, categories:[], categoryIds:[]})
        })
    }
}

const createImageAjax = async (req,res)=>{

    console.log(req.files)
 
    let fileArr = {}

    if(req.files != null){
        for (let key in req.files) {
            const file = req.files[key];

            if (file.size > 3000001) {
                return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
            }else if(!whitelist.includes(file.mimetype)){
                return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
            }
        }
        for (let key in req.files) {
            const file = req.files[key];
            let fileType = mime.extension(file.mimetype)
            let fileName = Date.now() + '.' + fileType
            let fileUrl = '/webUI/image/' + fileName;
            
            await file.mv('public/webUI/image/' + fileName)
            fileArr =  {...fileArr, [key]:fileUrl}
        }
    }

    const t = await db.transaction()

    try{
        const image = await Image.create({
            url: fileArr.coverUrlFile ? fileArr.coverUrlFile : dataSrcCoverUrl ? dataSrcCoverUrl : null
        }, { transaction: t })
        
        await t.commit()
        await res.send({isSuccess:true, message:'Resim eklendi'})
    } catch(err){
        console.log(err)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}



export default {
    all,
    createOrUpdate,
    createImageAjax
}