//Dependencies
const express = require("express"),
  morgan = require("morgan");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));

// All movies
let movies = [];

//Favourite movies
let myFavourites = [];

//Home page
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// List of data of all movies
app.get("/movies", (req, res) => {
  // res.json(movies);
  res.send("Succesful GET request to retrieve all movies.");
});

//Loads json of myFavourites object
app.get("/movies/myFavourites", (req, res) => {
  // res.json(myFavourites);
  res.send("Succesful GET request to retrieve myFavourite movies.");
});

// Gets data about a single movie by title
app.get("/movies/:title", (req, res) => {
  res.send("Succesful GET request returning data on a single movie.");
});

// Gets data about a genre by title
app.get("/movies/genre/:title", (req, res) => {
  res.send("Succesful GET request returning data of a genre by title.");
});

// Gets data about director by title
app.get("/movies/director/:title", (req, res) => {
  res.send("Succesful GET request returning data on a director by title.");
});

// Post new user registration
app.post("/user", (req, res) => {
  res.send("Succesful POST request for user registration.");
});

// Updates user info (username only for now)
app.put("/user/:userName", (req, res) => {
  res.send("Succesful PUT request to update username.");
});

// Post a movie to myFavourites
app.post("/user/:newFavourite", (req, res) => {
  res.send("Succesful POST request to add a movie to myFavourites.");
});

// Delete a movie from myFavourites
app.delete("/user/:myFavourites", (req, res) => {
  res.send("Succesful DELETE request to remove a movie from myFavourites.");
});

// Delete user account
app.delete("/user/account/:userName", (req, res) => {
  res.send("Succesful DELETE request to delete an account.");
});

//Logs every time you load a page
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
