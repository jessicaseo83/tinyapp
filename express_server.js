const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  //shortURL:  longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

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

const userFinderByEmail = (email) => {
  for (let userUid in users) {
    if (users[userUid].email === email){
      return true/*users[userUid]*/;
    }
  }
  return false;
}

// if we have a get request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.send("Hello!");
});

//register
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"]
  const currentUser = users[userID];
  let templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const user = { id, email, password };
  users[user.id] = user;
  res.cookie("user_id", user.id)
  res.cookie("email", req.body.email);
  res.cookie("password", req.body.password);
  
  if (!email) {
    res.status(400).send("Please provide valid email."); 
  }
  
  if (userFinderByEmail(email)){
    res.status(400).send("This email is already registered!");
  }
  
  res.redirect("/urls")
});

//user login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const currentUser = users[userID];
  let templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_index", templateVars)
})

//user logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"]
  const currentUser = users[userID];
  let templateVars = { shortURL, longURL, user: currentUser };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
 

app.use((err,req, res, next) => {
  console.log(err.message);
  res.status(404).send("Something went wrong!")
});



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });