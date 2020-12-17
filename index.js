require('dotenv').config();
const jwt = require('jsonwebtoken')
//Dependencies
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// Local database
// mongoose.connect("mongodb://localhost:27017/myFlixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Remote database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser");

const app = express();
const cors = require("cors");

app.use(cors());
app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

const { check, validationResult } = require("express-validator");
const { response } = require("express");

// All movies
let movies = [];

//Favourite movies
let FavouriteMovies = [];

//Allows all domains to make api requests
// let allowedOrigins = ["http://localhost:1234"];
// let allowedOrigins = ["*"];

// app.use(
//   cors({
//     origin: "*",
//   })
// );

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           "The CORS policy for this application doesn’t allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     }
//   })
// );

function normalizeUser (user) {
  const { _id: id, Username: username, Password: password, Email: email, FavouriteMovies: favouriteMovies } = user;

  return {
    id, username, email, password, favouriteMovies
  };
  // response.json(normalizeUser(user));
}

function normalizeMovie (movie) {
  const {
    Director: {
      Name: directorName, Bio: directorBio, Birth: directorBirth, Death: directorDeath
    } = {},
    Genre: {
      Name: genreName, Description: genreDescription
    } = {},
    _id: id, Title: title, Description: description, ImagePath: imagePath, Featured: featured 
    } = movie;

  return {
    id, title, description, imagePath, featured, genre: {name: genreName, description: genreDescription},
    director: {name: directorName, bio: directorBio, birth: directorBirth, death: directorDeath}
  }
}

//Home page
app.get("/", (req, res) => {
  res.send("Version 2");
});

//----------------------MOVIES-----------------------------

// Return all movies
app.get(
  "/movies",
  passport.authenticate('jwt', { session: false}), 
  (req, res) => {
    Movies.find()
      .then(movies => {
        res.json(movies.map(normalizeMovie));
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err.message + err.stack);
      });
  }
);

// Returns data about a single movie by title
app.get(
  "/movies/:Title",
  passport.authenticate('jwt', { session: false}), 
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then(movie => {
        // res.json(movie);
        res.json(normalizeMovie(movie));
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Returns data about a specific genre by genre name
app.get(
  "/movies/genre/:Name",
  passport.authenticate('jwt', { session: false}), 
  (req, res) => {
    Movies.find({ "Genre.Name": req.params.Name })
      .then(movie => {
        // res.json(movie.Genre.Name + ", " + movie.Genre.Description);
        res.json(normalizeMovie(movie));
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Returns data about a specific director by genre name
app.get(
  "/movies/director/:Name",
  passport.authenticate('jwt', { session: false}), 
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then(movie => {
        res.json({
          Name: movie.Director.Name,
          Bio: movie.Director.Bio,
          Birth: movie.Director.Birth,
          Death: movie.Director.Death
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// -------------------------USERS-------------------------------------

// GET all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then(users => {
        // res.status(200).json(users);
        res.json(normalizeUser(user));
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        res.json(normalizeUser(user));
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });     
  }
);

//Allow user to register
app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ Username: req.body.username }) // Search to see if a user with the requested username already exists
      .then(user => {

        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.username + "already exists");
        } else {
          Users.create({
            Username: req.body.username,
            Password: hashedPassword,
            Email: req.body.email,
            Birthday: req.body.birthday
          })
            .then(user => {
              res.json(normalizeUser(user));
            })
            .catch(error => {
              console.error(error);
              res.sendStatus(500).send("Error: " + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Updates a users info by username
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  // [
  //   check("Username", "Username is required").isLength({ min: 5 }),
  //   check(
  //     "Username",
  //     "Username contains non alphanumeric characters - not allowed,"
  //   ).isAlphanumeric(),
  //   check("Password", "Password is required")
  //     .not()
  //     .isEmpty(),
  //   check("Email", "Email does not seem to be valid.").isEmail()
  // ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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
          // res.json(updatedUser);
          res.json(normalizeUser(updatedUser));
        }
      }
    );
  }
);

//Add a movie to a users list of favourites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
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
          res.json(normalizeUser(updatedUser)); //Why problematic? 
        }
      }
    );
  }
);

//Remove a movie from a users list of favourites
app.delete(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
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
          // res.json(updatedUser);
          res.json(normalizeUser(updatedUser));
        }
      }
    );
  }
);

// Delete a user by username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.json(normalizeUser(user));
          // res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// -------------------------------------------------------------------

//Logs every time you load a page
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Your app is listening on port " + port);
});

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
