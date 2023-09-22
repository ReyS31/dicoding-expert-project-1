class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExists(useCasePayload.commentId);

    if (await this._likeRepository.verifyIsLikeExists(useCasePayload)) {
      await this._unlikeComment(useCasePayload);
      return;
    }
    await this._likeComment(useCasePayload);
  }

  async _likeComment(payload) {
    await this._likeRepository.likeComment(payload);
    await this._commentRepository.addLike(payload.commentId);
  }

  async _unlikeComment(payload) {
    await this._likeRepository.unlikeComment(payload);
    await this._commentRepository.removeLike(payload.commentId);
  }

  // eslint-disable-next-line class-methods-use-this
  _validatePayload(payload) {
    const { threadId, userId, commentId } = payload;
    if (!threadId || !userId || !commentId) {
      throw new Error('LIKE_COMMENT_USE_CASE.DATA_MISMATCH');
    }

    if (
      typeof threadId !== 'string'
      || typeof userId !== 'string'
      || typeof commentId !== 'string'
    ) {
      throw new Error(
        'LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = LikeCommentUseCase;
