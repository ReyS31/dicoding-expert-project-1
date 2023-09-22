/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addLike({
    id = 'like-123',
    userId = 'user-123',
    commentId = 'comment-123',
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO user_like_comments VALUES($1, $2, $3, $4)',
      // eslint-disable-next-line camelcase
      values: [id, userId, commentId, date],
    };

    await pool.query(query);
  },

  async findById(id) {
    const query = {
      text: 'SELECT * FROM user_like_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM user_like_comments WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async removeLike({
    id = 'like-123',
    userId = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'DELETE user_like_comments WHERE id = $1 AND user_id = $2 AND comment_id = $3',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_like_comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
