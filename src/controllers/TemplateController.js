import {Op} from "sequelize"
import Navigation from '../models/template/Navigation.js'
import Page from '../models/template/Page.js'
import moment from 'moment'
import db from '../../db.js'
import { getCheckedBtn, deserializeList } from "../../globalFunctions.js"
import mime from 'mime-types'

let adminNavigations = [
    '/',
    '/login',
    '/logout',
    //categories
    '/kategoriler',
    '/kategori-ekle',
    '/kategori-guncelle',
    '/updateCategoryAjax',
    '/deleteCategoryAjax',
    '/kategori-siralama',
    '/seqenceCategoryUpdateAjax',
    //tempalte
    '/navigasyonlar',
    '/sequenceNavigationUpdateAjax',
    '/createOrUpdateNavAjax',
    '/deleteNavigationAjax',
    '/sayfalar',
    '/sayfa-kaydet',
    '/createOrUpdatePageAjax',
    //tours
    '/turlar',
    '/tur-kaydet',
    '/createOrUpdateTourAjax',
    //users
    '/kullanicilar',
    '/kullanici-ekle',
    '/kullanici-guncelle',
    '/addUserAjax',
    '/updateUserAjax',
    '/deleteUserAjax'
]

const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

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
    
    const {id, description, isActive } = req.body
    let title = req.body.title
    let link = req.body.link
    
    if (title == "" || title == null || title == undefined || title.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    if (link == "" || link == null || link == undefined || link.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen link giriniz"})
    }
    title = title.trim()
    link = link.trim()

    let isAdminUrl = adminNavigations.find(el => el == link)
    if (isAdminUrl) {
        return res.send({isSuccess:false, message: "Bu link admin tarafından kullanılıyor. Lütfen farklı bir link giriniz"})
    }

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
        page.isActive = true
        await res.render('page/createOrUpdatePage', {page})
    }else{
        const page = await Page.findByPk(id, {
            where:{
                isDeleted:false
            }
        })
        res.locals.title = page.title + ' Güncelleme'
    
        await res.render('page/createOrUpdatePage', {page})
    }
}

const createOrUpdatePageAjax = async (req,res, next)=>{
    
    const {id, seoKeywords, seoDescription, pageHeader, pageContent, dataSrcCoverUrl, isActive} = req.body
    let title = req.body.title
    let url = req.body.url
    
    if (title == "" || title == null || title == undefined || title.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    if (url == "" || url == null || url == undefined || url.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen url giriniz"})
    }
    title = title.trim()
    url = url.trim()

    let isAdminUrl = adminNavigations.find(el => el == url)
    if (isAdminUrl) {
        return res.send({isSuccess:false, message: "Bu url admin tarafından kullanılıyor. Lütfen farklı bir url giriniz"})
    }
    
    //create
    if(id == null || id == undefined || id == ""){

        const samePage = await Page.findOne({
            where:{
                url,
                isDeleted:false
            }
        })
        if (samePage) {
            return res.send({isSuccess:false, message: "Bu sayfada url var. Lütfen farklı bir url giriniz"})
        }
        let fileUrl = null;

        if(req.files != null && req.files.coverUrlFile){
            let fileType = mime.extension(req.files.coverUrlFile.mimetype)
            let fileName = Date.now() + '.' + fileType
            fileUrl = '/webUI/image/' + fileName;

            if (req.files.coverUrlFile.size > 3000001) {
                return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
            }else if(!whitelist.includes(req.files.coverUrlFile.mimetype)){
                return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
            }else{
                req.files.coverUrlFile.mv('public/webUI/image/' + fileName, async function(err) {
                    if (err){
                        return res.status(500).send({isSuccess:false, message: err})
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
                            coverUrl: fileUrl,
                            isActive:getCheckedBtn(isActive),
                            isDeleted:false,
                            createdAt:moment(),
                            updatedAt: moment()
                        }, { transaction: t })
                        
                        await t.commit()
                        await res.send({isSuccess:true, message:'Sayfa başarıyla eklendi'})
                    } catch(err){
                        console.log(err)
                        await t.rollback()
                        await res.send({isSuccess:false, message:'Bir hata oluştu'})
                    }
                })
            }
        }else{
            if (dataSrcCoverUrl != null && dataSrcCoverUrl != "" && dataSrcCoverUrl != undefined) {
                fileUrl = dataSrcCoverUrl
            }else{
                fileUrl = null
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
                    coverUrl: fileUrl,
                    isActive:getCheckedBtn(isActive),
                    isDeleted:false,
                    createdAt:moment(),
                    updatedAt: moment()
                }, { transaction: t })
                
                await t.commit()
                await res.send({isSuccess:true, message:'Sayfa başarıyla eklendi'})
            } catch(err){
                console.log(err)
                await t.rollback()
                await res.send({isSuccess:false, message:'Bir hata oluştu'})
            }
        }
        
    }else{ //update
        const samePage = await Page.findOne({
            where:{
                url,
                id:{
                    [Op.ne]: id,
                },
                isDeleted:false
            }
        })

        if (samePage && id != samePage.id) {
            return res.status(400).send({isSuccess:false, message: "Bu url ile sayfa var. Lütfen farklı bir url giriniz"})
        }
        let fileUrl = null;

        if(req.files != null && req.files.coverUrlFile){
            let fileType = mime.extension(req.files.coverUrlFile.mimetype)
            let fileName = Date.now() + '.' + fileType
            fileUrl = '/webUI/image/' + fileName;

            if (req.files.coverUrlFile.size > 3000001) {
                return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
            }else if(!whitelist.includes(req.files.coverUrlFile.mimetype)){
                return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
            }else{
                req.files.coverUrlFile.mv('public/webUI/image/' + fileName, function(err) {
                    if (err){
                        return res.send({isSuccess:false, message:err})
                    }
                    const page = Page.update({
                        title,
                        url,
                        seoKeywords,
                        seoDescription,
                        pageHeader,
                        pageContent,
                        coverUrl: fileUrl,
                        isActive:getCheckedBtn(isActive),
                        updatedAt: moment()
                    }, {
                        where:{
                            id
                        }
                    }).then(page=>{
                        res.send({isSuccess:true, message:'Sayfa başarıyla güncellendi'})
                    }).catch(err=>{
                        res.send({isSuccess:false, message:err})
                    })
                })
            }
        }else{
            if (dataSrcCoverUrl != null && dataSrcCoverUrl != "" && dataSrcCoverUrl != undefined) {
                fileUrl = dataSrcCoverUrl
            }else{
                fileUrl = null
            }

            const page = await Page.update({
                title,
                url,
                seoKeywords,
                seoDescription,
                pageHeader,
                pageContent,
                coverUrl: fileUrl,
                isActive:getCheckedBtn(isActive),
                updatedAt: moment()
            }, {
                where:{
                    id
                }
            }).then(page=>{
                res.send({isSuccess:true, message:'Sayfa başarıyla güncellendi'})
            }).catch(err=>{
                res.send({isSuccess:false, message:err})
            })
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