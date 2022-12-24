import {Op} from "sequelize"
import Video from '../models/Video.js'
import Category from '../models/Category.js'
import VideoCategory from '../models/VideoCategory.js'
import moment from 'moment'
import db from '../../db.js'
import { getCheckedBtn } from "../../globalFunctions.js"


const allVideos = async (req,res)=>{
    res.locals.title="Videolar"
    const videos = await Video.findAll({
        where:{
            isDeleted:false
        }
    })
    console.log(JSON.stringify(videos))
    await res.render('video/videos', {videos})
}

const addVideo = async (req,res)=>{
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

    await res.render('video/addVideo', {categories})
}

const updateVideo = async (req,res)=>{

    res.locals.title = ""
    const id = req.params.id

    let categoryIds = await VideoCategory.findAll({
        where:{
            videoId:id            
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

    const video = await Video.findByPk(id, {
        where:{
            isDeleted:false
        }
    }).then(video=>{
        res.locals.title = video.title
        res.render('video/updateVideo', {isSuccess:true, video, categories, categoryIds})
    }).catch(err=>{
        res.render('video/updateVideo', {isSuccess:false, video:{}, categories:[], categoryIds:[]})
    })
}

const addVideoAjax = async (req,res)=>{
    
    const {category, title, sequence, duration, isActive} = req.body
    
    if (title == "" || title == null || title == undefined) {
        return res.send({isSuccess:false, message: "Lütfen isim giriniz"})
    }

    const sameVideo = await Video.findOne({
        where:{
            title
        }
    })

    if (sameVideo) {
        return res.send({isSuccess:false, message: "Bu isimde video var. Lütfen farklı bir isim giriniz"})
    }
    
    const t = await db.transaction()

    try{

        const video = await Video.create({
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

const updateVideoAjax = async (req,res)=>{

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

const updateVideoFileAjax = async (req,res)=>{

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

const deleteVideoAjax = async (req,res)=>{
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

const videosToCategory = async (req,res)=>{

    res.locals.title="Yeni Ekle"

    let categories = await Category.findAll({
        where:{
            isDeleted:false,
            isActive:true
        }
    })

    await res.render('video/videosToCategory', {categories, category:"a", videos:[], unselectedVideos:[]})
}

const videosToCategoryAjax = async (req,res)=>{
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
    allVideos,
    addVideo,
    updateVideo,
    addVideoAjax,
    updateVideoAjax,
    updateVideoFileAjax,
    deleteVideoAjax,
    videosToCategory,
    videosToCategoryAjax
}