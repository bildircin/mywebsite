import { Op } from "sequelize"
import Tour from '../models/template/Tour.js'
import moment from 'moment'
import { getCheckedBtn, serializeList } from "../../globalFunctions.js"
import LanguageItem from '../models/template/LanguageItem.js'
import PageContent from '../models/template/PageContent.js'
import Navigation from "../models/template/Navigation.js"
import Category from "../models/Category.js"
import TourCategory from "../models/template/TourCategory.js"


let lang = {
    lng:'tr',
    languageTitle:'Türkçe'
}
let contents = {}
let adminNavigations = [
    {
        id:Date.now(),
        parentId:0,
        title:'Turlar',
        link:'/tur-listesi',
        sequence:0,
        description:'',
        isActive:true,
        isDeleted:false,
        createdAt:'2022-01-01',
        updatedAt:'2022-01-01'
    }
]
let navigations = []

//middleware
const setLang = async (req,res,next)=>{
    if(req.cookies.lng){
        lang.lng = req.cookies.lng

        const languages = await LanguageItem.findAll({
            where:{
                lng:lang.lng
            }
        }).catch(err=>{
            console.log(err)
        })

        languages.forEach(item => {
            lang[item.key] = item.value
        });
    }
    if(req.cookies.languageTitle){
        lang.languageTitle = req.cookies.languageTitle
    }

    next()
}
//middleware -> only layout contents and navigations
const setContents = async (req,res,next)=>{

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

    const list = await Navigation.findAll({
        where:{
            isActive:true,
            isDeleted:false
        }
    }).catch(err=>{
        console.log(err)
    })

    navigations = [...adminNavigations, ...serializeList(list)]
    next()
}

const homePage = async (req,res)=>{
    res.locals.title="Ana Sayfa"

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

    await res.render('webUI/home', {layout:'webUI/layout', lang, contents, navigations})
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
        console.log(q)
        tours = await Tour.findAll({
            where:{
                isActive:true,
                isDeleted:false,
                id:tourIds,
                startedAt: '2022-11-03', //q.startedAt != '' ? { [Op.gte]: q.startedAt} : {[Op.ne]: null},
                finishedAt: '2022-11-30' //q.finishedAt != '' ? { [Op.lte]: q.finishedAt} : {[Op.ne]: null}
            }
        })
    }else{
        tours = await Tour.findAll({
            where:{
                isActive:true,
                isDeleted:false
            }
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

    await res.render('webUI/tours', {layout:'webUI/layout', lang, contents, navigations, categories, tours})
}


export default {
    setLang,
    homePage,
    aboutPage,
    contactPage,
    setContents,
    toursPage
}