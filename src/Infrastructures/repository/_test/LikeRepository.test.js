const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('LikeRepository postgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('verifyIsLikeExists function', () => {
    it('should return false if like not exists', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const isExists = await likeRepository.verifyIsLikeExists(payload);

      // Assert
      expect(isExists).toBe(false);
    });

    it('should return true if like exists', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await LikesTableTestHelper.addLike({});

      // Action
      const isExists = await likeRepository.verifyIsLikeExists(payload);

      // Assert
      expect(isExists).toBe(true);
    });
  });

  describe('likeComment function', () => {
    it('should throw InvariantError if data is invalid', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-234',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(likeRepository.likeComment(payload)).rejects.toThrow(
        InvariantError,
      );
    });

    it('should not throw InvariantError if data is valid', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(likeRepository.likeComment(payload)).resolves.not.toThrow(
        InvariantError,
      );

      // Assert
      const likes = await LikesTableTestHelper.findById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toBe('like-123');
      expect(likes[0].user_id).toBe('user-123');
      expect(likes[0].comment_id).toBe('comment-123');
    });
  });

  describe('unlikeComment function', () => {
    it('should throw InvariantError if data not match', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(likeRepository.unlikeComment(payload)).rejects.toThrow(
        InvariantError,
      );
    });

    it('should decrease like_count to comment', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await LikesTableTestHelper.addLike({});

      // Action
      await likeRepository.unlikeComment(payload);

      // Assert
      const likes = await LikesTableTestHelper.findById('like-123');
      expect(likes).toHaveLength(0);
    });
  });
});
