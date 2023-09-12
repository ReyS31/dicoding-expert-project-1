class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const [data, comments] = await Promise.all([
      this._threadRepository.getById(useCasePayload),
      this._commentRepository.getByThreadId(useCasePayload),
    ]);
    return { ...data, comments };
  }
}

module.exports = GetThreadUseCase;
