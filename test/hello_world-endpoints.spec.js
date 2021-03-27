const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeCommentArray } = require('./comment-fixtures')

describe('Hello World Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: 'process.env.TEST_DATABASE_URL'
    })
    app.set('db', db)
  })
})