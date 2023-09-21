const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExists(useCasePayload.commentId);
    await this._commentRepository.verifyCommentOwner(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    return this._commentRepository.deleteComment(useCasePayload);
  }

  _validatePayload = (payload) => {
    DeleteComment(payload);
  };
}

module.exports = DeleteCommentUseCase;
