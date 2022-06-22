const {client} = require('./database');
const {PrismaClient} = require('@prisma/client');

describe('database', () => {
  it('returns an instance of PrismaClient', () => {
    expect(client).toBeInstanceOf(PrismaClient)
  });

  it('includes users', () => {
    expect(client.user).toBeDefined();
  });

  it('includes posts', () => {
    expect(client.post).toBeDefined();
  });

  it('includes upvotes', () => {
    expect(client.upvote).toBeDefined();
  });

  it('includes comments', () => {
    expect(client.comment).toBeDefined();
  })
})