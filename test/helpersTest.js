const { assert } = require('chai');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { userFinderByEmail, urlsForUser, userFinder, newUser }  = require("../helpers");


const testUsers = {
  "naoe03": {
    id: "naoe03",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "la37ax": {
    id: "ula37ax",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

const urlDatabase = {
  // shortURL:  {longURL, userID}
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ojw3xd"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "ojw3xd"},
  "8dqj2p": { longURL: "http://www.naver.com", userID: "jyeqg9"}
};

describe('userFinderByEmail', () => {
  it('return a user with vaild email', () => {
    const user = userFinderByEmail("user@example.com", testUsers);
    const expect = {
      id: "naoe03",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(expect, user);
  });
  it('return false if the email is not registered', () => {
    const user = userFinderByEmail("owgoi@example.com", testUsers);
    const expect = false;
    assert.equal(expect, user);
  });
});

describe('urlsForUser', () => {
  it('return urls only belongs to the user', () => {
    const id = "jyeqg9";
    const expect = {"8dqj2p": "http://www.naver.com"};
    
    assert.deepEqual(urlsForUser(id, urlDatabase), expect);
  });
  it("return an empty object if the user doesn't have any saved urls" , () => {
    const id = "aighua";
    const expect = {};
    
    assert.deepEqual(urlsForUser(id, urlDatabase), expect);
  });
});


describe('userFinder', () => {
  it('return user id if the given email is registered and the password match', () => {
 
    const expect = {
      id: "ula37ax",
      email: "user2@example.com",
      password: bcrypt.hashSync("dishwasher-funk", saltRounds)
    };
    const result = userFinder("user2@example.com", "dishwasher-funk", testUsers);

    assert.strictEqual(result.id, expect.id);
    assert.strictEqual(result.email, expect.email);
    assert.strictEqual(bcrypt.compareSync("dishwasher-funk", result.password), true);
    
  });
 
  it("return false if the given email is registered and the password doesn't match", () => {
    assert.equal(userFinder("user1@example.com", "hello", testUsers), false);
  });
});

describe('newUser', () => {
  it('return 6 digts of random alphanumeric new user id', () => {
    const result = newUser("hello@hello.com", "catsarethebest", testUsers);
    assert.equal(result.length, 6);
  });
  
  it('add an user info object to the existing user database', () => {
    const user = newUser("byebye@bye.com", "dogsarethebest", testUsers);
    const users = Object.keys(testUsers);
    assert.equal(users.length, 4);

  });
});
