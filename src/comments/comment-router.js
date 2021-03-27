const express = require('express')
const CommentService = require('./comment-service')

const commentRouter = express.Router()
const jsonParser = express.json()

commentRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CommentService.getAllComments(knexInstance)
      .then(comments => {
        res.json(comments)
      })
      .catch(next)
  })


module.exports = commentRouter