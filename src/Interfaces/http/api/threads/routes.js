const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: handler.postThreadHandler,
  },
  {
    method: "GET",
    path: "/threads/{threadId}",
    handler: handler.getThreadHandler,
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments",
    handler: handler.postCommentHandler,
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}",
    handler: handler.deleteCommentHandler,
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments/{commentId}/replies",
    handler: handler.postReplyHandler,
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}/replies/{replyId}",
    handler: handler.deleteReplyHandler,
  },
];

module.exports = routes;
