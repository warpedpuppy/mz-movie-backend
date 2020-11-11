//Dependencies
const express = require("express"),
  morgan = require("morgan");
const app = express();

//Top movies
let topMovies = [];

app.use(morgan("common"));
app.use(express.static("public"));

//Home page
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

//Loads json of topMovies object
app.get("/movies", (req, res) => {
  res.json(topMovies);
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
