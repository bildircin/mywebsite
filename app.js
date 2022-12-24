import express from 'express' 
import expressLayouts from 'express-ejs-layouts'
import moment from 'moment'
import cookieParser from "cookie-parser"
import session from 'express-session'
import passport from 'passport'
import flash from 'connect-flash'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'
import Page from './src/models/Page.js'
import fileUpload from 'express-fileupload'

const app = express()
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))

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
app.use(fileUpload());


app.use(middleware.handle(i18next))
i18next.use(Backend).use(middleware.LanguageDetector).init({
    fallbackLng:'tr',
    backend:{
        loadPath:'./resources/locales/{{lng}}/translation.json'
    }
})

/* app.use(async (req,res,next) => {

    for (const key in isoLangs) {
        const item = isoLangs[key]

        await LanguageCode.create({
            lng:key,
            name:item.name,
            nativeName:item.nativeName
        })
    }

}) */




/* app.use(async (req,res,next) => {
    if(req.cookies.lng){
        const lng = req.cookies.lng

        const languages = await LanguageItem.findAll({
            where:{
                lng
            }
        }).catch(err=>{
            console.log(err)
        })

        let obj = {}
        
        languages.forEach(item => {
            obj[item.key] = item.value
        });
        
        const dir = './resources/locales/' + lng;

        if(fs.existsSync(dir)){
            fs.writeFile('./resources/locales/' + lng + '/translation.json', JSON.stringify(obj), (err) => {
                if (err){
                    console.log(err)
                }
            })
        }else{
            fs.mkdirSync(dir)
            fs.writeFile('./resources/locales/' + lng + '/translation.json', JSON.stringify(obj), (err) => {
                if (err){
                    console.log(err)
                }
            })
        }

        await req.i18n.changeLanguage(lng)
    }
    next()
})
 */
// moment locals add
var shortDateFormat = 'DD.MM.YYYY';
app.locals.moment = moment; 
app.locals.shortDateFormat = shortDateFormat;
app.locals.datatableViewDateFormat = "YYYY.MM.DD";

import userRoutes from './src/routes/UserRoutes.js'
import categoryRoutes from './src/routes/CategoryRoutes.js'
import videoRoutes from './src/routes/VideoRoutes.js'
import tourRoutes from './src/routes/TourRoutes.js'
import imageRoutes from './src/routes/ImageRoutes.js'
import sharedImageRoutes from './src/routes/SharedImageRoutes.js'
import templateRoutes from './src/routes/TemplateRoutes.js'
import pageContentRoutes from './src/routes/PageContentRoutes.js'
import webUIRoutes from './src/routes/WebUIRoutes.js'
import settingsRoutes from './src/routes/SettingsRoutes.js'
import blogRoutes from './src/routes/BlogRoutes.js'
import authRouter from './src/routes/auth.js'

app.use('/', authRouter)



app.use(webUIRoutes)

app.use(async (req,res,next)=>{
    const url = req.originalUrl
    let page = await getPages(url)

    if(page){
        res.render('webUI/content', {layout:'webUI/layout', header:page.pageHeader, content:page.pageContent})
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

/* 
app.get('*', (req,res, next)=>{

    if(!req.isAuthenticated() && req.url != 'login'){
        if(req.url == "/admin"){
            return next()
        }
        return res.redirect('/404')
    }
    next()
}) 
app.get('*', (req,res, next)=>{

    if(req.isAuthenticated()){
        app.locals.username = req.user.name
        next()
    }else{
        return res.redirect('/login')
    }
}) 
 */


app.get('/admin', async (req,res)=>{
    res.locals.title="Anasayfa"

    //res.redirect('grafikler')

    res.render('home')
})

app.use(userRoutes)
app.use(categoryRoutes)
app.use(videoRoutes)
app.use(tourRoutes)
app.use(imageRoutes)
app.use(sharedImageRoutes)
app.use(settingsRoutes)
app.use(blogRoutes)
app.use(templateRoutes)
app.use(pageContentRoutes)


app.get('*', (req,res)=>{
    res.render('404')
})

app.listen(port, ()=>{
    console.log(`The server is listening on port ${port}`)
})