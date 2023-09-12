const AddReply = require("../../Domains/comments/entities/AddReply");


class AddReplyUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getById(useCasePayload.threadId);
    const addReply = new AddReply(useCasePayload);
    return this._commentRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
