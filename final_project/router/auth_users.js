const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// (Task 6/7 helper)
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

// (Task 7 helper)
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Task 7: Login
// Only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      req.session.authorization = {
          accessToken,username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Task 8: Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; 
  const username = req.session.authorization['username'];

  if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  }
  else {
      return res.status(404).json({message: "Book not found"});
  }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (books[isbn]) {
        let book = books[isbn];
        if (book.reviews[username]){
            delete book.reviews[username];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({message: "Review not found for this user"});
        }
    }
    return res.status(404).json({message: "Book not found"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;