const AuthenticationTokenManager = require("../../../../Applications/security/AuthenticationTokenManager");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const AuthenticationError = require("../../../../Commons/exceptions/AuthenticationError");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const owner = await this.getUserIdbyAccessToken(
      request.headers.authorization
    );

    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const owner = await this.getUserIdbyAccessToken(
      request.headers.authorization
    );

    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );

    await deleteCommentUseCase.execute({
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

module.exports = CommentsHandler;
