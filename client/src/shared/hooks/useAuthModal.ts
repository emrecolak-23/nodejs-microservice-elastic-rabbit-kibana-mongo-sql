import { useCallback, useState } from 'react';

export type AuthModalType = 'login' | 'register' | 'forgotPassword';

const MODAL_TOGGLE_MAP: Record<AuthModalType, AuthModalType> = {
  login: 'register',
  register: 'login',
  forgotPassword: 'login'
};

export function useAuthModal() {
  const [activeModal, setActiveModal] = useState<AuthModalType | null>(null);

  const openModal = useCallback((type: AuthModalType) => {
    setActiveModal(type);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const toggleModal = useCallback((type: AuthModalType) => {
    setActiveModal((prev) => (prev === type ? MODAL_TOGGLE_MAP[type] : type));
  }, []);

  return {
    activeModal,
    isOpen: activeModal !== null,
    openModal,
    closeModal,
    toggleModal
  };
}
