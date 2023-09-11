const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const InvariantError = require("../../Commons/exceptions/InvariantError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const AddedReply = require("../../Domains/comments/entities/AddedReply");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { threadId, content, owner } = addComment;
    const date = new Date().toISOString();

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments(id, thread_id, content, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, threadId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async addReply(addReply) {
    const { threadId, commentId, content, owner } = addReply;
    await this.verifyCommentExists(commentId);

    const date = new Date().toISOString();

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments(id, thread_id, comment_id, content, owner, date) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, threadId, commentId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getByThreadId(threadId) {}

  async deleteComment(deleteComment) {
    const { commentId, threadId, owner } = deleteComment;
    await this.verifyCommentExists(commentId);

    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 AND thread_id = $2 AND owner = $3",
      values: [commentId, threadId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("ga boleh");
    }
  }

  async deleteReply(deleteReply) {
    const { replyId, commentId, threadId, owner } = deleteReply;
    await this.verifyCommentExists(commentId);
    await this.verifyCommentExists(replyId, true);
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 AND thread_id = $2 AND comment_id = $3 AND owner = $4",
      values: [replyId, threadId, commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("ga boleh");
    }
  }

  async verifyCommentExists(id, isReply = false) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        isReply ? "balasan tidak ditemukan" : "comment tidak ditemukan"
      );
    }
  }
}

module.exports = CommentRepositoryPostgres;
