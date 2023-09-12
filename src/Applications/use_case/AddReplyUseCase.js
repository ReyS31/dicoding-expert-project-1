const AddReply = require("../../Domains/comments/entities/AddReply");

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.getById(useCasePayload.threadId);
    return await this._commentRepository.addReply(useCasePayload);
  }

  _validatePayload = (payload) => {
    new AddReply(payload);
  };
}

module.exports = AddReplyUseCase;
