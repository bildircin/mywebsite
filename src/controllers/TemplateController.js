import {Op} from "sequelize"
import sequelize from "sequelize"
import Navigation from '../models/template/Navigation.js'
import Page from '../models/template/Page.js'
import moment from 'moment'
import db from '../../db.js'
import { getCheckedBtn, deserializeList } from "../../globalFunctions.js"


// navigation
const navigations = async (req,res)=>{
    res.locals.title="Navigasyonlar"

    const navigations = await Navigation.findAll({
        where:{
            isDeleted:false
        }
    })

    let geciciDizi = []

    navigations.forEach(item => {  // parentid ye sahip olanları gecici dizide parentid olusturup içine ekedik
        if (item.parentId == 0)
        return
        
        if (geciciDizi[ item.parentId ] === undefined)
        geciciDizi[ item.parentId ] = []
        
        geciciDizi[ item.parentId ].push(item)
    })
    
    navigations.forEach(item => {
        if (item.id == 0)
            return

        if (geciciDizi[ item.id ] === undefined)  // gecici dizide yoksa bu en tepede bir parenttır yani parent id si 0 dır
            return

        item["children"] = geciciDizi[ item.id ] // degerini gecici diziden alıp içine ekleyeim
    })

    let ret = []

    navigations.forEach(item => { // son olarak en tepe parent ları ret e ekleyelim
        if (item.parentId !== 0)
            return

        ret.push(item)
    })


    //sıralamak için
    navigations.forEach(item =>{
        isChildren(item)
    })
    sirala(ret)

    await res.render('template/navigations', {navigations:ret, tempNavigations:navigations})
}

const sequenceNavigationUpdateAjax = async (req,res)=>{
    let nestList = JSON.parse(req.body.EditableJSONList)
    let id = 0
    let navigationList = deserializeList(nestList, id)
    
    const t = await db.transaction()
    
    try{
        for (let i = 0; i < navigationList.length; i++) {
            const item = navigationList[i];
            item.sequence = i + 1

            await Navigation.update({ 
                parentId: item.parentId,
                sequence: item.sequence
            }, {
                where: {
                  id: item.id
                }
            }, { transaction: t })
        }
        
        await t.commit()
        await res.send({isSuccess:true, message:'Navigasyon sıralaması başarıyla güncellendi'})
    } catch(err){
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
    
}

const createOrUpdateNavAjax = async (req,res)=>{
    
    const {id ,title, link, description, isActive } = req.body

    const t = await db.transaction()
    try {
        
        // create
        if(id == "" || id == null || id == undefined){
            const navigation = await Navigation.create({
                title,
                link,
                description,
                isActive:getCheckedBtn(isActive)
            })

            await t.commit()
            await res.send({isSuccess:true, message:'Navigasyon başarıyla eklendi', navigation})
        // update
        }else{
            const navigation = await Navigation.update({
                title,
                link,
                description,
                isActive:getCheckedBtn(isActive)
            },{
                where:{
                    id
                }
            })
            await t.commit()
            await res.send({isSuccess:true, message:'Navigasyon başarıyla güncellendi', navigation})
        }
    } catch (error) {
        console.log(error)
        await t.rollback()
        await res.send({isSuccess:false, message:error})
    }
    
}

const deleteNavigationAjax = async (req,res) => {
    const id = req.body.id

    if(id == "" || id == null || id == undefined){
        await res.send({isSuccess:false, message:'Bir hata oluştu \n Sayfayı yenileyip tekrar deneyiniz'})
    }

    let navigations = await Navigation.findAll({
        where:{
            isDeleted:false
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id})
    })

    let childNavigations = navigations.filter(el=>el.parentId == id)

    let subnavigationsIds = getIdsSubcategories(childNavigations, navigations)
    let childNavigationsIds = childNavigations.map(el=>el.id)
    let removedIds = [...childNavigationsIds, ...subnavigationsIds, parseInt(id)]

    const navigation = await Navigation.update({
        isDeleted:true,
        updatedAt: moment()
    }, {
        where:{
            id:removedIds
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id, removedIds})
    })
    await res.send({isSuccess:true, message: "Navigasyon başarıyla silindi", id, removedIds})
}

//page
const pages = async (req,res)=>{
    res.locals.title="Sayfalar"

    const pages = await Page.findAll({
        where:{
            isDeleted:false
        }
    })

    await res.render('page/pages', {pages})
}

const createOrUpdatePage = async (req,res)=>{
    
    const id = req.params.id
    
    if(id == undefined || id == null || id == ""){
        res.locals.title="Yeni Sayfa Ekle"
        const page = Page.build()
        await res.render('page/createOrUpdatePage', {page})
    }else{
        const page = await Page.findByPk(id, {
            where:{
                isDeleted:false
            }
        })
        res.locals.title = page.title
    
        await res.render('page/createOrUpdatePage', {page})
    }
}

const createOrUpdatePageAjax = async (req,res)=>{

    const {id, title, url, seoKeywords, seoDescription, pageHeader, pageContent, dataSrcCoverUrl, isActive} = req.body

    if (title == "" || title == null || title == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    
    /* create */
    if(id == null || id == undefined || id == ""){
        
        const sameUrl = await Page.findOne({
            where:{
                url,
                isDeleted:false
            }
        })
        if (sameUrl) {
            return res.send({isSuccess:false, message: "Bu sayfada url var. Lütfen farklı bir url giriniz"})
        }
        const t = await db.transaction()
        try{
            const page = await Page.create({
                title,
                url,
                seoKeywords,
                seoDescription,
                pageHeader,
                pageContent,
                coverUrl: Object.keys(req.files).length > 0 && req.files.coverUrlFile && req.files.coverUrlFile[0] ? '/webUI/image/' + req.files.coverUrlFile[0].filename : null,
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
        const title = req.body.title.trim()
        
        const sameTour = await Tour.findOne({
            where:{
                title,
                id:{
                    [Op.ne]: id,
                }
            }
        })

        if (sameTour && id != sameTour.id) {
            return res.status(400).send({isSuccess:false, message: "Bu başlıkta tur var. Lütfen farklı bir başlık giriniz"})
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
                    coverUrl: Object.keys(req.files).length > 0 && req.files.coverUrlFile && req.files.coverUrlFile[0] ? '/webUI/image/' + req.files.coverUrlFile[0].filename : (dataSrcCoverUrl ? dataSrcCoverUrl : null),
                    headImgUrl: Object.keys(req.files).length > 0 && req.files.headImgUrlFile &&  req.files.headImgUrlFile[0] ? '/webUI/image/' + req.files.headImgUrlFile[0].filename : (dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null),
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

function getIdsSubcategories(arr, list){
    let result = []
    
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        
        let childList = list.filter(el=>el.parentId == item.id)

        if(childList.length > 0){
            let itemChildIds = childList.map(el=>el.id)
            result.push(...itemChildIds)
            result = result.concat(getIdsSubcategories(childList, list))
        }
    }
    return result
}


export default {
    navigations,
    sequenceNavigationUpdateAjax,
    createOrUpdateNavAjax,
    deleteNavigationAjax,
    pages,
    createOrUpdatePage,
    createOrUpdatePageAjax
}