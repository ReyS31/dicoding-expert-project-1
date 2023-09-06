/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("comments", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    thread_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
    },
    content: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    date: {
      type: "TEXT",
      notNull: true,
    },
    is_delete: {
      type: "BOOLEAN",
      default: false,
    },
  });

  pgm.addConstraint(
    "comments",
    "fk_comments.user.id",
    "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "comments",
    "fk_comments.thread.id",
    "FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "comments",
    "fk_comments.comment.id",
    "FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("comments");
};
