const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ 
    return users.some(user => user.username === username);
};
//write code to check is the username is valid

const authenticatedUser = (username, password) => { 
    return users.some(user => user.username === username && user.password === password);
}; // Returns true if username and password match
    
//write code to check if username and password match the one we have in records.
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    jwt.verify(token, "access", (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach user info to req
        next(); // Proceed to the next middleware or route handler
    });
}
//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username
	const password = req.body.password

	if (!username || !password) {
		return res.status(404).json({message: 'Error logging in'})
	}

	if (authenticatedUser(username, password)) {
        // Generate a JWT token
        const token = jwt.sign({ username }, "access");

        // Set req.user with the authenticated username
        req.user = { username };
		return res.status(200).send({ message: 'User successfully logged in', token});
	} 
    else {return res.status(208).json({message: 'Invalid Login. Check username and password'})}
});

// Add a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username; // Set by authenticateToken middleware

    console.log("isbn:", isbn);
    console.log("review:", review);
    console.log("username:", username);

    // Check if the ISBN exists in the books object
    if (!books.hasOwnProperty(isbn)) {
        return res.status(404).json({ message: "Book not found" });
    }

    const book = books[isbn]; // Get the book details

    // Check if the user already has a review for this book
    if (book.reviews.hasOwnProperty(username)) {
        book.reviews[username] = review; // Modify the existing review
        return res.status(200).json({ message: "Review modified successfully" });
    } else {
        book.reviews[username] = review; // Add a new review
        return res.status(200).json({ message: "Review added successfully" });
    }
});

regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn; // Extract ISBN from the route
    const username = req.user.username; // Extract username from the JWT

    // Check if the book exists
    if (!books.hasOwnProperty(isbn)) {
        return res.status(404).json({ message: "Book not found" });
    }

    const book = books[isbn]; // Get the book details

    // Check if the user has a review for this book
    if (book.reviews.hasOwnProperty(username)) {
        delete book.reviews[username]; // Remove the user's review
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found for this user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
