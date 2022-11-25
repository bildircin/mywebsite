import { Op } from "sequelize"
import Page from '../models/template/Page.js'
import moment from 'moment'
import { getCheckedBtn, serializeList } from "../../globalFunctions.js"
import LanguageItem from '../models/template/LanguageItem.js'
import PageContent from '../models/template/PageContent.js'
import Navigation from "../models/template/Navigation.js"


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
//middleware
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
        contents.headerBonusLeft = layoutHeaderBonusLeft.value
    }

    const list = await Navigation.findAll({
        where:{
            isActive:true,
            isDeleted:false
        }
    }).catch(err=>{
        console.log(err)
    })

    navigations = serializeList(list)
    next()
}

const homePage = async (req,res)=>{
    res.locals.title="Ana Sayfa"

    const pageContents = await PageContent.findAll({
        where:{
            key:['layoutSlider'],
            languageCode:lang.lng
        }

    }).catch(err=>{
        console.log(err)
    })
    if(pageContents.length > 0 ){
        contents.layoutSlider = pageContents.find(el=>el.key == 'layoutSlider').value
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


export default {
    setLang,
    homePage,
    aboutPage,
    contactPage,
    setContents
}