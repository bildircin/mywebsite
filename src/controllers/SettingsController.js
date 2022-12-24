import { Op, Sequelize } from "sequelize"
import Setting from '../models/Setting.js'
import Email from '../models/Email.js'
import LanguageCode from '../models/LanguageCode.js'
import db from '../../db.js'
import webUIController from '../controllers/WebUIController.js'



const settingPage = async (req,res)=>{
    res.locals.title="Ayarlar"

    const t = await db.transaction()
    try {
        const settings = await Setting.findAll({
            where:{
                key:['uiMetaTitle', 'uiMetaDescription', 'uiMetaKeywords', 'adminCountry', 'uiCurrentLanugage', 'uiProductsItemsPerPage']
            }
        }, {transaction: t})
        const email = await Email.findByPk(1, {transaction: t})

        const languageCodes = await LanguageCode.findAll({}, {transaction: t})  

        await t.commit()
        await res.render('settings/settings', {settings, email, languageCodes})
    } catch (error) {
        console.log(err)
        await t.rollback()
    }

}




const generalUpdateAjax = async (req,res)=>{
    const {uiMetaTitle, uiMetaDescription, uiMetaKeywords} = req.body

    const t = await db.transaction()

    try {
        await Setting.update({
            value:uiMetaTitle
        },{
            where:{
                key:'uiMetaTitle'
            }
        }, {transaction: t})
        await Setting.update({
            value:uiMetaDescription
        },{
            where:{
                key:'uiMetaDescription'
            }
        }, {transaction: t})
        await Setting.update({
            value:uiMetaKeywords
        },{
            where:{
                key:'uiMetaKeywords'
            }
        }, {transaction: t})

        webUIController.cache.removeKey('settings')
        
        await t.commit()
        await res.send({isSuccess:true, message:'Genel ayarlar güncellendi'})
    } catch (error) {
        console.log(err)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const emailUpdateAjax = async (req,res)=>{
    let {host, port, secure, email, password} = req.body

    host = host ? host.trim() : host
    port = port ? port.trim() : port
    email = email ? email.trim() : email
    password = password ? password.trim() : password

    const t = await db.transaction()

    try {
        const updateEmail = await Email.update({
            host,
            port,
            secure,
            email,
            password
        },{
            where:{
                id:1
            }
        }, {transaction: t})
        
        webUIController.cache.removeKey('settings')

        await t.commit()
        await res.send({isSuccess:true, message:'Email ayarları güncellendi'})
    } catch (error) {
        console.log(err)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const localizationUpdateAjax = async (req,res)=>{

    let {localizationCountry, defaultLanguage, localizationLanguages, isNullLocalizationLanguages} = req.body
    localizationLanguages = Array.isArray(localizationLanguages) ? localizationLanguages : [localizationLanguages]

    if(localizationLanguages == undefined && isNullLocalizationLanguages == 'false'){
        await res.send({isSuccess:false, message:'Sayfayı yenileyip tekrar deneyiniz'})
    }

    const t = await db.transaction()
    
    try {
        await Setting.update({
            value:localizationCountry
        },{
            where:{
                key:'adminCountry'
            }
        }, {transaction: t})
        
        await Setting.update({
            value:defaultLanguage ? defaultLanguage : ''
        },{
            where:{
                key:'uiCurrentLanugage'
            }
        }, {transaction: t})

        await LanguageCode.update({
            isActive:true
        },{
            where:{
                lng: isNullLocalizationLanguages == "true" ? {[Op.in]:[]} : localizationLanguages
            }
        },{ transaction: t})
        await LanguageCode.update({
            isActive:false
        },{
            where:{
                lng: isNullLocalizationLanguages == "true" ? {[Op.notIn]: []} : {[Op.notIn]: localizationLanguages}
            }
        },{ transaction: t})

        webUIController.cache.removeKey('settings')
        webUIController.cache.removeKey('languageCode')
        webUIController.cache.removeKey('languageItems')

        await t.commit()
        await res.send({isSuccess:true, message:'Lokalizasyon ayarları güncellendi'})
    } catch (error) {
        console.log(error)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

const productsSettingsUpdateAjax = async (req,res)=>{

    let {productsItemsPerPage} = req.body

    const t = await db.transaction()
    
    try {
        
        await Setting.update({
            value: productsItemsPerPage ? productsItemsPerPage : ''
        },{
            where:{
                key:'uiProductsItemsPerPage'
            }
        }, {transaction: t})

        await t.commit()
        await res.send({isSuccess:true, message:'Ürünler ayarları güncellendi'})
    } catch (error) {
        console.log(error)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

export default {
    settingPage,
    generalUpdateAjax,
    emailUpdateAjax,
    localizationUpdateAjax,
    productsSettingsUpdateAjax
}