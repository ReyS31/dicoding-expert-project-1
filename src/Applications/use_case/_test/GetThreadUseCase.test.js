const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Thread = require('../../../Domains/threads/entities/Thread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly with comment', async () => {
    // Arrange
    const payload = {
      date: new Date().toISOString(),
      username: 'udin',
      content: 'content',
    };
    const useCasePayload = 'thread-123';

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: payload.date,
      username: payload.username,
    });

    const mockComment = {
      id: 'comment-123',
      username: payload.username,
      content: payload.content,
      date: payload.date,
      is_delete: false,
    };

    const mockReply = {
      id: 'reply-123',
      comment_id: 'comment-123',
      username: payload.username,
      content: payload.content,
      date: payload.date,
      is_delete: true,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockComment]));
    mockReplyRepository.getByCommentIds = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockReply]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threads = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(threads).toEqual({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: payload.date,
      username: payload.username,
      comments: [
        {
          id: 'comment-123',
          username: payload.username,
          content: payload.content,
          date: payload.date,
          replies: [
            {
              id: 'reply-123',
              username: payload.username,
              content: '**balasan telah dihapus**',
              date: payload.date,
            },
          ],
        },
      ],
    });

    expect(mockThreadRepository.getById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getByThreadId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.getByCommentIds).toBeCalledWith(['comment-123']);
  });

  it('should orchestrating the get thread action correctly without comment', async () => {
    // Arrange
    const payload = {
      date: new Date().toISOString(),
      username: 'udin',
      content: 'content',
    };
    const useCasePayload = 'thread-123';

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: payload.date,
      username: payload.username,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

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
      replyRepository: mockReplyRepository,
    });

    // mocking fetchReplies with empty array
    // because mockCommentRepository.getByThreadId returning empty array
    getThreadUseCase.fetchReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    // Action
    const threads = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(threads).toEqual({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: payload.date,
      username: payload.username,
      comments: [],
    });

    expect(mockThreadRepository.getById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getByThreadId).toBeCalledWith(useCasePayload);
    expect(getThreadUseCase.fetchReplies).toBeCalledWith([]);
  });
});
