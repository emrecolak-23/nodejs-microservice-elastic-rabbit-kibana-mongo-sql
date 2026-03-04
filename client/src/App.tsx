import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import { FC, ReactElement, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { socketService } from './sockets/socket.service';
import { getDataFromSessionStorage, getTokenFromSessionStorage, saveTokenToSessionStorage } from 'src/shared/utils/utils.service';
import { useRefreshTokenMutation } from './features/auth/services/auth.service';

const App: FC = (): ReactElement => {
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const initSocket = async () => {
      if (!getTokenFromSessionStorage()) {
        try {
          const isLoggedIn = getDataFromSessionStorage('isLoggedIn');
          const username = getDataFromSessionStorage('loggedInuser');
          if (isLoggedIn && username) {
            const result = await refreshToken(username).unwrap();
            if (result?.token) {
              saveTokenToSessionStorage(result.token);
            }
          }
        } catch {
          // Ignore - user may not be logged in
        }
      }
      socketService.setupSocketConnection();
    };
    initSocket();
  }, [refreshToken]);

  return (
    <>
      <BrowserRouter>
        <div className="w-screen min-h-screen flex flex-col relative">
          <AppRouter />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
