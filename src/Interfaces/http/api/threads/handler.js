const AuthenticationTokenManager = require("../../../../Applications/security/AuthenticationTokenManager");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");
const AuthenticationError = require("../../../../Commons/exceptions/AuthenticationError");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async getUserIdbyAccessToken(authorization) {
    const _authenticationTokenManager = this._container.getInstance(
      AuthenticationTokenManager.name
    );
    if (authorization === undefined) {
      throw new AuthenticationError("Missing authentication");
    }

    const accessToken = authorization.split(" ")[1];

    const { id } = await _authenticationTokenManager.decodePayload(accessToken);

    return id;
  }

  async postThreadHandler(request, h) {
    const owner = await this.getUserIdbyAccessToken(
      request.headers.authorization
    );

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const thread = await getThreadUseCase.execute(threadId);

    const response = h.response({
      status: "success",
      data: {
        thread,
      },
    });
    return response;
  }
}

module.exports = ThreadsHandler;
