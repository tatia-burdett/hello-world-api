const CommentService = {
  getAllComments(knex) {
    return knex.select('*').from('hello_comment')
  },
  getById(knex, id) {
    return knex
      .from('hello_comment')
      .select('*')
      .where('id', id)
      .first()
  }
}

module.exports = CommentService