import 'reflect-metadata';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4')
}));

jest.mock('@gig/server', () => ({
  gigChannel: {
    assertExchange: jest.fn(),
    publish: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn()
  }
}));

jest.mock('@gig/routes', () => ({
  appRoutes: jest.fn()
}));

jest.mock('@gig/loaders', () => ({
  ElasticSearch: jest.fn().mockImplementation(() => ({
    checkConnection: jest.fn(),
    createIndex: jest.fn(),
    getIndexedData: jest.fn(),
    addDataToIndex: jest.fn(),
    updateIndexedData: jest.fn(),
    deleteIndexedData: jest.fn()
  })),
  dbConnection: jest.fn()
}));

jest.mock('@emrecolak-23/jobber-share', () => ({
  ...jest.requireActual('@emrecolak-23/jobber-share'),
  uploads: jest.fn(),
  isDataURL: jest.fn()
}));

jest.mock('@faker-js/faker', () => ({
  faker: {
    word: {
      words: jest.fn(() => 'test words')
    },
    commerce: {
      productName: jest.fn(() => 'Test Product'),
      productDescription: jest.fn(() => 'Test Description'),
      department: jest.fn(() => 'Test Department'),
      product: jest.fn(() => 'Test Product'),
      price: jest.fn(() => '25')
    },
    lorem: {
      sentences: jest.fn(() => 'Test sentences.')
    },
    image: {
      urlPicsumPhotos: jest.fn(() => 'https://test.com/image.jpg')
    }
  }
}));
