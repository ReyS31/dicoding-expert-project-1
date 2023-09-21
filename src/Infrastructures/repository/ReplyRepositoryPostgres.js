const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const InvariantError = require('../../Commons/exceptions/InvariantError');

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
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, content, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(deleteReply) {
    const { replyId, commentId, owner } = deleteReply;
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1 AND comment_id = $2 AND owner = $3',
      values: [replyId, commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('query error');
    }
  }

  async getByCommentIds(commentIds) {
    const params = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= commentIds.length; i++) {
      params.push(`$${i}`);
    }

    const query = {
      text: `SELECT rpl.id, rpl.comment_id, rpl.content, rpl.date, usr.username, rpl.is_delete 
      FROM replies as rpl JOIN users as usr ON rpl.owner = usr.id 
      WHERE rpl.comment_id IN (${params.join(',')}) ORDER BY rpl.date ASC`,
      values: commentIds,
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyReplyExists(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('ga boleh');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
