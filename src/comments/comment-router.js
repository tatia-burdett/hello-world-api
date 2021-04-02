const express = require('express')
const path = require('path')
const CommentService = require('./comment-service')
const xss = require('xss')

const commentRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
  id: comment.id,
  nickname: xss(comment.nickname),
  user_location: xss(comment.user_location),
  date_posted: comment.date_posted,
  content: xss(comment.content),
  category: comment.category
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
  .post(jsonParser, (req, res, next) => {
    const { nickname, user_location, content, category } = req.body
    const newComment = { nickname, user_location, content, category }
    const requiredFields = { nickname, content, category }
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        })
      }
    }

    CommentService.insertComment(
      req.app.get('db'),
      newComment
    )
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(serializeComment(comment))
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
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db')
    CommentService.deleteComment(
      knexInstance,
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { nickname, user_location, content, category } = req.body
    const commentToUpdate = { nickname, user_location, content, category }

    const requiredValues = nickname || user_location || content || category
    if (!requiredValues) {
      return res.status(400).json({
        error: { message: `Request body must include 'nickname', 'user_location', 'content', or 'category'` }
      })
    }
    CommentService.updateComment(
      req.app.get('db'),
      req.params.id,
      commentToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = commentRouter