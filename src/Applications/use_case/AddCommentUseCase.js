const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    return await this._commentRepository.addComment(useCasePayload);
  }

  _validatePayload = (payload) => {
    new AddComment(payload);
  };
}

module.exports = AddCommentUseCase;
