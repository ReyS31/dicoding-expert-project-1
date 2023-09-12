const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteReply = require("../../../Domains/comments/entities/DeleteReply");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");

describe("DeleteReplyUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      replyId: "reply-123",
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addDeleteUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.deleteReply).toBeCalledWith(
      new DeleteReply({
        replyId: useCasePayload.replyId,
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      })
    );
  });
});
