const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeCommentArray, makeMaliciousComment } = require('./comment-fixtures')

describe('Hello World Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
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

    context('Given an xss attack comment', () => {
      const { maliciousComment, expectedComment } = makeMaliciousComment()

      beforeEach('insert a malicious comment', () => {
        return db
          .into('hello_comment')
          .insert(maliciousComment)
      })

      it('it removes xss attack content', () => {
        return supertest(app)
          .get('/api/comment')
          .expect(200)
          .expect(res => {
            expect(res.body[0].nickname).to.eql(expectedComment.nickname)
            expect(res.body[0].user_location).to.eql(expectedComment.user_location)
            expect(res.body[0].content).to.eql(expectedComment.content)
          })
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

    context('Given there are comments in the db', () => {
      const testComments = makeCommentArray()

      beforeEach('insert comments', () => {
        return db
          .into('hello_comment')
          .insert(testComments)
      })

      it('responds with 200 and the requested comment', () => {
        const commentId = 2
        const expectedComment = testComments[commentId - 1]
        return supertest(app)
          .get(`/api/comment/${commentId}`)
          .expect(200, expectedComment) 
      })
    })

    context('Given an xss attack comment', () => {
      const { maliciousComment, expectedComment } = makeMaliciousComment()

      beforeEach('insert a malicious comment', () => {
        return db
          .into('hello_comment')
          .insert(maliciousComment)
      })

      it('removes the xss attack content', () => {
        return supertest(app)
          .get(`/api/comment/${maliciousComment.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.nickname).to.eql(expectedComment.nickname)
            expect(res.body.user_location).to.eql(expectedComment.user_location)
            expect(res.body.content).to.eql(expectedComment.content)
          }) 
      })
    })
  })

  describe('POST /api/comment', () => { // POST /api/comment endpoint
    
    it('creates a comment, returning 201 and the new comment', () => {
      const newComment = {
        nickname: 'Test New Name',
        user_location: 'Testville, TX',
        content: 'Test new content...',
        category: 'embrace'
      }
      return supertest(app)
        .post('/api/comment')
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body.nickname).to.eql(newComment.nickname)
          expect(res.body.user_location).to.eql(newComment.user_location)
          expect(res.body.content).to.eql(newComment.content)
          expect(res.body.category).to.eql(newComment.category)
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

    const requiredFields = ['nickname', 'content', 'category']

    requiredFields.forEach(field => {
      const newComment = {
        nickname: 'Test nickname',
        content: 'Test content',
        category: 'release'
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
    
    context(`Given comment with id doesn't exist in db`, () => {
      it('responds with 404', () => {
        const folderId = 123456
        return supertest(app) 
          .delete(`/api/comment/${folderId}`)
          .expect(404, {
            error: { message: `Comment doesn't exist`}
          })
      })
    })

    context('Given comment with id exists in db', () => {
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

  describe('PATCH /api/comment/:id', () => { // PATCH /api/comment/:id endpoint

    context(`Given comment with id doens't exist in db`, () => {
      it('responds with 404', () => {
        const commentId = 123456
        return supertest(app)
          .patch(`/api/comment/${commentId}`)
          .expect(404, {
            error: { message: `Comment doesn't exist` }
          })
      })
    })

    context('Given comment with id exists in db', () => {
      const testComments = makeCommentArray()
      
      beforeEach('insert comment', () => {
        return db
          .into('hello_comment')
          .insert(testComments)
      })

      it('responds with 204 and updates the comment', () => {
        const idToUpdate = 2
        const updateComment = {
          nickname: 'Test New Nickname',
          user_location: 'Newville, NM',
          content: 'New content... ',
          category: 'rejoice'
        }
        const expectedComment = {
          ...testComments[idToUpdate - 1],
          ...updateComment
        }
        return supertest(app)
          .patch(`/api/comment/${idToUpdate}`)
          .send(updateComment)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/comment/${idToUpdate}`)
              .expect(expectedComment)
          })
      })

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/comment/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body must include 'nickname', 'user_location', 'content', or 'category'`}
          })
      })

      it('responds with 204 when updates only a subset of fields', () => {
        const idToUpdate = 2
        const updateComment = {
          nickname: 'New Nickname'
        }
        const expectedComment = {
          ...testComments[idToUpdate - 1],
          ...updateComment
        }
        return supertest(app)
          .patch(`/api/comment/${idToUpdate}`)
          .send(updateComment)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/comment/${idToUpdate}`)
              .expect(expectedComment)
          })
      })
    })
  })
})