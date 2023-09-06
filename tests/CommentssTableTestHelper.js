/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
  async addComment({
    id = "comment-123",
    thread_id = "thread-123",
    content = "dicoding",
    owner = "user-123",
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO comments(id, thread_id, content, owner, date) VALUES($1, $2, $3, $4, $5)",
      values: [id, thread_id, content, owner, date],
    };

    await pool.query(query);
  },

  async addReply({
    id = "reply-123",
    thread_id = "thread-123",
    comment_id = "comment-123",
    content = "dicoding",
    owner = "user-123",
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO comments(id, thread_id, comment_id, content, owner, date) VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, thread_id, comment_id, content, owner, date],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findReplies({ thread_id = "thread-123", comment_id = "comment-123" }) {
    const query = {
      text: "SELECT * FROM comments WHERE thread_id = $1 AND comment_id = $2",
      values: [thread_id, comment_id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1",
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM Comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;
