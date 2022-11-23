import {Op} from "sequelize"
import Tour from "../models/template/Tour.js"
import Category from '../models/Category.js'
import TourCategory from '../models/template/TourCategory.js'
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

const allTour = async (req,res)=>{
    res.locals.title="Videolar"
    const tours = await Tour.findAll({
        where:{
            isDeleted:false
        }
    })
    console.log(JSON.stringify(tours))
    await res.render('tour/tours', {tours})
}

const createOrUpdateTour = async (req,res)=>{

    const id = req.params.id

    if(id == undefined || id == null || id == ""){
        res.locals.title="Yeni Tur Ekle"
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

const createOrUpdateTourAjax = async (req,res)=>{
    
    const {id, category, description, sequence, day, dataSrcCoverUrl, dataSrcHeadImgUrl, persons, price, startedAt, finishedAt, isActive} = req.body
    let title = req.body.title

    if(category == undefined || category == null || category == ""){
        return res.status(400).send({isSuccess:false, message: "Lütfen kategori seçiniz"})
    }
    if (title == "" || title == null || title == undefined || title.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    if (startedAt == "" || startedAt == null || startedAt == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlama tarihi giriniz"})
    }
    if (finishedAt == "" || finishedAt == null || finishedAt == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen bitiş tarihi giriniz"})
    }
    title = title.trim()

    /* create */
    if(id == null || id == undefined || id == ""){
        
        const sameTour = await Tour.findOne({
            where:{
                title,
                isDeleted:false
            }
        })
        if (sameTour) {
            return res.send({isSuccess:false, message: "Bu isimde tur var. Lütfen farklı bir isim giriniz"})
        }

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
                
                console.log(key)
                await file.mv('public/webUI/image/' + fileName)
                fileArr =  {...fileArr, [key]:fileUrl}
            }
        }
        const t = await db.transaction()

        try{
            const tour = await Tour.create({
                title,
                sequence,
                description,
                day,
                persons,
                price,
                startedAt,
                finishedAt,
                coverUrl: fileArr.coverUrlFile ? fileArr.coverUrlFile : dataSrcCoverUrl ? dataSrcCoverUrl : null,
                headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                isActive:getCheckedBtn(isActive),
                isDeleted:false,
                createdAt:moment(),
                updatedAt: moment()
            }, { transaction: t })
            
            for (let i = 0; i < category.length; i++) {
                const item = category[i];
                await TourCategory.create({
                    tourId:tour.id,
                    categoryId:item
                }, { transaction: t })
            }
            await t.commit()
            await res.send({isSuccess:true, message:'Tur başarıyla eklendi'})
        } catch(err){
            console.log(err)
            await t.rollback()
            await res.send({isSuccess:false, message:'Bir hata oluştu'})
        }

        /* update */
    }else{ 
        
        const sameTour = await Tour.findOne({
            where:{
                title,
                id:{
                    [Op.ne]: id,
                },
                isDeleted:false
            }
        })

        if (sameTour && id != sameTour.id) {
            return res.status(400).send({isSuccess:false, message: "Bu başlıkta tur var. Lütfen farklı bir başlık giriniz"})
        }

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
                
                console.log(key)
                await file.mv('public/webUI/image/' + fileName)
                fileArr =  {...fileArr, [key]:fileUrl}
            }
        }
        
        try {
            const result = await db.transaction(async (t) => {
                const tour = await Tour.update({
                    title,
                    description,
                    sequence,
                    day,
                    persons,
                    price,
                    startedAt,
                    finishedAt,
                    coverUrl: fileArr.coverUrlFile ? fileArr.coverUrlFile : dataSrcCoverUrl ? dataSrcCoverUrl : null,
                    headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                    isActive:getCheckedBtn(isActive),
                    updatedAt: moment()
                }, {
                    where:{
                        id
                    }
                }, { transaction: t })
    
                await TourCategory.destroy({
                    where:{
                        tourId:id
                    }
                }, { transaction: t })
    
                for (let i = 0; i < category.length; i++) {
                    const item = category[i];
                    await TourCategory.create({
                        tourId:id,
                        categoryId:item
                    }, { transaction: t })
                }
                return tour
            })
            await res.send({isSuccess:true, message:'Tur başarıyla güncellendi'})
        } catch (err) {
            console.log(err)
            await res.send({isSuccess:false, message:'Bir hata oluştu'})
        }
    }
}






const addTour = async (req,res)=>{
    res.locals.title="Yeni Ekle"

    let categories = await Category.findAll({
        where:{
            isDeleted:false,
            isActive:true
        }
    })

    /* parent olan kategorileri göndermemek icin */
    /* let parents = categories.map(el => el.parentId)
    categories = categories.filter(el => {
        return !parents.includes(el.id)
    }) */

    await res.render('tour/addTour', {categories})
}

const updateTour = async (req,res)=>{

    res.locals.title = ""
    const id = req.params.id

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

    /* let parents = categories.map(el => el.parentId)
    categories = categories.filter(el => {
        return !parents.includes(el.id)
    })*/

    const tour = await Tour.findByPk(id, {
        where:{
            isDeleted:false
        }
    }).then(tour=>{
        res.locals.title = tour.title
        res.render('tour/updateTour', {isSuccess:true, tour, categories, categoryIds})
    }).catch(err=>{
        res.render('tour/updateTour', {isSuccess:false, tour:{}, categories:[], categoryIds:[]})
    })
}

const addTourAjax = async (req,res)=>{
    
    const {category, title, sequence, duration, isActive} = req.body
    
    if (title == "" || title == null || title == undefined) {
        return res.send({isSuccess:false, message: "Lütfen isim giriniz"})
    }

    const sameTour = await Tour.findOne({
        where:{
            title
        }
    })

    if (sameTour) {
        return res.send({isSuccess:false, message: "Bu isimde tur var. Lütfen farklı bir isim giriniz"})
    }
    
    const t = await db.transaction()

    try{

        const tour = await Tour.create({
            title,
            sequence,
            duration,
            url:"/videos/" + req.file.filename,
            isActive:getCheckedBtn(isActive),
            isDeleted:false,
            createdAt:moment(),
            updatedAt: moment()
        }, { transaction: t })

        for (let i = 0; i < category.length; i++) {
            const item = category[i];

            await VideoCategory.create({
                videoId:video.id,
                categoryId:item
            }, { transaction: t })
        }
        
        await t.commit()
        await res.send({isSuccess:true, message:'Video başarıyla eklendi'})
    } catch(err){
        console.log(err)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const updateTourAjax = async (req,res)=>{

    const { id, category, duration, isActive } = req.body
    const title = req.body.title.trim()

    if (title == "" || title == null || title == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    if (category == "" || category == null || category == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen kategori seçiniz"})
    }
    
    const sameVideo = await Video.findOne({
        where:{
            title,
            id:{
                [Op.ne]: id,
            }
        }
    })

    if (sameVideo && id != sameVideo.id) {
        return res.status(400).send({isSuccess:false, message: "Bu başlıkta video var. Lütfen farklı bir başlık giriniz"})
    }
    
    try {

        const result = await db.transaction(async (t) => {

            const video = await Video.update({
                title,
                duration,
                isActive:getCheckedBtn(isActive),
                updatedAt: moment()
            }, {
                where:{
                    id
                }
            }, { transaction: t })

            await VideoCategory.destroy({
                where:{
                    videoId:id
                }
            }, { transaction: t })

            for (let i = 0; i < category.length; i++) {
                const item = category[i];
                await VideoCategory.create({
                    videoId:id,
                    categoryId:item
                }, { transaction: t })
            }

            return video
        })

        await res.send({isSuccess:true, message:'Video başarıyla güncellendi'})
    } catch (err) {
        console.log(err)
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const updateTourFileAjax = async (req,res)=>{

    const id = req.body.id
    
    try {
        const result = await db.transaction(async (t) => {

            const video = await Video.update({
                url:"/videos/" + req.file.filename,
                updatedAt: moment()
            }, {
                where:{
                    id
                }
            }, { transaction: t })

            return video
        })

        await res.send({isSuccess:true, message:'Video dosyası başarıyla güncellendi'})
    } catch (err) {
        console.log(err)
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const deleteTourAjax = async (req,res)=>{
    const id = req.body.id

    let videos = await Video.findAll({
        where:{
            isDeleted:false
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id})
    })

    let childVideo = videos.filter(el=>el.parentId == id)
    retList = abc(childVideo, videos)
    childVideo = childVideo.map(el=>el.id)
    let removedIds = [...childVideo, ...retList, parseInt(id)]

    const video = await Video.update({
        isDeleted:true,
        updatedAt: moment()
    }, {
        where:{
            id:removedIds
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id, removedIds})
    })
    await res.send({isSuccess:true, message: "Kategori başarıyla silindi", id, removedIds})
}

const toursToCategory = async (req,res)=>{

    res.locals.title="Yeni Ekle"

    let categories = await Category.findAll({
        where:{
            isDeleted:false,
            isActive:true
        }
    })

    await res.render('video/videosToCategory', {categories, category:"a", videos:[], unselectedVideos:[]})
}

const toursToCategoryAjax = async (req,res)=>{
    const id = req.body.id

    console.log(id)

    let videoIds = await VideoCategory.findAll({
        where:{
            categoryId:id
        }
    })
    videoIds = videoIds.map(el=>el.id)
    const videos = await Video.findAll({
        where:{
            isDeleted:false
        }
    })
    let selectedvideos = videos.filter(el => videoIds.includes(el.id))
    let unselectedVideos = videos.filter(el => !videoIds.includes(el.id))
    console.log(JSON.stringify(selectedvideos))
    await res.send({isSuccess:true, videos:selectedvideos, unselectedVideos})
}



function abc(arr, categories){
    let result = []
    
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        
        let childCategories = categories.filter(el=>el.parentId == item.id)

        if(childCategories.length > 0){
            let itemChildIds = childCategories.map(el=>el.id)
            result.push(...itemChildIds)
            result = result.concat(abc(childCategories, categories))
        }
    }
    return result
}
function isChildren(item){
    if(item.children){
        for (let i = 0; i < item.children.length; i++) {
            isChildren(item.children[i])
        }
        sirala(item.children)
    }
}

function sirala(arr){
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if(arr[j].sequence > arr[j + 1].sequence){
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }
}

function adjustCategoryList(arr, id) {
    let result = []

    for(let i = 0; i < arr.length; i++){
        if(arr[i].hasOwnProperty('children')){
            result.push({
                id:arr[i].id,
                parentId:id,
                has:true
            })
            result = result.concat(adjustCategoryList(arr[i].children, arr[i].id))
        }else{
            result.push({
                id:arr[i].id,
                parentId:id,
                has:false
            })
        }
    }
    return result
}


export default {
    allTour,
    createOrUpdateTour,
    createOrUpdateTourAjax,
    addTour,
    updateTour,
    addTourAjax,
    updateTourAjax,
    updateTourFileAjax,
    deleteTourAjax,
    toursToCategory,
    toursToCategoryAjax
}