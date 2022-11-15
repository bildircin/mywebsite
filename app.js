const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const moment = require('moment')
const cookieParser = require("cookie-parser")
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware  = require('i18next-http-middleware')
const fs = require('fs')
const Page = require('./src/models/template/Page')


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

getPages()

async function getPages(){
    const pages = await Page.findAll({
        where:{
            isDeleted:false
        }
    })
    
    for (let i = 0; i < pages.length; i++) {
        const item = pages[i];
        
        app.get(item.url, async (req, res)=>{
            res.render('webUI/content', {layout:'webUI/layout', content:item.content})
        })
    }
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