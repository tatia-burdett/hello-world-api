const express = require('express')
const CommentService = require('./comment-service')

const commentRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
  id: comment.id,
  nickname: comment.nickname,
  user_location: comment.user_location,
  date_posted: comment.date_posted,
  content: comment.content
})

commentRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CommentService.getAllComments(knexInstance)
      .then(comments => {
        res.json(comments.map(serializeComment))
      })
      .catch(next)
  })

commentRouter
  .route('/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    CommentService.getById(
      knexInstance,
      req.params.id
    )
      .then(comment => {
        if (!comment) {
          return res.status(404).json({
            error: { message: `Comment doesn't exist` }
          })
        }
        res.comment = comment
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeComment(res.comment))
  })


module.exports = commentRouter