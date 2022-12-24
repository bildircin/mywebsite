import db from '../../db.js'
import LanguageCode from "../models/LanguageCode.js"
import PageContent from "../models/PageContent.js"

//PageContent
const createOrUpdatePageContent = async (req,res)=>{
    
    const keys = await PageContent.findAll({
        attributes:[[db.literal('DISTINCT `key`'), 'key']]
    })
    const languageCodes = await LanguageCode.findAll()
    res.locals.title = 'İçerik Güncelleme'

    await res.render('pageContent/createOrUpdatePageContent', {keys, languageCodes})
}

const createOrUpdatePageContentGetValueAjax = async (req,res, next)=>{
    
    const key = req.body.key
    const languageCode = req.body.languageCode

    const pageContent = await PageContent.findOne({
        where:{
            key,
            languageCode
        }
    })
    if (pageContent) {
        await res.send({isSuccess:true, message:'İçerik yüklendi', pageContent})
    }else{
        await res.send({isSuccess:true, message:'Bu içeriği ilk defa oluşturacaksınız', pageContent})
    }

} 

const createOrUpdatePageContentSetValueAjax = async (req,res, next)=>{
    
    const {key, languageCode, value} = req.body

    const t = await db.transaction()
    try {

        const pageContent = await PageContent.findOne({
            where:{
                key,
                languageCode
            }
        })

        let message = 'İçerik güncellendi' 
        if(pageContent){
            await PageContent.update({
                value
            },{
                where:{
                    key,
                    languageCode
                }
            }, { transaction: t})
        }else{
            await PageContent.create({
                key,
                languageCode,
                value
            }, { transaction: t})
            message = 'İçerik oluşturuldu'
        }
        
        await t.commit()
        await res.send({isSuccess:true, message})
    } catch (error) {
        await t.rollback()
        await res.send({isSuccess:false, message:error})
    }
}



export default {
    createOrUpdatePageContent,
    createOrUpdatePageContentGetValueAjax,
    createOrUpdatePageContentSetValueAjax
}