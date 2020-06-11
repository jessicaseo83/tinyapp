const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.use(cookieSession({
  name: 'session',
  keys: ['pihilekqj-eiigh3009i','awnblre889-ewo3i20e']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  // shortURL:  {longURL, userID}
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ojw3xd"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "ojw3xd"}
};

// user id generater
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

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
}
// newuser
const newUser = (email, password) => {
  const userUid = generateRandomString();
  const newUserObj = {
    id: userUid,
    email,
    password
  }
  users[userUid] = newUserObj;
  return userUid;
}
// find user by email
const userFinderByEmail = (email) => {
  for (let userUid in users) {
    if (users[userUid].email === email){
      return users[userUid];
    }
  }
  return false;
}
// find user by given email and password and check if they match
const userFinder = (email, password) => {
  const user = userFinderByEmail(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};
// user's urls
const urlsForUser = (id) => {
  const userUrl = {};
  const database = urlDatabase;
  for (let url in database) {
    if(database[url].userID === id) {
      userUrl[url] = database[url].longURL;
    }
  }
  return userUrl;
}

// if we have a get request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.send("Hello!");
});

//register
app.get("/register", (req, res) => {
  const userID = req.session["user_id"]
  const currentUser = users[userID];
  let templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  const userFound = userFinderByEmail(email);

  if (!email || !password) {
    res.status(400).send("Please provide a valid email address/password"); 
  } 

  if(!userFound){
    const userId = newUser(email, hashedPassword);

    req.session["user_id"] = userId;
    // res.cookie("email", req.body.email);
    // res.cookie("password", req.body.password);
    res.redirect("/urls")

  } else {
    res.status(400).send("You are already registered!")
  }


});

// show user's urls 
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"]
  const currentUser = users[userID];
  const userUrl = urlsForUser(userID)
  

  if(currentUser){
    let templateVars = { urls: userUrl, user: currentUser  };
    res.render("urls_index", templateVars);
   } else {
    let templateVars = { urls: userUrl, user: null}
    res.render("urls_ask", templateVars);
    
   }
})

//user login page
app.get("/login", (req, res) => {
  const templateVars = { user: null};
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userFinder(email, password);

  if(user) {
    req.session['user_id'] = user.id;
    res.redirect("/urls");
    b
  } else {
    res.status(403).send("Your email/password is incorrect or not registered");
  }
 
})

//user logout
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  // res.clearCookie("email");
  // res.clearCookie("password");
  res.redirect("/urls");
})





app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"]
  const currentUser = users[userID];
  const userUrl = urlsForUser(userID)

  if(currentUser){
    let templateVars = { urls: userUrl, user: currentUser  };
    res.render("urls_new", templateVars);
   } else {
    let templateVars = { urls: userUrl, user: null}
    res.render("urls_ask", templateVars);
    
   }

});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  res.redirect(`urls/${shortURL}`);

  const userID = req.session["user_id"]
  urlDatabase[shortURL] = {longURL, userID};
  console.log(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session["user_id"]
  const currentUser = users[userID];
  let templateVars = { shortURL, longURL, user: currentUser };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;  
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"]
  const currentUser = users[userID];
  if(currentUser){
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("Permission Denied");
  }
 
});

// when user wants to change the long Url to an alreadty existing short Url
app.post("/urls/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session["user_id"]
  

  urlDatabase[shortURL] = {longURL, userID};
  
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
 
// when 404 error happens
app.use((err,req, res, next) => {
  console.log(err.message);
  res.status(404).send("Something went wrong!")
});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });

app.get("/urls.json", (req, res) => {
  res.json(users);
});