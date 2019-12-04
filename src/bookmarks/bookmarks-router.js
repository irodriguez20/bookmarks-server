const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger");
const store = require("../store");
const knex = require('knex')
const BookmarksService = require('../bookmarks-service')

const bookmarksRouter = express.Router();
const bodyParser = express.json();

// console.log(BookmarksService.getAllBookmarks())

bookmarksRouter
    .route("/bookmarks")
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(store.bookmarks);
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        for (const field of ["title", "url", "description", "rating"]) {
            if (!req.body[field]) {
                logger.error(`${field} is required`);
                return res.status(400).send(`${field} is required`);
            }
        }

        const { title, url, description, rating } = req.body;

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`${rating} is invalid`);
            return res.status(400).send("rating must be between 0 and 5");
        }

        const bookmark = { id: uuid(), title, url, description, rating };

        store.bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${bookmark.id} was created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark);
    });

bookmarksRouter
    .route('/:bookmark_id')
    .get((req, res, next) => {
        const { bookmark_id } = req.params

        BookmarksService.getById(req.app.get('db'), bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${bookmark_id} not found.`)
                    return res
                        .status(404)
                        .send('Bookmark Not Found')
                }
                res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { bookmark_id } = req.params

        const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        store.bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${bookmark_id} deleted.`)
        res
            .status(204)
            .end()
    })
module.exports = bookmarksRouter;
