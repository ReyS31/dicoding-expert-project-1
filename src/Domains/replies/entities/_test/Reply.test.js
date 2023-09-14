const Reply = require("../Reply");

describe("a Reply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError(
      "REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
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
    expect(() => new Reply(payload)).toThrowError(
      "REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Reply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
      is_delete: false,
    };

    // Action
    const { id, content, username, date } = new Reply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
  });

  it("should create deleted Reply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "udin",
      content: "bala",
      date: new Date().toISOString(),
      is_delete: true,
    };

    // Action
    const { id, content, username, date } = new Reply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual("**balasan telah dihapus**");
    expect(date).toEqual(payload.date);
  });
});
