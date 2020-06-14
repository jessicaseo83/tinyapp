const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const generateRandomString = require("./helpers").generateRandomString;
const userFinderByEmail = require("./helpers").userFinderByEmail;
const userFinder = require("./helpers").userFinder;
const newUser = require("./helpers").newUser;
const urlsForUser = require("./helpers").urlsForUser;
  



app.use(cookieSession({
  name: 'session',
  keys: ['pihilekqj-eiigh3009i','awnblre889-ewo3i20e']
}));

const urlDatabase = {
  // shortURL:  {longURL, userID}
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ojw3xd"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "ojw3xd"}
};

// user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



// if we have a get request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  // const userID = req.session["user_id"]
  // const loginUser = users[userID];
  const templateVars = { urls: urlDatabase, user : null};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = userFinderByEmail(email, users);

  if (!email || !password) {
    res.status(400);
    res.render("urls_registerfailed", templateVars);

  }
 
  if (!userFound) {
    const userId = newUser(email, password, users);

    req.session["user_id"] = userId;
    // res.cookie("email", req.body.email);
    // res.cookie("password", req.body.password);
    res.redirect("/urls");

  } else {
    const templateVars = { user: null};
    res.status(400);
    res.render("urls_registerfailed", templateVars);
  }


});



//user login page
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userFinder(email, password, users);
  
  if (user) {
    req.session['user_id'] = user.id;
    res.redirect("/urls");
    
  } else {
    const templateVars = { user: null};
    res.status(403)
    res.render("urls_loginfailed", templateVars);
   
  }
  
});

//user logout
app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie("email");
  // res.clearCookie("password");
  res.redirect("/urls");
});

// url page
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const loginUser = users[userID];
 
  const userUrl = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrl, user: loginUser  };
  

  if (loginUser) {

    res.render("urls_index", templateVars);
    
  } else {
    const templateVars = { urls: userUrl, user: null};
    res.render("urls_ask", templateVars);
    
  }
  
});


// only logged in user can see this page
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  const loginUser = users[userID];
  const userUrl = urlsForUser(userID);

  if (loginUser) {
    const templateVars = { urls: userUrl, user: loginUser };
    res.render("urls_new", templateVars);

  } else {

    const templateVars = {user: null};
    res.status(403);
    res.render("urls_ask", templateVars);
    
  }

});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  res.redirect(`urls/${shortURL}`);

  const userID = req.session["user_id"];
  urlDatabase[shortURL] = {longURL, userID};
  
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session["user_id"];
  const currentUser = users[userID];

  const templateVars = { shortURL, longURL, user: currentUser };

  if(!currentUser){
    const templateVars = {user: null};
    res.status(403);
    res.render("urls_ask", templateVars);
  

  } else {
    res.render("urls_show", templateVars);
  }

});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  const currentUser = users[userID];
  if (currentUser) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    const templateVars = {user: null};
    res.status(403);
    res.render("urls_permission", templateVars)
  }
 
});

// when user wants to change the long Url to an alreadty existing short Url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];
  

  urlDatabase[shortURL] = {longURL, userID};
  
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
 
// when 404 error happens
app.use((err,req, res, next) => {
  console.log(err.message);
  res.status(404).send("Something went wrong!");
  next();
});


//to check user database
app.get("/urls.json", (req, res) => {
  res.json(users);
});