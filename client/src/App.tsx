import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import { FC, ReactElement } from 'react';

const App: FC = (): ReactElement => {
  return (
    <>
      <BrowserRouter>
        <div className="w-screen min-h-screen flex flex-col relative">
          <AppRouter />
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
