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
  },
  insertComment(knex, newComment) {
    return knex
      .insert(newComment)
      .into('hello_comment')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteComment(knex, id) {
    return knex('hello_comment')
      .where({ id })
      .delete()
  }
}

module.exports = CommentService