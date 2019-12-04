const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')
const BookmarksService = require('../src/bookmarks-service')

describe(`Bookmarks service object`, function () {
    let db

    let testBookmarks = [
        {
            id: 1,
            title: 'Test title 1',
            url: 'Test url 1',
            description: 'Test description 1.',
            rating: '4'
        },
        {
            id: 2,
            title: 'Test title 2',
            url: 'Test url 2',
            description: 'Test description 2.',
            rating: '5'
        },
        {
            id: 3,
            title: 'Test title 3',
            url: 'Test url 3',
            description: 'Test description 3.',
            rating: '3'
        },
        {
            id: 4,
            title: 'Test title 4',
            url: 'Test url 4',
            description: 'Test description 4.',
            rating: '2'
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    //const testBookmarks = makeBookmarksArray;

    context(`Given 'bookmarks' has data`, () => {
        beforeEach(() => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })

        it(`getAllBookmarks() resolves all bookmarks from 'bookmarks' table`, () => {
            //test that BookmarksService.getAllBookmarks gets data from table
            return BookmarksService.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql(testBookmarks)
                })
        })

        it(`getById() resolves a bookmark by id from 'bookmarks' table`, () => {
            const thirdId = 3
            const thirdTestBookmark = testBookmarks[thirdId - 1]
            return BookmarksService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        title: thirdTestBookmark.title,
                        url: thirdTestBookmark.url,
                        description: thirdTestBookmark.description,
                        rating: thirdTestBookmark.rating,
                    })
                })
        })

        it(`deleteBookmark() removes a bookmark by id from 'bookmarks' table`, () => {
            const bookmarkId = 3
            return BookmarksService.deleteBookmark(db, bookmarkId)
                .then(() => BookmarksService.getAllBookmarks(db))
                .then(allBookmarks => {
                    const expected = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
                    expect(allBookmarks).to.eql(expected)
                })
        })
        it(`updateBookmark() updates a bookmark from the 'bookmarks' table`, () => {
            const idOfBookmarkToUpdate = 3
            const newBookmarkData = {
                title: 'updated title',
                url: 'updated url',
                description: 'updated description',
                rating: '3'
            }
            return BookmarksService.updateBookmark(db, idOfBookmarkToUpdate, newBookmarkData)
                .then(() => BookmarksService.getById(db, idOfBookmarkToUpdate))
                .then(bookmark => {
                    expect(bookmark).to.eql({
                        id: idOfBookmarkToUpdate,
                        ...newBookmarkData
                    })
                })
        })
    })

    context(`Given 'bookmarks' has no data`, () => {
        it(`getAllBookmarks() resolves an empty array`, () => {
            return BookmarksService.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertBookmark() insets a new bookmark and resolves the bew bookmark with an 'id'`, () => {
            const newBookmark = {
                title: 'Test new title',
                url: 'Test new url',
                description: 'Test new description',
                rating: '3'
            }
            return BookmarksService.insertBookmark(db, newBookmark)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newBookmark.title,
                        url: newBookmark.url,
                        description: newBookmark.description,
                        rating: newBookmark.rating,
                    })
                })
        })
    })
})