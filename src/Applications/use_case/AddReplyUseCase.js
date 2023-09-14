const AddReply = require("../../Domains/replies/entities/AddReply");

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.getById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExists(useCasePayload.commentId);
    return await this._replyRepository.addReply(useCasePayload);
  }

  _validatePayload = (payload) => {
    new AddReply(payload);
  };
}

module.exports = AddReplyUseCase;
