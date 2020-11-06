const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { response } = require('express');

const favoriteRouter = express.Router();

module.exports = favoriteRouter;

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsite')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.campsites.forEach((campsite) => {
            if (favorite.campsites.includes(campsite._id)) {
              console.log('Already in Favorites', campsite._id);
            } else {
              console.log('Need to add this one', campsite._id);
              favorite.campsites.push(campsite._id);
            }
          });
          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        } else {
          console.log('Add new Favorite');
          Favorite.create(req.body).then((favorite) => {
            console.log('Favorite created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }
      })

      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((response) => {
        res.statusCode = 200;
        if (response) {
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {}
  );
