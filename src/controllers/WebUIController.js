import { Op } from "sequelize"
import Page from '../models/template/Page.js'
import moment from 'moment'
import { getCheckedBtn } from "../../globalFunctions.js"

const aboutPage = async (req,res)=>{
    res.locals.title="Hakkımızda"

    const lang = {
        lng:req.cookies.lng,
        languageTitle:req.cookies.languageTitle
    }

    await res.render('webUI/about-us', {layout:'webUI/layout', lang})
}

const contactPage = async (req,res)=>{
    res.locals.title="İletişim"

    const lang = {
        lng:req.cookies.lng,
        languageTitle:req.cookies.languageTitle,
        messageHeader:req.t('messageHeader'),
        messageBody:req.t('messageBody')
    }

    await res.render('webUI/contact', {layout:'webUI/layout', lang})
}


export default {
    aboutPage,
    contactPage
}