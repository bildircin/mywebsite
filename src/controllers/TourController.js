import {Op} from "sequelize"
import Tour from "../models/template/Tour.js"
import Category from '../models/Category.js'
import Image from '../models/Image.js'
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
    
    const {id, category, description, sequence, day, dataSrcCoverUrl, dataSrcHeadImgUrl, dataSrcFlashDealUrl,
         persons, price, startedAt, finishedAt, isActive, overview, dayList, amenities, isFlashDeal } = req.body
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

                if (file.size > 5000000) {
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
            const tour = await Tour.create({
                title,
                sequence,
                description,
                day,
                persons,
                price,
                startedAt,
                finishedAt,
                overview,
                dayList,
                amenities,
                coverUrl: fileArr.coverUrlFile ? fileArr.coverUrlFile : dataSrcCoverUrl ? dataSrcCoverUrl : null,
                headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                flashDealUrl: fileArr.flashDealUrlFile ? fileArr.flashDealUrlFile : dataSrcFlashDealUrl ? dataSrcFlashDealUrl : null,
                isFlashDeal:getCheckedBtn(isFlashDeal),
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

                if (file.size > 5000000) {
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
        
        try {
            const tour = await Tour.update({
                title,
                description,
                sequence,
                day,
                persons,
                price,
                startedAt,
                finishedAt,
                overview,
                dayList,
                amenities,
                coverUrl: fileArr.coverUrlFile ? fileArr.coverUrlFile : dataSrcCoverUrl ? dataSrcCoverUrl : null,
                headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                flashDealUrl: fileArr.flashDealUrlFile ? fileArr.flashDealUrlFile : dataSrcFlashDealUrl ? dataSrcFlashDealUrl : null,
                isFlashDeal:getCheckedBtn(isFlashDeal),
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
            await t.commit()
            await res.send({isSuccess:true, message:'Tur başarıyla güncellendi'})
        } catch (err) {
            console.log(err)
            await t.rollback()
            await res.send({isSuccess:false, message:'Bir hata oluştu'})
        }
    }
}

const selectImageTourAjax = async (req,res)=>{

    const page = req.body.page ? parseInt(req.body.page) : 1
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
        }, {transaction: t})
        
        await t.commit()
        console.log(paginatedResults)
        await res.send({isActive:true, images, paginatedResults})
    } catch (error) {
        await t.rollback()
        await res.send({isActive:false})
    }
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
    selectImageTourAjax
}