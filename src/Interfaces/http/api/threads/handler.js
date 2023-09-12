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
    this._authenticationTokenManager = this._container.getInstance(
      AuthenticationTokenManager.name
    );

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async getUserIdbyAccessToken(authorization) {
    if (authorization === undefined) {
      throw new AuthenticationError("Missing authentication");
    }

    const accessToken = authorization.split(" ")[1];

    const { id } = await this._authenticationTokenManager.decodePayload(
      accessToken
    );

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

module.exports = ThreadsHandler;
