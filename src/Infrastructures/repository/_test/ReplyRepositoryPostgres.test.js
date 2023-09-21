const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ReplyRepository postgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should add reply to database', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        content: 'wleowleowleo',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepository.addReply(payload);

      // Assert
      const replies = await RepliesTableTestHelper.findById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].comment_id).toBe(payload.commentId);
      expect(replies[0].content).toBe(payload.content);
      expect(replies[0].owner).toBe(payload.owner);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        content: 'wleowleowleo',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';

      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepository.addReply(payload);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'wleowleowleo',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteReply function', () => {
    it('should throw AuthoziationError if wrong reply owner', async () => {
      // Arrange
      const forbiddenUser = { id: 'user-456', username: 'bocil_hengker' };
      await UsersTableTestHelper.addUser(forbiddenUser);

      const payload = {
        replyId: 'reply-123',
        commentId: 'comment-123',
        owner: forbiddenUser.id,
      };

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(replyRepository.deleteReply(payload)).rejects.toThrow(
        InvariantError,
      );

      // Clean up
      await UsersTableTestHelper.deleteUser(forbiddenUser.id);
    });

    it('should soft delete reply successfully', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action
      await replyRepository.deleteReply(payload);

      // Assert
      const replies = await RepliesTableTestHelper.findById(payload.replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe(payload.replyId);
      expect(replies[0].comment_id).toBe(payload.commentId);
      expect(replies[0].content).toBe('dicoding');
      expect(replies[0].owner).toBe(payload.owner);
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError if comment not exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      await expect(
        replyRepository.verifyReplyExists('reply-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if reply exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(
        replyRepository.verifyReplyExists('reply-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if not owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner('reply-123', 'user-321'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if true owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getByCommentsId function', () => {
    it('should get 0 reply', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const data = await replyRepository.getByCommentIds(['comment-123']);

      // Assert
      expect(data).toHaveLength(0);
    });

    it('should get 1 reply', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});

      // Action
      const data = await replyRepository.getByCommentIds(['comment-123']);

      // Assert
      expect(data).toHaveLength(1);
      expect(data[0].content).toBe('dicoding');
      expect(data[0].id).toBe('reply-123');
    });

    it('should get 2 replies', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await RepliesTableTestHelper.addReply({});
      await RepliesTableTestHelper.addReply({ id: 'reply-234' });

      // Action
      const data = await replyRepository.getByCommentIds(['comment-123']);

      // Assert
      expect(data).toHaveLength(2);
      expect(data[0].content).toBe('dicoding');
      expect(data[1].content).toBe('dicoding');
    });
  });
});
