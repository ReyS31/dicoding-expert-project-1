const DeleteComment = require("../../Domains/comments/entities/DeleteComment");


class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getById(useCasePayload.threadId);
    const deleteComment = new DeleteComment(useCasePayload);
    return this._commentRepository.deleteComment(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
