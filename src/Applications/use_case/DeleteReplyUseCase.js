const DeleteReply = require("../../Domains/comments/entities/DeleteReply");

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.getById(useCasePayload.threadId);
    return await this._commentRepository.deleteReply(useCasePayload);
  }

  _validatePayload = (payload) => {
    new DeleteReply(payload);
  };
}

module.exports = DeleteReplyUseCase;
