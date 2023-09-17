const Comment = require("../Comment");

describe("a Comment entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: [],
      username: true,
      content: {},
      date: 123,
      is_delete: "q1",
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Comment object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
      is_delete: false,
    };

    // Action
    const { id, content, username, date } = new Comment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(replies).toHaveLength(0);
  });

  it("should create deleted Comment object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
      is_delete: true,
    };

    // Action
    const { id, content, username, date, replies } = new Comment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual("**komentar telah dihapus**");
    expect(date).toEqual(payload.date);
    expect(replies).toHaveLength(0);
  });
});
