const InvariantError = require("../../../Commons/exceptions/InvariantError");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");

describe("ThreadRepository postgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should add thread to database", async () => {
      // Arrange
      const addThread = new AddThread({
        title: "owowow",
        body: "wleowleowleo",
      });
      const fakeIdGenerator = () => "123";
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepository.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findById("thread-123");
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toBe(addThread.title);
      expect(threads[0].body).toBe(addThread.body);
    });
  });

  describe("checkAvailabilityToken function", () => {
    it("should throw InvariantError if token not available", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
        const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const id = "thread-123";

      // Action & Assert
      await expect(
        threadRepository.getById(id)
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError if token available", async () => {
      // Arrange
      const addThread = new AddThread({
        title: "owowow",
        body: "wleowleowleo",
      });
      const fakeIdGenerator = () => "123";
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await threadRepository.addThread(addThread);

      // Action & Assert
      await expect(
        threadRepository.checkAvailabilityToken(token)
      ).resolves.not.toThrow(InvariantError);
    });
  });
});
