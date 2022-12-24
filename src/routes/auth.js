import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import User from '../models/User.js'
import LogUserSession from '../models/LogUserSession.js'
import bcrypt from 'bcryptjs'

var router = express.Router();

passport.use(new LocalStrategy({passReqToCallback : true}, async function verify(req, username, password, done) {
  let blockReq = req
    
    if(username == '' || username == null || password == '' || password == null){
        return done(null, false, await req.flash('error_login', 'Kullanıcı Adı ya da Parola boş!'))
    }
        
    await User.findOne({where:{username}}).then(async (user) =>{
        let ip = blockReq.headers['x-forwarded-for'] || blockReq.socket.remoteAddress || null

        if (!user) { 
          setLogUserSession(null, 'Kullanıcı bulunamadı!', false, ip)
          return done(null, false, await req.flash('error_login', 'Kullanıcı bulunamadı!')); 
        }

        const hashed = await bcrypt.hash(user.password, 10)
        
        bcrypt.compare(password, hashed, async (err, res) => {
            if(res){

                setLogUserSession(user.id, user.userName, true, ip)
                return done(null, user, await req.flash('error_login', 'Giriş başarılı'))
              }else{
                setLogUserSession(user.id, ("Geçersiz Parola " + err), false, ip)
                return done(null, false, await req.flash('error_login', 'Geçersiz parola!'))
            }
        })

      }).catch(err => {
        if (err) { 
          setLogUserSession(null, err, false, ip)
          return done(err, null, 'Bir hata oluştu'); 
        }
      })
    
}))


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findByPk(id).then(user => {
    done(null, user);
    
  }).catch(err => {
    done(err, false);
  })
});

router.get('/login', function(req, res) {
    const errors = req.flash().error_login || []
    res.render('user/login', {layout:false, errors})
})

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login')
    });
  });

router.post('/user-ajax', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
}))

function setLogUserSession(userId, description, isSuccess, ipAddress){
  LogUserSession.create({
    userId,
    description,
    isSuccess,
    ipAddress
  }).catch(err =>{
    console.log(err)
  })
}

export default router;