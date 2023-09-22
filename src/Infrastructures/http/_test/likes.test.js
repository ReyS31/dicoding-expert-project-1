const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  // test variable
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  let accessToken;

  async function addUserAndGetAccessToken({
    username = 'ujang',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  }) {
    const requestPayload = {
      username,
      password,
    };
    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });

    // login
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    return `Bearer ${responseJson.data.accessToken}`;
  }

  beforeAll(async () => {
    accessToken = await addUserAndGetAccessToken({});
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when PUT /threads/{{threadId}}/comments/{{commentId}}/likes', () => {
    it('should response 200 and liked comment', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          authorization: accessToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comment = await CommentsTableTestHelper.findById(commentId);
      expect(comment[0].like_count).toBe(1);

      const likes = await LikesTableTestHelper.findByCommentId(commentId);
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unliked comment', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          authorization: accessToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comment = await CommentsTableTestHelper.findById(commentId);
      expect(comment[0].like_count).toBe(0);

      const likes = await LikesTableTestHelper.findByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });

    it('should response 401 when have no auth', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when no thread found', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/${commentId}/likes`,
        headers: {
          authorization: accessToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when no comment found', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/xxx/likes`,
        headers: {
          authorization: accessToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });
});
