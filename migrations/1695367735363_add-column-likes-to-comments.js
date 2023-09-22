/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    like_count: {
      type: 'INTEGER',
      default: 0,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'like_count');
};
