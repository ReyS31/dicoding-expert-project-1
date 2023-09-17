const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const Comment = require("../../Domains/comments/entities/Comment");

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
      text: "INSERT INTO comments VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, threadId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async getByThreadId(threadId) {
    const query = {
      text: `SELECT cmt.id, cmt.content, cmt.date, usr.username, cmt.is_delete 
      FROM comments as cmt JOIN users as usr ON cmt.owner = usr.id 
      WHERE cmt.thread_id = $1 ORDER BY cmt.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteComment(deleteComment) {
    const { commentId, threadId, owner } = deleteComment;

    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1 AND thread_id = $2 AND owner = $3",
      values: [commentId, threadId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("query error");
    }
  }

  async verifyCommentExists(id) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment tidak ditemukan");
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND owner = $2",
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("ga boleh");
    }
  }
}

module.exports = CommentRepositoryPostgres;
