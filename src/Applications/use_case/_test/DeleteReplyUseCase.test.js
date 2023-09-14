const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteReply = require("../../../Domains/replies/entities/DeleteReply");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");

describe("DeleteReplyUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      replyId: "reply-123",
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addDeleteUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockReplyRepository.deleteReply).toBeCalledWith(
      new DeleteReply({
        replyId: useCasePayload.replyId,
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      })
    );
  });
});
