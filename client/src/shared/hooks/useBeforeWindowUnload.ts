import { useEffect } from 'react';
import { getDataFromSessionStorage } from '../utils/utils.service';
import { socket } from 'src/sockets/socket.service';

const useBeforeWindowUnload = (): void => {
  useEffect(() => {
    // If the user close browser or tab
    window.addEventListener('beforeunload', () => {
      const loggedInUsername: string = getDataFromSessionStorage('loggedInuser');
      socket!.emit('removeLoggedInUser', loggedInUsername);
    });
  }, []);
};

export default useBeforeWindowUnload;
