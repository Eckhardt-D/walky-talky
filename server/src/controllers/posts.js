const Joi = require('joi');
const {client} = require('../database');

const PostsModel = client.post;
const UpvoteModel = client.upvote;

const postsAddOptionsSchema = Joi.object({
  userId: Joi.number().integer().required(),
  content: Joi.string().max(1000).required(),
}).required();

const postsUpvoteOptionsSchema = Joi.object({
  postId: Joi.number().integer().required(),
  authorId: Joi.number().integer().required(),
  upvoterId: Joi.number().integer().required(),
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
        _count: {
          select: {
            upvotes: true,
          }
        }
      }
    });
  };

  async upvotePost(options) {
    const params = await postsUpvoteOptionsSchema.validateAsync(options);

    // Check if already upvoted
    const item = await UpvoteModel.findFirst({
      where: {
        authorId: params.upvoterId,
        postId: params.postId,
      }
    });

    if (item != null) {
      await UpvoteModel.delete({
        where: {
          id: item.id,
        }
      });

      return this.get();
    }
    
    await UpvoteModel.create({
      data: {
        post: {
          connect: {
            id: params.postId,
          }
        },
        author: {
          connect: {
            id: params.upvoterId,
          }
        }
      },
    });

    return this.get();
  }
}

exports.Posts = Posts;