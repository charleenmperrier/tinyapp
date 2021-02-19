const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
//STORED urls
const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID' },
  '9sm5xK': { longURL: "http://www.google.com", userID: "userRandomID" }
};
//USER database
const users = {
  "userRandomID": {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"},
  "user2RandomID": {id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk"}
};

app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// GET //
app.get("/urls", (req, res) => {
  const data = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = { user: users[req.session['user_id']], data: data };
  res.render('urls_index', templateVars);
});
app.get("/urls/new", (req, res) => {
  if (!users[req.session['user_id']]) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session['user_id']] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_register", templateVars);
});
app.get("/login", (req,res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_login", templateVars);
});

// PATCH //
app.patch("/urls/:shortURL/update", (req,res) => {
  const urlObj = urlDatabase[req.params.shortURL];
  if (urlObj.userID !== req.session['user_id']) {
    res.status(403).send('access not permitted');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.updatedURL;
    res.redirect(`/urls`);
  }
});
app.patch("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session['user_id'] = user.id;
      res.redirect("/urls");
      return;
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.redirect(403, '/login');
      return;
    }
  }
});

// POST //
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.redirect(400, '/register');
    return;
  }
  if (getUserByEmail(req.body.email, users)) {
    res.redirect(400, '/register');
    return;
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {id: userID, email: req.body.email, password: hashedPassword};
  req.session['user_id'] = userID;
  res.redirect('/urls');
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// DELETE //
app.delete("/urls/:shortURL/delete", (req,res) => {
  const urlObj = urlDatabase[req.params.shortURL];
  if (urlObj.userID !== req.session['user_id']) {
    res.status(403).send('access not permitted');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});