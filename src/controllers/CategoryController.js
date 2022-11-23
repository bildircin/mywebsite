import { Op }  from "sequelize"
import Category  from '../models/Category.js'
import moment  from 'moment'
import db  from '../../db.js'
import { getCheckedBtn }  from "../../globalFunctions.js"
import i18next from "i18next"



const allCategories = async (req,res)=>{

    res.locals.title="Kategoriler"
    const categories = await Category.findAll({
        where:{
            isDeleted:false
        }
    })
    await res.render('category/categories', {categories})
}

const addCategory = async (req,res)=>{

    res.locals.title="Yeni Ekle"
    await res.render('category/addCategory')
}

const updateCategory = async (req,res)=>{

    res.locals.title = ""
    const id = req.params.id
    const category = await Category.findByPk(id, {
        where:{
            isDeleted:false
        }
    }).then(category=>{
        res.locals.title = category.name
        res.render('category/updateCategory', {isSuccess:true, category})
    }).catch(err=>{
        res.render('category/updateCategory', {isSuccess:false, category:{}})
    })
}

const addCategoryAjax = async (req,res)=>{
    
    let name = req.body.name

    if (name == "" || name == null || name == undefined || name.trim() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen isim giriniz"})
    }
    name = name.trim()

    const sameCategory = await Category.findOne({
        where:{
            name,
            isDeleted:false
        }
    })

    if (sameCategory) {
        return res.status(400).send({isSuccess:false, message: "Bu isimde kategori var. Lütfen farklı bir isim giriniz"})
    }

    const category = await Category.create({
        name,
        isActive:true,
        isDeleted:false,
        createdAt:moment(),
        updatedAt: moment()
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu"})
    })
    await res.send({isSuccess:true, message: "Kategori başarıyla eklendi"})
}

const updateCategoryAjax = async (req,res)=>{
    
    const {id, isActive} = req.body.id
    let name = req.body.name
   
    if (name == "" || name == null || name == undefined || name.tirm() == "") {
        return res.status(400).send({isSuccess:false, message: "Lütfen isim giriniz"})
    }
    name = name.trim()
    
    const sameCategory = await Category.findOne({
        where:{
            name,
            isDeleted:false,
            id:{
                [Op.ne]: id,
            }
        }
    })

    if (sameCategory) {
        return res.status(400).send({isSuccess:false, message: "Bu isimde kategori var. Lütfen farklı bir isim giriniz"})
    }

    const category = await Category.update({
        name,
        isActive:getCheckedBtn(isActive),
        updatedAt: moment()
    }, {
        where:{
            id
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu"})
    })
    await res.send({isSuccess:true, message: "Kategori başarıyla güncellendi"})
}

const deleteCategoryAjax = async (req,res)=>{
    const id = req.body.id

    let categories = await Category.findAll({
        where:{
            isDeleted:false
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id})
    })

    let childCategories = categories.filter(el=>el.parentId == id)

    let subcategoriesIds = getIdsSubcategories(childCategories, categories)
    let childCategoriesIds = childCategories.map(el=>el.id)
    let removedIds = [...childCategoriesIds, ...subcategoriesIds, parseInt(id)]

    const category = await Category.update({
        isDeleted:true,
        updatedAt: moment()
    }, {
        where:{
            id:removedIds
        }
    }).catch(err=>{
        res.send({isSuccess:false, message: "Bir hata oluştu", id, removedIds})
    })
    await res.send({isSuccess:true, message: "Kategori başarıyla silindi", id, removedIds})
}

const sequenceCategory = (req,res)=>{
    res.locals.title="Kategori Sıralama"

    Category.findAll({
        where:{
            isDeleted:false
        }
    }).then((categories)=>{
        
        let geciciDizi = []

        categories.forEach(item => {  // parentid ye sahip olanları gecici dizide parentid olusturup içine ekedik
            if (item.parentId == 0)
            return
            
            if (geciciDizi[ item.parentId ] === undefined)
            geciciDizi[ item.parentId ] = []
            
            geciciDizi[ item.parentId ].push(item)
        })
        
        categories.forEach(item => {
            if (item.id == 0)
                return

            if (geciciDizi[ item.id ] === undefined)  // gecici dizide yoksa bu en tepede bir parenttır yani parent id si 0 dır
                return

            item["children"] = geciciDizi[ item.id ] // degerini gecici diziden alıp içine ekleyeim
        })

        let ret = []

        categories.forEach(item => { // son olarak en tepe parent ları ret e ekleyelim
            if (item.parentId !== 0)
                return

            ret.push(item)
        })


        //sıralamak için
        categories.forEach(item =>{
            isChildren(item)
        })
        sirala(ret)

        res.render('category/sequenceCategory', {categories:ret})
    })
}

const seqenceCategoryUpdateAjax = async (req, res)=>{
    let nestList = JSON.parse(req.body.EditableJSONList)
    let id = 0
    let categoryList = deserializeList(nestList, id)
    
    const t = await db.transaction()
    
    try{
        for (let i = 0; i < categoryList.length; i++) {
            const item = categoryList[i];
            item.sequence = i + 1

            await Category.update({ 
                parentId: item.parentId,
                sequence: item.sequence
            }, {
                where: {
                  id: item.id
                }
            }, { transaction: t })
        }
        
        await t.commit()
        await res.send({isSuccess:true, message:'Kategori sıralaması başarıyla güncellendi'})
    } catch(err){
        await t.rollback()
        await res.send({isSuccess:false, message:'Bir hata oluştu'})
    }
    
}




function getIdsSubcategories(arr, categories){
    let result = []
    
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        
        let childCategories = categories.filter(el=>el.parentId == item.id)

        if(childCategories.length > 0){
            let itemChildIds = childCategories.map(el=>el.id)
            result.push(...itemChildIds)
            result = result.concat(getIdsSubcategories(childCategories, categories))
        }
    }
    return result
}
function isChildren(item){
    if(item.children){
        for (let i = 0; i < item.children.length; i++) {
            isChildren(item.children[i])
        }
        sirala(item.children)
    }
}

function sirala(arr){
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if(arr[j].sequence > arr[j + 1].sequence){
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }
}

function deserializeList(arr, id) {
    let result = []

    for(let i = 0; i < arr.length; i++){
        if(arr[i].hasOwnProperty('children')){
            result.push({
                id:arr[i].id,
                parentId:id,
                has:true
            })
            result = result.concat(deserializeList(arr[i].children, arr[i].id))
        }else{
            result.push({
                id:arr[i].id,
                parentId:id,
                has:false
            })
        }
    }
    return result
}

export default {
    allCategories,
    addCategory,
    updateCategory,
    addCategoryAjax,
    updateCategoryAjax,
    deleteCategoryAjax,
    sequenceCategory,
    seqenceCategoryUpdateAjax
}