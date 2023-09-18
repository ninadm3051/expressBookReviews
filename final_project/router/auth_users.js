const express = require('express');
const jwt = require('jsonwebtoken');
let books = Object.values(require("./booksdb.js"));
const regd_users = express.Router();

const JWT_SECRET = "access"

let users = [
  {
    username: "chinsiang",
    password: "1234"
  },
  {
    username: "dummy1",
    password: "dummy2"
  }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const filtered = users.find(user => {
    return user.username === username
  })

  if(filtered){
    return filtered;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const {username, password} = req.body;

  const result = isValid(username);

  if(!result){
    return res.status(400).json({
      message: `user with username ${username} not found`
    })
  }

  if(password === result.password){
    let accessToken = jwt.sign({
      data: {
        username : result.username
      }
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken
    }
  }else{
    return res.status(401).json({
      message: "User is not authorized, wrong password"
    })
  }
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.data.username;

  if (!username) {
    res.status(401).json({message: 'User not authenticated'});
    return;
  }

  // Find the book by ISBN
  const book = books[+isbn - 1];

  if (!book) {
    res.status(404).json({message: 'Book not found'});
    return;
  }

  // Check if a review already exists for the same username and ISBN
  if (book.reviews[username]) {
    // Modify the existing review
    book.reviews[username] = review;
    res.json({message: 'Review modified successfully'});
  } else {
    // Add a new review
    book.reviews[username] = review;
    res.json({message: 'Review added successfully'});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.user.data.username;

  if (!username) {
    res.status(401).json({message: 'User not authenticated'});
    return;
  }

  // Find the book by ISBN
  const book = books[+isbn - 1];

  if (!book) {
    res.status(404).json({message: 'Book not found'});
    return;
  }

  // Check if a review exists for the same username and ISBN
  if (book.reviews[username]) {
    // Delete the review for the authenticated user
    delete book.reviews[username];
    res.json({message: 'Review deleted successfully'});
  } else {
    res.status(404).json({message: 'Review not found'});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;