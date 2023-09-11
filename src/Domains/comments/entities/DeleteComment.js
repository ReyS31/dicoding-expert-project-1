class DeleteComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.commentId = payload.commentId;
    this.threadId = payload.threadId;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { threadId, commentId, owner } = payload;

    if (!threadId || !commentId || !owner) {
      throw new Error("DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof threadId !== "string" ||
      typeof commentId !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = DeleteComment;
