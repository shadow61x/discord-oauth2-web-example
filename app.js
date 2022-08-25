const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express()
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const { Strategy } = require("passport-discord");
const ejs = require("ejs");






  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));


  const strategy = new Strategy(
	{
	 clientID:"clientID",
        clientSecret:"clientSecret",
        callbackURL:"callbackURL",
     scope: ["identify","guilds.join","guilds"]
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.session());
app.use(passport.initialize());

app.use(express.static("public"));
app.set('view engine' , 'ejs')


const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/giris");
  };

  const templateDir = path.resolve(`${process.cwd()}${path.sep}/views`);

  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
    };
      res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data)
      );
    
  };

  app.get(
    "/giris",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
  
      } else {
        res.redirect("/");
      }
      next();
    },
    passport.authenticate("discord", /*oto auth*/ { prompt: "none" })
  );
  
  app.get(
      "/callback",
      passport.authenticate("discord", {
          failureRedirect: "/hata",
      }),
      (_req, res) => res.redirect("/"),
  );


app.get("/", checkAuth, async (req, res) => {
    let getuser = req.user
    renderTemplate(res, req, "index.ejs", {
getuser
  });
});


app.use( ( req,res) =>{
    res.status(404).render('./404/404.ejs')
})


app.listen(3000, ()=>{
    console.log("Sunucu 3000 portunda çalıştırılıyor...");
   })
   