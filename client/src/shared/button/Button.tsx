import { FC, ReactElement } from 'react';
import { IButtonProps } from '../shared.interface';

const Button: FC<IButtonProps> = ({ label, onClick, disabled, className, role, type, testId, id }): ReactElement => {
  return (
    <button data-testid={testId} id={id} role={role} className={className} disabled={disabled} onClick={onClick} type={type}>
      {label}
    </button>
  );
};

export default Button;
