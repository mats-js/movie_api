const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie,
  Users = Models.User;

app.use(bodyParser.json());
app.use(morgan('common'));

// Import and use CORS but allow all domains to make requests
const cors = require('cors');
app.use(express.static('public'));
app.use(cors());

// Import and use Passport
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

/* mongoose.connect('mongodb://localhost:27017/myFlixDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}); */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Welcome message
/**
 * GET welcome message from '/' endpoint
 * @name welcomeMessage
 * @kind function
 * @returns Welcome message
 */

app.get('/', (req, res) => {
  res.send('Welcome to my Movie API!');
});

// CREATE new user
/**
 * POST new user. Username, password, and Email are required fields.
 * Request body: Bearer token, JSON with user information in this format:
 * {
 *  ID: Integer,
 *  Username: String,
 *  Password: String,
 *  Email: String,
 *  Birthday: Date
 * }
 * @name createUser
 * @kind function
 * @returns user object
 */

app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// READ all users (DEPRECATE in the future?)
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ a user by username
/**
 * GET user data on a single user
 * Request body: Bearer token
 * @name getUser
 * @kind function
 * @param Username
 * @returns user object
 * @requires passport
 */

app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// UPDATE user by username
/**
 * PUT new user info
 * Request body: Bearer token, updated user info in the following format:
 * {
 *  Username: String, (required)
 *  Password: String, (required)
 *  Email: String, (required)
 *  Birthday: Date
 * }
 * @name updateUser
 * @kind function
 * @param Username
 * @returns user object
 * @requires passport
 */

app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    passport.authenticate('jwt', { session: false }),
  ],
  (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// CREATE favorite movie for a user
/**
 * POST a movie to a user's list of favorites
 * Request body: Bearer token
 * @name createFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */

app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// DELETE favorite movie for a user
/**
 * DELETE a movie from a user's list of favorites
 * Request body: Bearer token
 * @name deleteFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */

app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// DELETE user by username
/**
 * DELETE a user by username
 * Request body: Bearer token
 * @name deleteUser
 * @kind function
 * @param Username
 * @returns Success message
 * @requires passport
 */

app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ all movies
/**
 * GET a list of all movies
 * Request body: Bearer Token
 * @name getAllMovies
 * @kind function
 * @returns array of movie objects
 * @requires passport
 */

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ one movie by title
/**
 * GET data about a single movie by title
 * Request body: Bearer token
 * @name getMovie
 * @kind function
 * @param Title
 * @returns movie object
 * @requires passport
 */

app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ genre by name
/**
 * GET data about a genre by genre name
 * Request body: Bearer token
 * @name getGenre
 * @kind function
 * @param genreName
 * @returns genre object
 * @requires passport
 */

app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ director by name
/**
 * GET data about a director by name
 * Request body: Bearer token
 * @name getDirector
 * @kind function
 * @param directorName
 * @returns director object
 * @requires passport
 */

app.get(
  '/movies/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Error handler
 * @name errorHandler
 * @kind function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error was encountered!');
});

/**
 * Request listener
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
