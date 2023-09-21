class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.is_delete
      ? '**komentar telah dihapus**'
      : payload.content;
    this.date = payload.date;
    this.replies = [];
  }

  _verifyPayload(payload) {
    const {
      // eslint-disable-next-line camelcase
      id, username, content, date, is_delete,
    } = payload;

    // eslint-disable-next-line camelcase
    if (!id || !username || !content || !date || is_delete === undefined) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      // eslint-disable-next-line camelcase
      || typeof is_delete !== 'boolean'
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
