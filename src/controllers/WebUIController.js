import { Op } from "sequelize"
import Page from '../models/template/Page.js'
import moment from 'moment'
import { getCheckedBtn } from "../../globalFunctions.js"
import LanguageItem from '../models/template/LanguageItem.js'



let lang = {
    lng:'tr',
    languageTitle:'Türkçe'
}
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

const homePage = async (req,res)=>{
    res.locals.title="Ana Sayfa"

    await res.render('webUI/home', {layout:'webUI/layout', lang})
}

const aboutPage = async (req,res)=>{
    res.locals.title="Hakkımızda"

    await res.render('webUI/about-us', {layout:'webUI/layout', lang})
}

const contactPage = async (req,res)=>{
    res.locals.title="İletişim"

    await res.render('webUI/contact', {layout:'webUI/layout', lang})
}


export default {
    setLang,
    homePage,
    aboutPage,
    contactPage
}