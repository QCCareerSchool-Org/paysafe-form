import type { PropsWithChildren } from 'react';
import type { Context } from './formContext';
import { FormContext } from './formContext';

export const FormContextProvider: React.FC<PropsWithChildren<Context>> = ({ initialized, setupKey, instance, children }) => {
  return (
    <FormContext value={{ initialized, setupKey, instance }}>
      {children}
    </FormContext>
  );
};
