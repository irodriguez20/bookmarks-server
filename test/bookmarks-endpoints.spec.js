const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')
const store = require('../src/store')

describe(`Bookmarks Endpoints`, () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`Unauthorized requests`, () => {
        it(`responds with 401 Unauthorized fro GET /bookmarks`, () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
            return supertest(app)
                .post('/bookmarks')
                .send({ title: 'test-title', url: 'http://something.com', rating: '2' })
                .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
            const secondBookmark = store.bookmarks[1]
            return supertest(app)
                .get(`/bookmarks/${secondBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
            const aBookmark = store.bookmarks[1]
            return supertest(app)
                .delete(`/bookmarks/${aBookmark}`)
                .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe('GET /bookmarks', () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })


        context(`Given 'bookmarks' has data`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it(`responds with 200 and all of the bookmarks`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })

        })

        describe(`GET /bookmarks/:id`, () => {
            context(`Given no bookmarks`, () => {
                it(`responds with 404 bookmark doesn't exist`, () => {
                    const bookmarkId = 123456
                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .expect(404, { error: { message: `Bookmark doesn't exist` } })
                })
            })

            context(`Given there are bookmarks in the database`, () => {
                const testBookmarks = makeBookmarksArray()

                beforeEach('insert bookmarks', () => {
                    return db
                        .into('bookmarks')
                        .insert(testBookmarks)
                })

                it('responds with 200 and the specified bookmark', () => {
                    const bookmarkId = 2
                    const expectedBookmark = testBookmarks[bookmarkId - 1]
                    return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200, expectedBookmark)
                })
            })
        })

        describe('DELETE /bookmarks/:id', () => {
            it(`removes the bookmark by id from the store`, () => {
                const secondBookmark = store.bookmarks[1]
                const expectedBookmark = store.bookmarks.filter(s => s.id !== secondBookmark.id)
                return supertest(app)
                    .delete(`/bookmarks/${secondBookmark.id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(() => {
                        expect(store.bookmarks).to.eql(expectedBookmark)
                    })
            })
            it(`returns 404 bookmark doesn't exist`, () => {
                return supertest(app)
                    .delete(`/bookmarks/doesnt-exist`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, 'Bookmark Not Found')
            })
        })

        describe.only(`POST /bookmarks`, () => {
            it(`creates a bookmark, responding with 201 and the new bookmark`, function () {
                const newBookmark = {
                    title: 'test title',
                    url: 'https://test.com',
                    description: 'test description',
                    rating: '2'
                }
                return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(newBookmark.title)
                        expect(res.body.url).to.eql(newBookmark.url)
                        expect(res.body.description).to.eql(newBookmark.description)
                        expect(res.body.rating).to.eql(newBookmark.rating)
                        expect(res.body.id).to.be.a('string')
                    })
                    .then(res => {
                        expect(store.bookmarks[store.bookmarks.length - 1])
                    })
            })
        })

    })
})