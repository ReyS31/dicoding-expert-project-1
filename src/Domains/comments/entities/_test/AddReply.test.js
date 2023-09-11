const AddReply = require("../AddReply");

describe("a AddReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
      content: "wleowleo",
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError(
      "ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      threadId: 2,
      commentId: {},
      content: true,
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError(
      "ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddReply object correctly", () => {
    // Arrange
    const payload = {
      threadId: "thread-123",
      commentId: "comment-123",
      content: "dicoding",
      owner: "user-123",
    };

    // Action
    const { threadId,commentId, content, owner } = new AddReply(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
