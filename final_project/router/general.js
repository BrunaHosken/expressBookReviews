const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({message: "Username already exists"});
  }

  users.push({"username": username, "password": password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify({books}, null, 4));
});


public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});
  
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  Object.keys(books).forEach((key) => {
    if (books[key].author === author) {
      booksByAuthor.push({
        isbn: key,
        title: books[key].title,
        reviews: books[key].reviews
      });
    }
  });

  return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      booksByTitle.push({
        isbn: key,
        author: books[key].author,
        reviews: books[key].reviews
      });
    }
  });

  return res.status(200).send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(BASE_URL + '/');
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({message: "Error fetching books", error: error.message});
    }
});

public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(BASE_URL + '/isbn/' + isbn)
    .then(response => {
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(error => {
        return res.status(404).json({message: "Book not found", error: error.message});
    });
});

public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(BASE_URL + '/author/' + author);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({message: "Author not found", error: error.message});
    }
});


public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(BASE_URL + '/title/' + title);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({message: "Title not found", error: error.message});
    }
});

module.exports.general = public_users;