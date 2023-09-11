class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.is_delete
      ? "**komentar telah dihapus**"
      : payload.content;
    this.date = payload.date;
  }

  _verifyPayload(payload) {
    const { id, username, content, date, is_delete } = payload;

    if (!id || !username || !content || !date || is_delete === undefined) {
      throw new Error("COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      typeof content !== "string" ||
      typeof date !== "string" ||
      typeof is_delete !== "boolean"
    ) {
      throw new Error("COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = Comment;
