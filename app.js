import express from 'express' 
import expressLayouts from 'express-ejs-layouts'
import moment from 'moment'
import cookieParser from "cookie-parser"
import session from 'express-session'
import passport from 'passport'
import flash from 'connect-flash'
import path from 'path'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'
import fs from 'fs'
import Page from './src/models/template/Page'


i18next.use(Backend).use(middleware.LanguageDetector).init({
    fallbackLng:'en',
    backend:{
        loadPath:'./resources/locales/{{lng}}/translation.json'
    }
})


const app = express()
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(middleware.handle(i18next))
const port = 3002;


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.static('public_admin'))
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('layout', './layouts/layout')
app.set("layout extractScripts", true)
app.set("layout extractStyles", true)


app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


// moment locals add
var shortDateFormat = 'DD.MM.YYYY';
app.locals.moment = moment; 
app.locals.shortDateFormat = shortDateFormat;
app.locals.datatableViewDateFormat = "YYYY.MM.DD";

const userRoutes = require('./src/routes/UserRoutes.js')
const categoryRoutes = require('./src/routes/CategoryRoutes.js')
const videoRoutes = require('./src/routes/VideoRoutes.js') 
const tourRoutes = require('./src/routes/TourRoutes.js') 
const templateRoutes = require('./src/routes/TemplateRoutes')
const authRouter = require('./src/routes/auth')

app.use('/', authRouter)


app.get('/', (req, res)=>{
    res.render('webUI/home', {layout:'webUI/layout'})
})


app.use(async (req,res,next)=>{
    const url = req.originalUrl
    let page = await getPages(url)

    if(page){
        res.render('webUI/content', {layout:'webUI/layout', header:page.header, content:page.content})
    }else{
        next()
    }
})

async function getPages(url){
    return await Page.findOne({
        where:{
            isDeleted:false,
            url:url
        }
    })
}






app.get('*', (req,res, next)=>{
    console.log('GİRİŞ YAPTI')

    if(req.isAuthenticated()){
        app.locals.username = req.user.name
        next()
    }else{
    console.log('GİRİŞ YAPMADI')

        res.redirect('/login')
        app.locals.user = {}
    }
}) 

app.get('/admin', async (req,res)=>{
    res.locals.title="Anasayfa"

    //res.redirect('grafikler')

    res.render('home')
})

app.use(userRoutes)
app.use(categoryRoutes)
app.use(videoRoutes)
app.use(tourRoutes)
app.use(templateRoutes)




app.listen(port, ()=>{
    console.log(`The server is listening on port ${port}`)
})