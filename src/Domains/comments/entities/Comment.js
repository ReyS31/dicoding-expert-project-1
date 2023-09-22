/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.is_delete
      ? '**komentar telah dihapus**'
      : payload.content;
    this.date = payload.date;
    this.likeCount = payload.like_count;
    this.replies = [];
  }

  _verifyPayload(payload) {
    const {
      id, username, content, date, is_delete, like_count,
    } = payload;

    if (
      !id
      || !username
      || !content
      || !date
      || is_delete === undefined
      || like_count === undefined
    ) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      // eslint-disable-next-line camelcase
      || typeof is_delete !== 'boolean'
      || typeof like_count !== 'number'
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
