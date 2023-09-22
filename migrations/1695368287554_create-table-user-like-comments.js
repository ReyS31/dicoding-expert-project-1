/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_like_comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'user_like_comments',
    'fk_user_like_comments.user.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'user_like_comments',
    'fk_user_like_comments.comment.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('user_like_comments');
};
