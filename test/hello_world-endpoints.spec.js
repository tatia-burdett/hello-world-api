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

    context('Given there are comments in the db', () => {
      const testComments = makeCommentArray()

      beforeEach('insert comment', () => {
        return db
          .into('hello_comment')
          .insert(testComments)
      })

      it('responds with 200 and all of the comments', () => {
        return supertest(app)
          .get('/api/comment')
          .expect(200, testComments)
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

  describe('POST /api/comment', () => { // POST /api/comment endpoint
    
    it('creates a comment, returning 201 and the new comment', () => {
      const newComment = {
        nickname: 'Test New Name',
        user_location: 'Testville, TX',
        content: 'Test new content...'
      }
      return supertest(app)
        .post('/api/comment')
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body.nickname).to.eql(newComment.nickname)
          expect(res.body.user_location).to.eql(newComment.user_location)
          expect(res.body.content).to.eql(newComment.content)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/comment/${res.body.id}`)
          const expected = new Intl.DateTimeFormat('en-US').format(new Date())
          const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_posted))
          expect(actual).to.eql(expected)
        })
        .then(res => {
          supertest(app)
            .get(`/api/comment/${res.body.id}`)
            .expect(res.body)
        })
    })

    const requiredFields = ['nickname', 'content']

    requiredFields.forEach(field => {
      const newComment = {
        nickname: 'Test nickname',
        content: 'Test content'
      }

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comment')
          .send(newComment)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          })
      })
    })
  })

  describe('DELETE /api/comment/:id', () => { // DELETE /api/comment/:id endpoint
    
    context(`Given comment with id doesn't exist in database`, () => {
      it('responds with 404', () => {
        const folderId = 123456
        return supertest(app) 
          .delete(`/api/comment/${folderId}`)
          .expect(404, {
            error: { message: `Comment doesn't exist`}
          })
      })
    })

    context('Given comment with id exists in database', () => {
      const testComments = makeCommentArray()

      beforeEach('insert comment', () => {
        return db
          .into('hello_comment')
          .insert(testComments)
      })

      it('Responds with 204 and then removes the comment', () => {
        const idToRemove = 2
        const expectedComment = testComments.filter(comment => comment.id !== idToRemove)
        return supertest(app)
          .delete(`/api/comment/${idToRemove}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get('/api/comment')
              .expect(expectedComment)
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