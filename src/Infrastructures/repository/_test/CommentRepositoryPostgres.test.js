const InvariantError = require("../../../Commons/exceptions/InvariantError");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const AddReply = require("../../../Domains/comments/entities/AddReply");
const AddedReply = require("../../../Domains/comments/entities/AddedReply");
const DeleteComment = require("../../../Domains/comments/entities/DeleteComment");
const DeleteReply = require("../../../Domains/comments/entities/DeleteReply");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const { nanoid } = require("nanoid");

describe("CommentRepository postgres", () => {
  beforeAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
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

  describe("addComment function", () => {
    it("should add comment to database", async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepository.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findById("comment-123");
      expect(comments).toHaveLength(1);
      expect(comments[0].thread_id).toBe(addComment.threadId);
      expect(comments[0].content).toBe(addComment.content);
      expect(comments[0].owner).toBe(addComment.owner);
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepository.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "wleowleowleo",
          owner: "user-123",
        })
      );
    });
  });

  describe("addReply function", () => {
    it("should throw InvariantError if comment not exists", async () => {
      // Arrange
      const addReply = new AddReply({
        threadId: "thread-123",
        commentId: "comment-123",
        content: "wleowleowleo",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(commentRepository.addReply(addReply)).rejects.toThrow(
        InvariantError
      );
    });

    it("should add reply to database", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        commentId: "comment-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const addReply = new AddReply({
        threadId: payload.threadId,
        commentId: payload.commentId,
        content: payload.content,
        owner: payload.owner,
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action
      await commentRepository.addReply(addReply);

      // Assert
      const replies = await CommentsTableTestHelper.findById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].thread_id).toBe(payload.threadId);
      expect(replies[0].comment_id).toBe(payload.commentId);
      expect(replies[0].content).toBe(payload.content);
      expect(replies[0].owner).toBe(payload.owner);
    });

    it("should return added reply correctly", async () => {
      // Arrange
      const payload = {
        commentId: "comment-123",
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const addReply = new AddReply({
        threadId: payload.threadId,
        commentId: payload.commentId,
        content: payload.content,
        owner: payload.owner,
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action
      const addedReply = await commentRepository.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: "wleowleowleo",
          owner: "user-123",
        })
      );
    });
  });

  describe("deleteComment function", () => {
    it("should throw InvariantError if comment not exists", async () => {
      // Arrange
      const deleteComment = new DeleteComment({
        commentId: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.deleteComment(deleteComment)
      ).rejects.toThrow(InvariantError);
    });

    it("should throw AuthoziationError if wrong comment owner", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
        commentId: "comment-123",
      };
      const forbiddenUser = { id: "user-456", username: "bocil_hengker" };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.commentId,
        owner: payload.owner,
      });
      const deleteComment = new DeleteComment({
        commentId: payload.commentId,
        threadId: payload.threadId,
        owner: forbiddenUser.id,
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await UsersTableTestHelper.addUser(forbiddenUser);
      await commentRepository.addComment(addComment);

      // Action & Assert
      await expect(
        commentRepository.deleteComment(deleteComment)
      ).rejects.toThrow(AuthorizationError);

      // Clean up
      await UsersTableTestHelper.deleteUser(forbiddenUser.id);
    });

    it("should soft delete comment successfully", async () => {
      // Arrange
      const payload = {
        commentId: "comment-123",
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const deleteComment = new DeleteComment({
        commentId: payload.commentId,
        threadId: payload.threadId,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action
      await commentRepository.deleteComment(deleteComment);

      // Assert
      const comments = await CommentsTableTestHelper.findById("comment-123");
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe(deleteComment.commentId);
      expect(comments[0].thread_id).toBe(addComment.threadId);
      expect(comments[0].content).toBe(addComment.content);
      expect(comments[0].owner).toBe(addComment.owner);
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe("deleteReply function", () => {
    it("should throw InvariantError if comment does not exists", async () => {
      // Arrange
      const deleteReply = new DeleteReply({
        replyId: "reply-123",
        commentId: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.deleteReply(deleteReply)
      ).rejects.toThrowError("comment tidak ditemukan");
    });

    it("should throw InvariantError if reply does not exists", async () => {
      // Arrange
      const payload = {
        commentId: "comment-123",
        replyId: "reply-123",
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const deleteReply = new DeleteReply({
        replyId: payload.replyId,
        commentId: payload.commentId,
        threadId: payload.threadId,
        owner: payload.owner,
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action & Assert
      await expect(
        commentRepository.deleteReply(deleteReply)
      ).rejects.toThrowError("balasan tidak ditemukan");
    });

    it("should throw AuthoziationError if wrong comment owner", async () => {
      // Arrange
      const payload = {
        replyId: "reply-123",
        commentId: "comment-123",
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const forbiddenUser = { id: "user-456", username: "bocil_hengker" };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const addReply = new AddReply({
        commentId: payload.commentId,
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const deleteReply = new DeleteReply({
        replyId: payload.replyId,
        commentId: payload.commentId,
        threadId: payload.threadId,
        owner: forbiddenUser.id,
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await UsersTableTestHelper.addUser(forbiddenUser);
      await commentRepository.addComment(addComment);
      await commentRepository.addReply(addReply);

      // Action & Assert
      await expect(commentRepository.deleteReply(deleteReply)).rejects.toThrow(
        AuthorizationError
      );

      // Clean up
      await UsersTableTestHelper.deleteUser(forbiddenUser.id);
    });

    it("should soft delete comment successfully", async () => {
      // Arrange
      const payload = {
        commentId: "comment-123",
        replyId: "reply-123",
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };

      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const addReply = new AddReply({
        commentId: payload.commentId,
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });
      const deleteReply = new DeleteReply({
        replyId: payload.replyId,
        commentId: payload.commentId,
        threadId: payload.threadId,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);
      await commentRepository.addReply(addReply);

      // Action
      await commentRepository.deleteReply(deleteReply);

      // Assert
      const replies = await CommentsTableTestHelper.findById(payload.replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe(payload.replyId);
      expect(replies[0].thread_id).toBe(payload.threadId);
      expect(replies[0].comment_id).toBe(payload.commentId);
      expect(replies[0].content).toBe(payload.content);
      expect(replies[0].owner).toBe(payload.owner);
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw InvariantError if comment not exists", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists("comment-123")
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError if comment exists", async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists("comment-123")
      ).resolves.not.toThrow(InvariantError);
    });
  });

  describe("getByThreadId function", () => {
    it("should get 0 comment", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(0);
    });

    it("should get 1 comment", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(1);
      expect(data[0].content).toBe(payload.content);
      expect(data[0].id).toBe("comment-123");
    });

    it("should get 2 comments", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => nanoid(3);
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.addComment(addComment);
      await commentRepository.addComment(addComment);

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(2);
      expect(data[0].content).toBe(payload.content);
      expect(data[1].content).toBe(payload.content);
    });

    it("should get 1 comment with 2 replies", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => nanoid(3);
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepository.addComment(addComment);
      const addReply = new AddReply({
        threadId: payload.threadId,
        commentId: addedComment.id,
        content: payload.content,
        owner: payload.owner,
      });

      await commentRepository.addReply(addReply);
      await commentRepository.addReply(addReply);

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(1);
      expect(data[0].content).toBe(payload.content);
      expect(data[0].replies).toHaveLength(2);
      expect(data[0].replies[0].content).toBe(payload.content);
      expect(data[0].replies[1].content).toBe(payload.content);
    });

    it("should get 2 comments, 1 comment with reply", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => nanoid(3);
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepository.addComment(addComment);
      const addReply = new AddReply({
        threadId: payload.threadId,
        commentId: addedComment.id,
        content: payload.content,
        owner: payload.owner,
      });

      await commentRepository.addReply(addReply);
      await commentRepository.addComment(addComment);

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(2);
      expect(data[0].content).toBe(payload.content);
      expect(data[0].replies).toHaveLength(1);
      expect(data[0].replies[0].content).toBe(payload.content);
      expect(data[1].content).toBe(payload.content);
    });

    it("should get 2 comments, has reply each", async () => {
      // Arrange
      const payload = {
        threadId: "thread-123",
        content: "wleowleowleo",
        owner: "user-123",
      };
      const addComment = new AddComment({
        threadId: payload.threadId,
        content: payload.content,
        owner: payload.owner,
      });

      const fakeIdGenerator = () => nanoid(3);
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Comment 1
      const addedComment = await commentRepository.addComment(addComment);
      const addReply = new AddReply({
        threadId: payload.threadId,
        commentId: addedComment.id,
        content: payload.content,
        owner: payload.owner,
      });

      await commentRepository.addReply(addReply);

      // Comment 2
      const addedCommentTwo = await commentRepository.addComment(addComment);
      const addReplyTwo = new AddReply({
        threadId: payload.threadId,
        commentId: addedCommentTwo.id,
        content: payload.content,
        owner: payload.owner,
      });

      await commentRepository.addReply(addReplyTwo);

      // Action
      const data = await commentRepository.getByThreadId("thread-123");

      // Assert
      expect(data).toHaveLength(2);
      expect(data[0].content).toBe(payload.content);
      expect(data[0].replies).toHaveLength(1);
      expect(data[0].replies[0].content).toBe(payload.content);
      expect(data[1].content).toBe(payload.content);
      expect(data[1].replies).toHaveLength(1);
      expect(data[1].replies[0].content).toBe(payload.content);
    });
  });
});
