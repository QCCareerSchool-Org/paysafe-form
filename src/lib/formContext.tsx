import { createContext } from 'react';
import type { PaysafeInstance } from './paysafe';

export interface Context {
  setupKey: string;
  initialized: boolean;
  instance: PaysafeInstance | null;
}

export const FormContext = createContext<Context | undefined>(undefined);
