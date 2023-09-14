/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-123",
    comment_id = "comment-123",
    content = "dicoding",
    owner = "user-123",
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5)",
      values: [id, comment_id, content, owner, date],
    };

    await pool.query(query);
  },

  async findById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findByCommentId(commentId = "comment-123") {
    const query = {
      text: "SELECT * FROM replies WHERE comment_id = $1",
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteReply({
    id = "reply-123",
    commentId = "comment-123",
    owner = "user-123",
  }) {
    const query = {
      text: "UPDATE replies SET is_delete = TRUE WHERE id = $1 AND comment_id = $2 AND owner = $3",
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies WHERE 1=1");
  },
};

module.exports = RepliesTableTestHelper;
