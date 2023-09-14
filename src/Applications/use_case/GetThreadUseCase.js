const Comment = require("../../Domains/comments/entities/Comment");
const Reply = require("../../Domains/replies/entities/Reply");

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getById(useCasePayload);

    //#region GetComments
    const commentsRaw = await this._commentRepository.getByThreadId(
      useCasePayload
    );
    const comments = [];
    for (let index = 0; index < commentsRaw.length; index++) {
      const element = new Comment(commentsRaw[index]);
      comments.push(element);
    }
    //#endregion

    //#region GetReplies
    if (comments.length > 0) {
      // get all commentId form comments
      const commentIds = comments.map((c) => c.id);
      const repliesRaw = await this._replyRepository.getByCommentIds(
        commentIds
      );

      for (let index = 0; index < repliesRaw.length; index++) {
        const element = repliesRaw[index];
        const commentIndex = comments.findIndex(
          (c) => c.id === element.comment_id
        );
        comments[commentIndex].replies.push(new Reply(element));
      }
    }
    //#endregion

    return { ...thread, comments };
  }
}

module.exports = GetThreadUseCase;
