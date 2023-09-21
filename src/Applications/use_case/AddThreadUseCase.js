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
    // eslint-disable-next-line no-new
    new AddThread(payload);
  };
}

module.exports = AddThreadUseCase;
