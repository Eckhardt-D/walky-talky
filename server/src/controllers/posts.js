const Joi = require('joi');
const {client} = require('../database');

const PostsModel = client.post;

const postsAddOptionsSchema = Joi.object({
  userId: Joi.number().integer().required(),
  content: Joi.string().max(1000).required(),
}).required();

class Posts {
  async add(options) {
    const params = await postsAddOptionsSchema.validateAsync(options);

    return PostsModel.create({
      data: {
        content: params.content,
        author: {
          connect: {
            id: params.userId,
          }
        },
      },
    });
  };

  async get() {
    return PostsModel.findMany({
      /**
       * This is okay for this app since we're using fake data,
       * in reality should pick fields to share;
       */
      include: {
        author: true,
      }
    });
  };
}

exports.Posts = Posts;