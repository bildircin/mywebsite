import { Op, Sequelize } from "sequelize"
import Tour from '../models/template/Tour.js'
import moment from 'moment'
import { getCheckedBtn, serializeList } from "../../globalFunctions.js"
import LanguageItem from '../models/template/LanguageItem.js'
import LanguageCode from '../models/template/LanguageCode.js'
import PageContent from '../models/template/PageContent.js'
import Navigation from "../models/template/Navigation.js"
import Category from "../models/Category.js"
import TourCategory from "../models/template/TourCategory.js"
import db from '../../db.js'
import Setting from "../models/template/Setting.js"


let currentLang = {
    lng:'tr',
    languageTitle:'Türkçe'
}
let contents = {}
let navigations = []
let languageCodes = []
let currentSettings = []

//middleware
const setSettings = async (req,res,next)=>{

    const settings = await Setting.findAll({}).catch(err=>{
        console.log(err)
    })
    currentSettings = settings

    res.locals.title = settings.find(el=>el.key == 'uiMetaTitle').value
    res.locals.uiMetaDescription = settings.find(el=>el.key == 'uiMetaDescription').value
    res.locals.uiMetaKeywords = settings.find(el=>el.key == 'uiMetaKeywords').value

    next()
}
const setCurrentLang = async (req,res,next)=>{
    //default currentLang
    let uiCurrentLanugage = currentSettings.find(el=>el.key == 'uiCurrentLanugage')
    console.log(uiCurrentLanugage)
    if(uiCurrentLanugage.value){
        
        const languageCode = await LanguageCode.findOne({
            where:{
                lng:uiCurrentLanugage.value
            }
        })
        if(languageCode){
            currentLang.languageTitle = languageCode.name
            currentLang.lng = languageCode.lng
        }
    }
    if(req.cookies.lng){
        currentLang.lng = req.cookies.lng
    }
    if(req.cookies.languageTitle){
        currentLang.languageTitle = req.cookies.languageTitle
    }

    const languageItems = await LanguageItem.findAll({
        where:{
            lng:currentLang.lng
        }
    }).catch(err=>{
        console.log(err)
    })

    languageItems.forEach(item => {
        currentLang[item.key] = item.value
    })
   
    next()
}
const setLayoutContents = async (req,res,next)=>{

    const layoutHeaderBonusLeft = await PageContent.findOne({
        where:{
            key:'layoutHeaderBonusLeft',
            languageCode:currentLang.lng
        }
    }).catch(err=>{
        console.log(err)
    })
    if(layoutHeaderBonusLeft){
        contents.layoutHeaderBonusLeft = layoutHeaderBonusLeft.value
    }
    next()
}
const setNavigations = async (req,res,next)=>{

    const list = await Navigation.findAll({
        where:{
            isActive:true,
            isDeleted:false
        }
    }).catch(err=>{
        console.log(err)
    })

    navigations = [...serializeList(list)]
    next()
}

const setLanguageCode = async (req,res,next)=>{
    const list = await LanguageCode.findAll({
        where:{
            isActive:true
        }
    }).catch(err=>{
        console.log(err)
    })

    languageCodes = list
    next()
}




const homePage = async (req,res)=>{
    res.locals.title="Ana Sayfa"

    const categories = await Category.findAll({
        where:{
            isActive:true,
            isDeleted:false
        }
    })

    const pageContents = await PageContent.findAll({
        where:{
            key:['homeSlider'],
            languageCode:currentLang.lng
        }

    }).catch(err=>{
        console.log(err)
    })
    if(pageContents.length > 0 ){
        contents.homeSlider = pageContents.find(el=>el.key == 'homeSlider').value
    }

    await res.render('webUI/home', {layout:'webUI/layout', currentLang, contents, navigations, categories, languageCodes})
}

const aboutPage = async (req,res)=>{
    res.locals.title="Hakkımızda"

    await res.render('webUI/about-us', {layout:'webUI/layout', currentLang, contents, navigations, languageCodes})
}

const contactPage = async (req,res)=>{
    res.locals.title="İletişim"

    await res.render('webUI/contact', {layout:'webUI/layout', currentLang, contents, navigations, languageCodes})
}

const toursPage = async (req,res)=>{
    res.locals.title="Turlar"

    let uiProductsItemsPerPage = currentSettings.find(el=>el.key == 'uiProductsItemsPerPage').value

    //query
    const q = req.query;
    let tours = []
    const page = req.query.page ? parseInt(req.query.page) : 1
    const limit = uiProductsItemsPerPage ? parseInt(uiProductsItemsPerPage) : 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let paginatedResults = {}

    if(q.hasOwnProperty('searchTour')){

        const tourCategories = await TourCategory.findAll({
            where:{
                categoryId:q.category == 'null' ? {[Op.ne]:null} : q.category
            }
        }).catch(err=>{
            console.log(err)
        })
        let tourIds = tourCategories.map(el => el.tourId)
        q.startedAt = q.startedAt != '' ? moment(q.startedAt, "MM/DD/YYYY").format('YYYY-MM-DD') : ''
        q.finishedAt = q.finishedAt != '' ? moment(q.finishedAt, "MM/DD/YYYY").format('YYYY-MM-DD') : ''

        let orderSort = ['id']
        if(q.sort && q.sort != 'null' && q.sort == 'az')
            orderSort = ['title', 'ASC']
        if(q.sort && q.sort != 'null' && q.sort == 'za')
            orderSort = ['title', 'DESC']
        if(q.sort && q.sort != 'null' && q.sort == 'high')
            orderSort = ['price', 'ASC']
        if(q.sort && q.sort != 'null' && q.sort == 'low')
            orderSort = ['price', 'DESC'] 
        if(q.sort && q.sort != 'null' && q.sort == 'near')
            orderSort = ['startedAt', 'ASC']
        if(q.sort && q.sort != 'null' && q.sort == 'far')
            orderSort = ['startedAt', 'DESC']
            
        let option = {
            where:{
                isActive:true,
                isDeleted:false,
                id:tourIds,
                startedAt:  q.startedAt != '' ? { [Op.gte]: moment(q.startedAt)} : {[Op.ne]: null},
                finishedAt: q.finishedAt != '' ? { [Op.lte]: moment(q.finishedAt) } : {[Op.ne]: null},
                persons: q.persons != '0' ? q.persons : {[Op.ne]: null},
                price: q.price != '' ? { [Op.lte]: q.price } : {[Op.ne]: null}
            },
            order:[
                orderSort
            ]
        }
        paginatedResults = await getPaginatedResults(Tour, option, limit, page, startIndex, endIndex)
        tours = await Tour.findAll({
            where:{
                isActive:true,
                isDeleted:false,
                id:tourIds,
                startedAt:  q.startedAt != '' ? { [Op.gte]: moment(q.startedAt)} : {[Op.ne]: null},
                finishedAt: q.finishedAt != '' ? { [Op.lte]: moment(q.finishedAt) } : {[Op.ne]: null},
                persons: q.persons != '0' ? q.persons : {[Op.ne]: null},
                price: q.price != '' ? { [Op.lte]: q.price } : {[Op.ne]: null}
            },
            order:[
                orderSort
            ],
            offset:startIndex,
            limit:limit
        })
    }else{
        let option = {
            where:{
                isActive:true,
                isDeleted:false
            }
        }
        paginatedResults = await getPaginatedResults(Tour, option, limit, page, startIndex, endIndex)

        tours = await Tour.findAll({
            where:{
                isActive:true,
                isDeleted:false
            },
            offset:startIndex,
            limit:limit
        })
    }

    const categories = await Category.findAll({
        where:{
            isActive:true,
            isDeleted:false
        }
    })

    const pageContents = await PageContent.findAll({
        where:{
            key:['toursBreadcrumb'],
            languageCode:currentLang.lng
        }
    }).catch(err=>{
        console.log(err)
    })

    await pageContents.forEach(item => {
        contents[item.key] = item.value
    });
    
    await res.render('webUI/tours', {layout:'webUI/layout', currentLang, contents, q, navigations, categories, tours, paginatedResults, languageCodes})
}

const tourSinglePage = async (req,res)=>{
    const id = req.params.id
    
    res.locals.title = ""
    const t = await db.transaction()
    try {
        const tour = await Tour.findByPk(id, {transaction: t})

        if(tour){
            res.locals.title = tour.title
        }
        await t.commit()
        await res.render('webUI/tour-single', {layout:'webUI/layout', currentLang, contents, navigations, languageCodes, tour})
    } catch (error) {
        console.log(error)
        await t.rollback()
    }
}



const page404 = async (req,res,next)=>{

    await res.render('webUI/404', {layout:'webUI/layout', currentLang, contents, navigations, languageCodes})
}








async function getPaginatedResults(model, option, limit, page, startIndex, endIndex){
    const modelCount = await model.count(option)
    
    let paginatedResults = {
        pageCount:Math.ceil(modelCount / limit),
        page
    }

    if (endIndex < modelCount) {
        paginatedResults.next = {
            page: page + 1
        }
    }

    if (startIndex > 0) {
        paginatedResults.previous = {
            page: page - 1
        }
    }
    return paginatedResults
}


export default {
    setCurrentLang,
    setLayoutContents,
    setNavigations,
    setLanguageCode,
    homePage,
    aboutPage,
    contactPage,
    toursPage,
    setSettings,
    tourSinglePage,
    page404
}