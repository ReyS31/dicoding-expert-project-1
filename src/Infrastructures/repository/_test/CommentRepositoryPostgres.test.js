const { nanoid } = require('nanoid');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('CommentRepository postgres', () => {
  let replyRepository;

  beforeAll(async () => {
    const fakeIdGenerator = () => '123';
    replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment to database', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        content: 'dicoding',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      // Action
      await commentRepository.addComment(payload);

      // Assert
      const comments = await CommentsTableTestHelper.findById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].thread_id).toBe(payload.threadId);
      expect(comments[0].content).toBe(payload.content);
      expect(comments[0].owner).toBe(payload.owner);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'wleowleowleo',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      // Action
      const addedComment = await commentRepository.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'wleowleowleo',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteComment function', () => {
    it('should throw AuthoziationError if wrong comment owner', async () => {
      // Arrange
      const forbiddenUser = { id: 'user-456', username: 'bocil_hengker' };

      const payload = {
        threadId: 'thread-123',
        owner: forbiddenUser.id,
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await UsersTableTestHelper.addUser(forbiddenUser);
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepository.deleteComment(payload)).rejects.toThrow(
        InvariantError,
      );

      // Clean up
      await UsersTableTestHelper.deleteUser(forbiddenUser.id);
    });

    it('should soft delete comment successfully', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await CommentsTableTestHelper.addComment({});

      // Action
      await commentRepository.deleteComment(payload);

      // Assert
      const comments = await CommentsTableTestHelper.findById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe(payload.commentId);
      expect(comments[0].thread_id).toBe(payload.threadId);
      expect(comments[0].content).toBe('dicoding');
      expect(comments[0].owner).toBe(payload.owner);
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError if comment not exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists('comment-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists('comment-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if not owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner('comment-123', 'user-345'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if true owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getByThreadId function', () => {
    function verifyComments(comments, payload) {
      comments.forEach((comment) => {
        expect(comment.id).toBeDefined();
        expect(comment.content).toBe(payload.content);
        expect(comment.date).toBeDefined();
        expect(comment.username).toBe('dicoding');
        expect(comment.is_delete).toBe(false);
      });
    }

    it('should get 0 comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      // Action
      const data = await commentRepository.getByThreadId('thread-123');

      // Assert
      expect(data).toHaveLength(0);
    });

    it('should get 1 comment', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        content: 'wleowleowleo',
        owner: 'user-123',
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await commentRepository.addComment(addComment);

      // Action
      const data = await commentRepository.getByThreadId('thread-123');

      // Assert
      expect(data).toHaveLength(1);
      verifyComments(data, payload);
    });

    it('should get 2 comments', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        content: 'wleowleowleo',
        owner: 'user-123',
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => nanoid(3);
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepository,
      );

      await commentRepository.addComment(addComment);
      await commentRepository.addComment(addComment);

      // Action
      const data = await commentRepository.getByThreadId('thread-123');

      // Assert
      expect(data).toHaveLength(2);
      verifyComments(data, payload);
    });
  });
});
