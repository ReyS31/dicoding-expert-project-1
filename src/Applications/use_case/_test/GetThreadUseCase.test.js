const CommentRepository = require("../../../Domains/comments/CommentRepository");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const Thread = require("../../../Domains/threads/entities/Thread");
const GetThreadUseCase = require("../GetThreadUseCase");

describe("GetThreadUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = "thread-123";
    const date = new Date().toISOString();

    const mockThread = new Thread({
      id: "thread-123",
      title: "title",
      body: "body",
      date: date,
      username: "udin",
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // mocking fetchReplies with empty array
    // because mockCommentRepository.getByThreadId returning empty array
    getThreadUseCase.fetchReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    // Action
    const threads = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(threads).toStrictEqual({
      id: "thread-123",
      title: "title",
      body: "body",
      date: date,
      username: "udin",
      comments: [],
    });

    expect(mockThreadRepository.getById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getByThreadId).toBeCalledWith(useCasePayload);
    expect(getThreadUseCase.fetchReplies).toBeCalledWith([]);
  });
});
