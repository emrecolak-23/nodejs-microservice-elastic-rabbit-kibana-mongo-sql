import { Application } from 'express';

export const appRoutes = (app: Application) => {
  app.use('', () => console.log('appRoutes'));
};
