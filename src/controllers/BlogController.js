import Blog from '../models/Blog.js'
import db from '../../db.js'
import { getCheckedBtn } from "../../globalFunctions.js"
import mime from 'mime-types'

const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

const blogs = async (req,res)=>{
    res.locals.title="Bloglar"
    const blogs = await Blog.findAll()
    await res.render('blog/blogs', {blogs})
}

const createOrUpdateBlog = async (req,res)=>{

    const id = req.params.id

    if(id == undefined || id == null || id == ""){
        res.locals.title="Yeni Ekle"
        const blog = Blog.build()
        blog.isActive = true
        await res.render('blog/createOrUpdateBlog', {isSuccess:false, blog})
    }else{
        await Blog.findByPk(id).then(blog=>{
            res.locals.title = blog.title + ' Güncelleme'

            res.render('blog/createOrUpdateBlog', {isSuccess:true, blog})
        }).catch(err=>{
            console.log(err)
        })
    }
}

const createOrUpdateBlogAjax = async (req,res)=>{
    
    const {id, dataSrcHeadImgUrl, releaseDate, description, tags, isActive } = req.body
    let title = req.body.title
    let url = req.body.url

    if (title == "" || title == null || title == undefined || title.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen başlık giriniz"})
    }
    if (url == "" || url == null || url == undefined || url.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen url giriniz"})
    }
    if (releaseDate == "" || releaseDate == null || releaseDate == undefined) {
        return res.status(400).send({isSuccess:false, message: "Lütfen yayınlanma tarihi giriniz"})
    }

    title = title.trim()
    url = id + '-' + url.trim()

    /* create */
    if(id == null || id == undefined || id == ""){
        
        let fileArr = {}

        if(req.files != null){
            for (let key in req.files) {
                const file = req.files[key];

                if (file.size > 5000000) {
                    return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
                }else if(!whitelist.includes(file.mimetype)){
                    return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
                }
            }
            for (let key in req.files) {
                const file = req.files[key];
                let fileType = mime.extension(file.mimetype)
                let fileName = Date.now() + '.' + fileType
                let fileUrl = '/webUI/image/' + fileName;
                
                await file.mv('public/webUI/image/' + fileName)
                fileArr =  {...fileArr, [key]:fileUrl}
            }
        }
        const t = await db.transaction()

        try{
            await Blog.create({
                title,
                url,
                headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                releaseDate,
                description,
                tags,
                isActive:getCheckedBtn(isActive)
            }, { transaction: t })
            
            await t.commit()
            await res.send({isSuccess:true, message:'Blog başarıyla eklendi'})
        } catch(err){
            console.log(err)
            await t.rollback()
            await res.send({isSuccess:false, message:'Bir hata oluştu'})
        }

        /* update */
    }else{

        let fileArr = {}

        if(req.files != null){
            for (let key in req.files) {
                const file = req.files[key];

                if (file.size > 5000000) {
                    return res.status(400).send({isSuccess:false, message: "Dosya boyutu en fazla 5 MB olmalıdır!"})
                }else if(!whitelist.includes(file.mimetype)){
                    return res.status(400).send({isSuccess:false, message: "Dosya image türünde olmalıdır!"})
                }
            }
            for (let key in req.files) {
                const file = req.files[key];
                let fileType = mime.extension(file.mimetype)
                let fileName = Date.now() + '.' + fileType
                let fileUrl = '/webUI/image/' + fileName;
                
                await file.mv('public/webUI/image/' + fileName)
                fileArr =  {...fileArr, [key]:fileUrl}
            }
        }
        const t = await db.transaction()
        
        try {
            await Blog.update({
                title,
                url,
                headImgUrl: fileArr.headImgUrlFile ? fileArr.headImgUrlFile : dataSrcHeadImgUrl ? dataSrcHeadImgUrl : null,
                releaseDate,
                description,
                tags,
                isActive:getCheckedBtn(isActive)
            }, {
                where:{
                    id
                }
            }, { transaction: t })

            await t.commit()
            await res.send({isSuccess:true, message:'Blog başarıyla güncellendi'})
        } catch (err) {
            console.log(err)
            await t.rollback()
            await res.send({isSuccess:false, message:'Bir hata oluştu'})
        }
    }
}

const deleteBlogAjax = async (req,res)=>{
    const id = req.body.id
    
    if(id == "" && id == null && id == undefined){
        return res.status(400).send({isSuccess:false, message: "Sayfayı yenileyim tekrar deneyiniz"})
    }
    const t = await db.transaction()
    try {
        await Blog.destroy({
            where:{
                id:id
            }
        }, {transaction: t})

        await t.commit()
        await res.send({isSuccess:true, message:'Blog silindi'})
    } catch (error) {
        console.log(error)
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
}

export default {
    blogs,
    createOrUpdateBlog,
    createOrUpdateBlogAjax,
    deleteBlogAjax
}