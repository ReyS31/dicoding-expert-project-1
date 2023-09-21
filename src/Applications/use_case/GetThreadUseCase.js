const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getById(useCasePayload);

    // #region GetComments
    const commentsRaw = await this._commentRepository.getByThreadId(
      useCasePayload,
    );
    const comments = commentsRaw.map((c) => new Comment(c));
    // #endregion

    // #region GetReplies
    if (comments.length > 0) {
      // get all commentId form comments
      const commentIds = comments.map((c) => c.id);
      const repliesRaw = await this._replyRepository.getByCommentIds(
        commentIds,
      );

      comments.map(
        // eslint-disable-next-line no-return-assign, no-param-reassign
        (c) => (c.replies = repliesRaw
          .filter((r) => r.comment_id === c.id)
          .map((r) => new Reply(r))),
      );
    }
    // #endregion

    return { ...thread, comments };
  }
}

module.exports = GetThreadUseCase;
