const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw Error DATA_MISMATCH', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload)).rejects.toThrow(
      new Error('LIKE_COMMENT_USE_CASE.DATA_MISMATCH'),
    );
  });

  it('should throw Error PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 1,
      commentId: 2,
      userId: 1,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload)).rejects.toThrow(
      new Error('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'),
    );
  });

  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.removeLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyIsLikeExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );

    /* #region  mockCommentRepository */
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.addLike).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.addLike).toBeCalledTimes(1);
    expect(mockCommentRepository.removeLike).toBeCalledTimes(0);
    /* #endregion */

    /* #region  mockLikeRepository */
    expect(mockLikeRepository.verifyIsLikeExists).toBeCalledWith(
      useCasePayload,
    );
    expect(mockLikeRepository.likeComment).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.likeComment).toBeCalledTimes(1);
    expect(mockLikeRepository.unlikeComment).toBeCalledTimes(0);
    /* #endregion */
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.removeLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyIsLikeExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.likeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );

    /* #region  mockCommentRepository */
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.addLike).toBeCalledTimes(0);
    expect(mockCommentRepository.removeLike).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.removeLike).toBeCalledTimes(1);
    /* #endregion */

    /* #region  mockLikeRepository */
    expect(mockLikeRepository.verifyIsLikeExists).toBeCalledWith(
      useCasePayload,
    );
    expect(mockLikeRepository.likeComment).toBeCalledTimes(0);
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.unlikeComment).toBeCalledTimes(1);
    /* #endregion */
  });
});
