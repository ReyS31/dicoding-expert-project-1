const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);
    await this._threadRepository.verifyThreadExists(deleteComment.threadId);
    await this._commentRepository.verifyCommentExists(deleteComment.commentId);
    await this._commentRepository.verifyCommentOwner(
      deleteComment.commentId,
      deleteComment.owner,
    );
    return this._commentRepository.deleteComment(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
