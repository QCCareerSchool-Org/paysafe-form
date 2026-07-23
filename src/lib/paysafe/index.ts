import type { UniqueSpaceSeparated } from '../uniqueSeparated';
import type { SetupError, SetupOptions } from './setup';
import type { TokenizationResult, TokenizeOptions } from './tokenize';

type PaysafeEventName = 'Focus' | 'Blur' | 'Valid' | 'Invalid' | 'FieldValueChange' | 'InvalidCharacter';

type PaysafeFieldName = 'CardNumber' | 'Cvv' | 'ExpiryDate' | 'ExpiryYear' | 'ExpiryMonth';

export interface PaysafeEvent extends Event {
  type: PaysafeEventName;
  target: Event['target'] & { fieldName: PaysafeFieldName };
}

export interface PaysafeInstance {
  tokenize: (options?: TokenizeOptions) => Promise<TokenizationResult>;
  show: () => Promise<{
    card?: { error?: string };
    applePay?: { error?: string };
    googlePay?: { error?: string };
  }>;
  fields: (fields: UniqueSpaceSeparated<PaysafeFieldName>) => {
    on: (events: UniqueSpaceSeparated<PaysafeEventName>, callback: (this: HTMLElement, instance: PaysafeInstance, e: PaysafeEvent) => void) => void;
  };
}

interface Paysafe {
  fields: {
    setup: {
      (apiKey: string, options: SetupOptions, callback: (err: SetupError, paysafeInstance: PaysafeInstance) => void): void;
      (apiKey: string, options: SetupOptions): Promise<PaysafeInstance>;
    };
  };
}

interface PaysafeWindow extends Window {
  paysafe: Paysafe;
}

export const getPaysafeWindow = (): PaysafeWindow => {
  if (!('paysafe' in window)) {
    throw new Error('Paysafe script has not loaded');
  }

  return window as PaysafeWindow;
};
