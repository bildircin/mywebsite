import { Op, Sequelize } from "sequelize"
import Tour from '../models/template/Tour.js'
import moment from 'moment'
import { getCheckedBtn, serializeList } from "../../globalFunctions.js"
import LanguageItem from '../models/template/LanguageItem.js'
import PageContent from '../models/template/PageContent.js'
import Navigation from "../models/template/Navigation.js"
import Category from "../models/Category.js"
import TourCategory from "../models/template/TourCategory.js"
import db from '../../db.js'
import Setting from "../models/template/Setting.js"


let lang = {
    lng:'tr',
    languageTitle:'Türkçe'
}
let contents = {}
let navigations = []

//middleware
const setLang = async (req,res,next)=>{
    
    if(req.cookies.lng){
        lang.lng = req.cookies.lng
    }

    const languageItems = await LanguageItem.findAll({
        where:{
            lng:lang.lng
        }
    }).catch(err=>{
        console.log(err)
    })

    languageItems.forEach(item => {
        lang[item.key] = item.value
    })

    if(req.cookies.languageTitle){
        lang.languageTitle = req.cookies.languageTitle
    }

    next()
}
const setLayoutContents = async (req,res,next)=>{

    const layoutHeaderBonusLeft = await PageContent.findOne({
        where:{
            key:'layoutHeaderBonusLeft',
            languageCode:lang.lng
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
const setMetas = async (req,res,next)=>{

    const settings = await Setting.findAll({}).catch(err=>{
        console.log(err)
    })

    res.locals.title = settings.find(el=>el.key == 'uiMetaTitle').value
    res.locals.uiMetaDescription = settings.find(el=>el.key == 'uiMetaDescription').value
    res.locals.uiMetaKeywords = settings.find(el=>el.key == 'uiMetaKeywords').value

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
            languageCode:lang.lng
        }

    }).catch(err=>{
        console.log(err)
    })
    if(pageContents.length > 0 ){
        contents.homeSlider = pageContents.find(el=>el.key == 'homeSlider').value
    }

    await res.render('webUI/home', {layout:'webUI/layout', lang, contents, navigations, categories})
}

const aboutPage = async (req,res)=>{
    res.locals.title="Hakkımızda"

    await res.render('webUI/about-us', {layout:'webUI/layout', lang, contents, navigations})
}

const contactPage = async (req,res)=>{
    res.locals.title="İletişim"

    await res.render('webUI/contact', {layout:'webUI/layout', lang, contents, navigations})
}

const toursPage = async (req,res)=>{
    res.locals.title="Turlar"

    //query
    const q = req.query;
    let tours = []
    const page = req.query.page ? parseInt(req.query.page) : 1
    const limit = 4
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
            languageCode:lang.lng
        }
    }).catch(err=>{
        console.log(err)
    })

    await pageContents.forEach(item => {
        contents[item.key] = item.value
    });
    
    await res.render('webUI/tours', {layout:'webUI/layout', lang, contents, q, navigations, categories, tours, paginatedResults})
}


async function getPaginatedResults(model, option, limit, page, startIndex, endIndex){
    const modelCount = await model.count(option)
    console.log(modelCount)
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
    setLang,
    setLayoutContents,
    setNavigations,
    homePage,
    aboutPage,
    contactPage,
    toursPage,
    setMetas
}