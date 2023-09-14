class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const [data, commentsRaw] = await Promise.all([
      this._threadRepository.getById(useCasePayload),
      this._commentRepository.getByThreadId(useCasePayload),
    ]);
    const comments = await this.fetchReplies(commentsRaw);
    return { ...data, comments };
  }

  async fetchReplies(commentsRaw) {
    const comments = [];
    for (let index = 0; index < commentsRaw.length; index++) {
      const element = new Comment(commentsRaw[index]);
      element.replies = await this._replyRepository.getByCommentId(element.id);
      comments.push(element);
    }

    return comments;
  }
}

module.exports = GetThreadUseCase;
