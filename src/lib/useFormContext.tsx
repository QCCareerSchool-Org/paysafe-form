import { useContext } from 'react';
import type { Context } from './formContext';
import { FormContext } from './formContext';

export const useFormContext = (): Context => {
  const formContext = useContext(FormContext);
  if (formContext === undefined) {
    throw Error('useFormContext must be used inside a FormContextProvider.');
  }

  return formContext;
};
