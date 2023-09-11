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

  async findById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentsByThreadId({ threadId = "thread-123" }) {
    const query = {
      text: "SELECT * FROM comments WHERE thread_id = $1",
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findRepliesByThreadIdAndCommentId({
    threadId = "thread-123",
    commentId = "comment-123",
  }) {
    const query = {
      text: "SELECT * FROM comments WHERE thread_id = $1 AND comment_id = $2",
      values: [threadId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteComment({
    id = "comment-123",
    threadId = "thread-123",
    owner = "user-123",
  }) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 AND thread_id = $2 AND owner = $3",
      values: [id, threadId, owner],
    };

    await pool.query(query);
  },

  async deleteReply({
    id = "reply-123",
    commentId = "comment-123",
    threadId = "thread-123",
    owner = "user-123",
  }) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 AND thread_id = $2 AND comment_id = $3 AND owner = $4",
      values: [id, threadId, commentId, owner],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;
