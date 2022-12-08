import { Op, Sequelize } from "sequelize"
import Setting from '../models/template/Setting.js'
import moment from 'moment'
import db from '../../db.js'



const settingPage = async (req,res)=>{
    res.locals.title="Ayarlar"

    const t = await db.transaction()
    try {
        const settings = await Setting.findAll({
            where:{
                key:['uiMetaTitle', 'uiMetaDescription', 'uiMetaKeywords']
            }
        })

        console.log(JSON.stringify(settings))

        await t.commit()
        await res.render('settings/settings', {settings})
    } catch (error) {
        console.log(err)
        await t.rollback()
        await res.render('settings/settings', {settings:[]})
    }

}


export default {
    settingPage
}