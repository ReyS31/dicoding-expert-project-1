const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const Reply = require("../../Domains/replies/entities/Reply");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { commentId, content, owner } = addReply;

    const date = new Date().toISOString();

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO replies VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, commentId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(deleteReply) {
    const { replyId, commentId, owner } = deleteReply;
    const query = {
      text: "UPDATE replies SET is_delete = TRUE WHERE id = $1 AND comment_id = $2 AND owner = $3",
      values: [replyId, commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("ga boleh");
    }
  }

  async getByCommentId(commentId) {
    const query = {
      text: `SELECT rpl.id, rpl.content, rpl.date, usr.username, rpl.is_delete 
      FROM replies as rpl JOIN users as usr ON rpl.owner = usr.id 
      WHERE rpl.comment_id = $1 ORDER BY rpl.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const data = [];
    for (let index = 0; index < result.rows.length; index++) {
      data.push(new Reply(result.rows[index]));
    }

    return data;
  }

  async verifyReplyExists(id) {
    const query = {
      text: "SELECT id FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }
  }
}

module.exports = ReplyRepositoryPostgres;
