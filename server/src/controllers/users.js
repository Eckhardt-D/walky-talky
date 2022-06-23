const Joi = require('joi');
const { client } = require('../database');

const UserModel = client.user;

const userAddOptionsSchema = Joi.object({
  usernames: Joi.array().items(
    Joi.string().max(32).required()
  ).unique(),
}).required();

class Users {
  /* Mostly for use in internal scripts, not going to create users via UI */
  async seed(options) {
    const params = await userAddOptionsSchema.validateAsync(options);
    
    for (let i = 0; i < params.usernames.length; i++) {
      const username = params.usernames[i];

      await UserModel.upsert({
        where: {
          id: i,
        },
        create: {
          username,
        },
        update: {}
      })
    }
  }

  async getRandomUser() {
    const usersLength = await UserModel.count();

    if (usersLength < 1) {
      return undefined;
    }

    const randomId = Math.ceil(Math.random() * usersLength);

    return UserModel.findFirst({
      where: {
        id: randomId
      },
      include: {
        upvotes: {
          select: {
            postId: true,
          }
        }
      }
    });
  }
}

exports.Users = Users;