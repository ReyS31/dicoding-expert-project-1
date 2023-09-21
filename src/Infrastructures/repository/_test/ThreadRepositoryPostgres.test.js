const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepository postgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await UsersTableTestHelper.addUser({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread to database', async () => {
      // Arrange
      const payload = {
        title: 'owowow',
        body: 'wleowleowleo',
        owner: 'user-123',
      };
      const addThread = new AddThread({
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
      });
      const fakeIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepository.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe('thread-123');
      expect(threads[0].title).toBe(payload.title);
      expect(threads[0].body).toBe(payload.body);
      expect(threads[0].owner).toBe(payload.owner);
      expect(threads[0].date).toBeDefined();
    });
  });

  describe('getById function', () => {
    it('should throw NotFoundError if thread is not exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const id = 'thread-123';

      // Action & Assert
      await expect(threadRepository.getById(id)).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread exists', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'owowow',
        body: 'wleowleowleo',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '1234';
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const id = 'thread-1234';
      await threadRepository.addThread(addThread);

      // Action & Assert
      await expect(threadRepository.getById(id)).resolves.not.toThrow(
        NotFoundError,
      );
      const thread = await threadRepository.getById(id);
      expect(thread.id).toBe(id);
      expect(thread.title).toBe('owowow');
      expect(thread.body).toBe('wleowleowleo');
      expect(thread.date).toBeDefined();
      expect(thread.username).toBe('dicoding');
    });
  });
});
