const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const response = await axios.get('https://vanjabukaric-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/');
        const booksByTitle = Object.values(response.data).filter(book => 
            book.title.toLowerCase().trim() === title.toLowerCase().trim()
        );

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error("Error fetching books by title:", error.message);
        res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Get all books based on author using async-await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const response = await axios.get('https://vanjabukaric-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/');
        const booksByAuthor = Object.values(response.data).filter(book => 
            book.author.toLowerCase().trim() === author.toLowerCase().trim()
        );

        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get book details using isbn and async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`https://vanjabukaric-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/isbn/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching book details by ISBN:", error.message);
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

// Get all book info
public_users.get('/',async (req, res) => {
    const externalApiUrl = 'https://vanjabukaric-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/';
    try {
        console.log(`Fetching data from external API: ${externalApiUrl}`);
        const response = await axios.get(externalApiUrl);
        res.status(200).json(response.data); // Send the API response
    } catch (error) {
        console.error(`Error fetching data from external API: ${error.message}`);
        console.log("Serving local books as fallback");
        res.status(200).json(books); // Fallback to local data
    }
});

// register new user
public_users.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the user already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Find the book by its ISBN
    let book_reviews = books[isbn];
    // If book exists, return reviews
    if (book_reviews) {
      res.send(book_reviews.reviews);
    } else {
      // If the book doesn't exist, return a 404 status
      res.status(404).json({ message: "Book with this ISBN not found" });
    }
  });

module.exports.general = public_users;
