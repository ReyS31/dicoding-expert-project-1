/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class LikeRepository {
  async verifyIsLikeExists(payload) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async likeComment(payload) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async unlikeComment(payload) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeRepository;
