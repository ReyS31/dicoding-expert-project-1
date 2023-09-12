const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    console.log(useCasePayload);
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
