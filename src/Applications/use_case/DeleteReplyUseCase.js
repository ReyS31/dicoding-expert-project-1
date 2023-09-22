const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);
    await this._threadRepository.verifyThreadExists(deleteReply.threadId);
    await this._commentRepository.verifyCommentExists(deleteReply.commentId);
    await this._replyRepository.verifyReplyExists(deleteReply.replyId);
    await this._replyRepository.verifyReplyOwner(
      deleteReply.replyId,
      deleteReply.owner,
    );
    return this._replyRepository.deleteReply(deleteReply);
  }
}

module.exports = DeleteReplyUseCase;
