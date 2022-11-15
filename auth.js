const jwtSecret = 'your_jwt_secret'; // Has to be the same key as in passport.js!

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Local passport file

/**
 * Creates JWT (expiring in 7 days, using HS256 algorithm to encode)
 * @param {object} user
 * @returns user object, jwt, and additional information on token
 * @function generateJWTToken
 */

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username encoded in JWT
    expiresIn: '7d', // Expiration date of token
    algorithm: 'HS256', // Algo used to sign/encode the values of the JWT
  });
};

/* POST login */
/**
 * Handles user login, generating a JWT upon login
 * @name postLogin
 * @kind function
 * @param router
 * @returns user object with JWT
 * @requires passport
 */

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(404).json({
          message: 'User not found or password incorrect',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
