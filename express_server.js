const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const generateRandomString = function() {
  let newURLString = '';
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i ++) {
    newURLString += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return newURLString;
};

app.set('view engine', 'ejs')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};




app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars)
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
  
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("/u/:shortURL", templateVars);
  res.redirect(longURL);
  
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});
app.post("/urls/:shortURL/update", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.updatedURL
  res.redirect(`/urls`);
});
app.post("/login", (req, res) => {
  const username = req.body.login;
  res.cookie('username', username);
  res.redirect("/urls");

  
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});