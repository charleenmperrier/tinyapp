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
const users = { 
  "userRandomID": {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"},
  "user2RandomID": {id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk"}
}



//GET
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('urls_index', templateVars)
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_new", templateVars);
  
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("/u/:shortURL", templateVars);
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_register", templateVars);
});
app.get("/login", (req,res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_login", templateVars);
});


//POST
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
 


  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  
  if (req.body.email === '' || req.body.password === '') {
    console.log('empty string')
    res.redirect(400, '/register');
    return
  }
 
  for (let userName in users) {
    if (req.body.email === users[userName].email) {
      console.log('existing email')
      res.redirect(400, '/register');
      return
    }
  }
  
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};

  res.cookie('user_id', userID)
  console.log(users)
  res.redirect('/urls');
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});