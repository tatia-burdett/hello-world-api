const CommentService = {
  getAllComments(knex) {
    return knex.select('*').from
  }
}

module.exports = CommentService