const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    return this._threadRepository.addThread(useCasePayload);
  }

  _validatePayload = (payload) => {
    AddThread(payload);
  };
}

module.exports = AddThreadUseCase;
