const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExists(useCasePayload.commentId);
    await this._replyRepository.verifyReplyExists(useCasePayload.replyId);
    await this._replyRepository.verifyReplyOwner(
      useCasePayload.replyId,
      useCasePayload.owner,
    );
    return this._replyRepository.deleteReply(useCasePayload);
  }

  _validatePayload = (payload) => {
    DeleteReply(payload);
  };
}

module.exports = DeleteReplyUseCase;
