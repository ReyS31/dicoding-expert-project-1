const DeleteReply = require("../../Domains/comments/entities/DeleteReply");


class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getById(useCasePayload.threadId);
    const deleteReply = new DeleteReply(useCasePayload);
    return this._commentRepository.deleteReply(deleteReply);
  }
}

module.exports = DeleteReplyUseCase;
