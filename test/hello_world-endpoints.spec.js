const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeCommentArray } = require('./comment-fixtures')

describe('Hello World Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('hello_comment').truncate())

  afterEach('cleanup', () => db('hello_comment').truncate())

  describe('GET /api/comment', () => { // GET /api/comment endpoint

    context('Given there are no comments in the db', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/comment')
          .expect(200, [])
      })
    })
  })
 
  describe('GET /api/comment/:id', () => { // GET /api/comment/:id endpoint

    context('Given there are no comments in the db', () => {
      it('responds with 404', () => {
        const commentId = 123456
        return supertest(app)
          .get(`/api/comment/${commentId}`)
          .expect(404, {
            error: { message: `Comment doesn't exist`}
          })
      })
    })
  })
})

// NEED TO:
// create a test database, migrate table to test. Do I seed test db? Finish writing test up till the get endpoint... ensure testing and get work well. 
// Write one endpoint and one test at a time, testing along the way
// Consider adding a color column to table... to create a color for each comment / note 
// REMEMBER: YOU ARE WORKING ON A BRANCH! MUST MERGE EVENTUALLY!