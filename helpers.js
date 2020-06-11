const bcrypt = require("bcrypt");
const saltRounds = 10;


// user id generater
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

// find user by email
const userFinderByEmail = (email, database) => {
  for (let userUid in database) {
    if (database[userUid].email === email){
      return database[userUid];
    }
  }
  return false;
}

// find user by given email and password and check if they match
const userFinder = (email, password, database) => {
  const user = userFinderByEmail(email, database);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

// newuser
const newUser = (email, password, database) => {
  const userUid = generateRandomString();
  const newUserObj = {
    id: userUid,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  }
  database[userUid] = newUserObj;
  return userUid;
}

// user's urls
const urlsForUser = (id, database) => {
  const userUrl = {};
  for (let url in database) {
    if(database[url].userID === id) {
      userUrl[url] = database[url].longURL;
    }
  }
  return userUrl;
}


module.exports = { 
  generateRandomString,
  userFinderByEmail,
  userFinder,
  newUser,
  urlsForUser
}

