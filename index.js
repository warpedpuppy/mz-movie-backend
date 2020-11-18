//Dependencies
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const express = require("express"),
  morgan = require("morgan");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));

// All movies
let movies = [];

//Favourite movies
let FavouriteMovies = [];

//Home page
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// Return all movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then(movies => {
      res.status(201).json(movies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Returns data about a single movie by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then(movie => {
      res.json(movie);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Returns data about a specific genre by genre name
app.get("movies/genre/:Name", (req, res) => {
  Genres.findOne({ Title: req.params.Title })
    .then(genre => {
      res.json(genre.Description);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Returns data about a specific director by director name
app.get("movies/director/:Name", (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then(director => {
      res.json(director);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// GET all users
app.get("/users", (req, res) => {
  Users.find()
    .then(users => {
      res.status(201).json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// GET a user by username
app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Add a user
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then(user => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then(user => {
            res.status(201).json(user);
          })
          .catch(error => {
            console.error(error);
            res.send(500).send("Error: " + error);
          });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Updates a users info by username
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Add a movie to a users list of favourites
app.post("/users/:Username/Movies/:MovieID", (req, res) => {
  Users.fineOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavouriteMovies: req.params.MovieID }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Remove a movie from a users list of favourites
app.post("/users/:Username/Movies/:MovieID", (req, res) => {
  Users.fineOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavouriteMovies: req.params.MovieID }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.fineOneAndRemove({ Username: req.params.Username })
    .then(user => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found.");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
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

// -----------------------------------------------------------

// //Dependencies
// const express = require("express"),
// morgan = require("morgan");
//
// const app = express();
//
// app.use(morgan("common"));
// app.use(express.static("public"));
//
// // All movies
// let movies = [];
//
// //Favourite movies
// let myFavourites = [];
//
// //Home page
// app.get("/", (req, res) => {
// res.send("Welcome to myFlix!");
// });
//
// // List of data of all movies
// app.get("/movies", (req, res) => {
// // res.json(movies);
// res.send("Succesful GET request to retrieve all movies.");
// });
//
// //Loads json of myFavourites object
// app.get("/movies/myFavourites", (req, res) => {
// // res.json(myFavourites);
// res.send("Succesful GET request to retrieve myFavourite movies.");
// });
//
// // Gets data about a single movie by title
// app.get("/movies/:title", (req, res) => {
// res.send("Succesful GET request returning data on a single movie.");
// });
//
// // Gets data about a genre by title
// app.get("/movies/genre/:title", (req, res) => {
// res.send("Succesful GET request returning data of a genre by title.");
// });
//
// // Gets data about director by title
// app.get("/movies/director/:title", (req, res) => {
// res.send("Succesful GET request returning data on a director by title.");
// });
//
// // Post new user registration
// app.post("/user", (req, res) => {
// res.send("Succesful POST request for user registration.");
// });
//
// // Updates user info (username only for now)
// app.put("/user/:userName", (req, res) => {
// res.send("Succesful PUT request to update username.");
// });
//
// // Post a movie to myFavourites
// app.post("/user/:newFavourite", (req, res) => {
// res.send("Succesful POST request to add a movie to myFavourites.");
// });
//
// // Delete a movie from myFavourites
// app.delete("/user/:myFavourites", (req, res) => {
// res.send("Succesful DELETE request to remove a movie from myFavourites.");
// });
//
// // Delete user account
// app.delete("/user/account/:userName", (req, res) => {
// res.send("Succesful DELETE request to delete an account.");
// });
//
// //Logs every time you load a page
// app.listen(8080, () => {
// console.log("Your app is listening on port 8080.");
// });
//
// //Error handler
// app.use((err, req, res, next) => {
// console.error(err.stack);
// res.status(500).send("Something broke!");
// });
