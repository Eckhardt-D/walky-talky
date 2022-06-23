const Joi = require('joi');
const {client} = require('../database');

const CommentsModel = client.comment;

const commentsAddOptionsSchema = Joi.object({
  authorId: Joi.number().integer().required(),
  postId: Joi.number().integer().required(),
  content: Joi.string().max(1000).required(),
}).required();

class Comments {
  async add(options) {
    const params = await commentsAddOptionsSchema.validateAsync(options);

    return CommentsModel.create({
      data: {
        content: params.content,
        author: {
          connect: {
            id: params.authorId,
          }
        },
        post: {
          connect: {
            id: params.postId,
          }
        },
      },
      include: {
        author: true,
      }
    })
  }
}

exports.Comments = Comments