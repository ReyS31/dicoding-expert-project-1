const InvariantError = require('../../Commons/exceptions/InvariantError');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeComment(userId, commentId) {
    try {
      const id = `like-${this._idGenerator()}`;
      const date = new Date().toISOString();

      const query = {
        text: 'INSERT INTO user_like_comments VALUES($1,$2,$3,$4)',
        values: [id, userId, commentId, date],
      };

      await this._pool.query(query);
    } catch (_) {
      throw new InvariantError('query error');
    }
  }

  async unlikeComment(userId, commentId) {
    const query = {
      text: 'DELETE FROM user_like_comments WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('query error');
    }
  }

  async verifyIsLikeExists(userId, commentId) {
    const query = {
      text: 'SELECT id FROM user_like_comments WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    }

    return true;
  }
}

module.exports = LikeRepositoryPostgres;
