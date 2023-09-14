const AuthenticationTokenManager = require("../../../../Applications/security/AuthenticationTokenManager");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");
const AuthenticationError = require("../../../../Commons/exceptions/AuthenticationError");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
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

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const owner = await this.getUserIdbyAccessToken(
      request.headers.authorization
    );

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({
      ...request.payload,
      commentId,
      threadId,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const owner = await this.getUserIdbyAccessToken(
      request.headers.authorization
    );

    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );

    await deleteReplyUseCase.execute({
      replyId,
      commentId,
      threadId,
      owner,
    });

    const response = h.response({
      status: "success",
    });
    return response;
  }
}

module.exports = RepliesHandler;
