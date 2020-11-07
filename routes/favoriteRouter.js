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
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      'GET operation not supported on /favorites/' + req.params.campsiteId
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (favorite.campsites.includes(req.params.campsiteId)) {
            console.log('Already in Favorites', req.params.campsiteId);
            res.end('This campsite already exists in Favorites');
          } else {
            console.log('Need to add this one', req.params.campsiteId);
            favorite.campsites.push(req.params.campsiteId);
          }

          favorite.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        } else {
          console.log('Add new Favorite');

          const newFavorite = {
            user: req.user._id,
            campsites: [req.params.campsiteId],
          };

          Favorite.create(newFavorite).then((favorite) => {
            console.log('Favorite created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      'PUT operation not supported on /favorites/' + req.params.campsiteId
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          const newCampsites = favorite.campsites.filter((campsite) => {
            campsite !== req.params.campsiteId;
          });

          favorite.campsites = newCampsites;

          favorite.save().then((favorite) => {
            console.log('Favorite deleted (updated) ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        } else {
          console.log('No favorites to delete');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('There are no favorites to delete');
        }
      })
      .catch((err) => next(err));
  });
