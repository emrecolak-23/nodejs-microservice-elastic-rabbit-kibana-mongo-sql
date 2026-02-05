import 'reflect-metadata';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4')
}));

jest.mock('@auth/server', () => ({
  authChannel: {
    assertExchange: jest.fn(),
    publish: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn()
  }
}));

jest.mock('@auth/routes', () => ({
  appRoutes: jest.fn()
}));

jest.mock('@auth/loaders', () => ({
  sequelize: {
    authenticate: jest.fn(),
    sync: jest.fn(),
    define: jest.fn(() => {
      const mockModel: any = {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        addHook: jest.fn(),
        sync: jest.fn()
      };
      mockModel.prototype = {
        comparePassword: jest.fn(),
        hashPassword: jest.fn()
      };
      return mockModel;
    })
  },
  dbConnection: jest.fn()
}));
