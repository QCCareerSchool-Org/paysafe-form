import type { FC, MouseEventHandler, ReactNode, SubmitEventHandler } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { PaysafeInstance } from './paysafe';
import { getPaysafeWindow } from './paysafe';
import type { SetupError, SetupOptions } from './paysafe/setup';
import { isSetupError } from './paysafe/setup';
import type { ErorrResponse, TokenizeOptions } from './paysafe/tokenize';
import { isErrorResponse } from './paysafe/tokenize';
import { FormContextProvider } from './formContextProvider';

export type FormComponent = FC<{ ready: boolean; prefix: string }>;

interface Props {
  apiKey: string;
  cardContainer?: ReactNode;
  googlePayContainer?: ReactNode;
  applePayContainer?: ReactNode;
  getSetupOptions: (setupKey: string) => SetupOptions;
  getCardTokenizeOptions?: () => TokenizeOptions;
  getGooglePayTokenizeOptions?: () => TokenizeOptions;
  getApplePayTokenizeOptions?: () => TokenizeOptions;
  onCardTokenize?: (token: string) => void;
  onGooglePayTokenize?: (token: string) => void;
  onApplePayTokenize?: (token: string) => void;
  onTokenizeError?: (err: ErorrResponse) => void;
  onSetupError?: (err: SetupError) => void;
}

export const PaysafeForm: FC<Props> = memo(({ getSetupOptions, getCardTokenizeOptions, getGooglePayTokenizeOptions, getApplePayTokenizeOptions, onCardTokenize, onGooglePayTokenize, onApplePayTokenize, onSetupError, onTokenizeError, ...props }) => {
  const [ setupKey, setSetupKey ] = useState(0);
  const paysafe = useRef<PaysafeInstance>(null);
  const setupGeneration = useRef(0);
  const [ initialized, setInitialized ] = useState({
    card: false,
    googlePay: false,
    applePay: false,
  });

  // anything that should cause a brand new Paysafe setup call should increment setupKey to cause the form to remount
  useEffect(() => {
    setSetupKey(s => s + 1);
  }, [ props.apiKey, getSetupOptions, onSetupError ]);

  // create a new paysafe instance
  useEffect(() => {
    if (setupKey === 0) {
      return;
    }

    // for keeping track of which setup iteration we're dealing with
    const generation = ++setupGeneration.current;
    const isCurrent = (): boolean => setupGeneration.current === generation;

    setInitialized({
      card: false,
      googlePay: false,
      applePay: false,
    });

    // avoid calling setup twice in strict mode by delaying long enough for the first cleanup to cancel the timeout
    const timerId = setTimeout(() => {
      const setupOptions = getSetupOptions(setupKey.toString());
      getPaysafeWindow().paysafe.fields.setup(props.apiKey, setupOptions).then(async instance => {
        if (!isCurrent()) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw cancelledSetup;
        }
        paysafe.current = instance;
        return paysafe.current.show();
      }).then(paymentMethods => {
        if (!isCurrent()) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw cancelledSetup;
        }
        if (paymentMethods.card) {
          if (paymentMethods.card.error) {
            throw Error(paymentMethods.card.error);
          }
          setInitialized(i => ({ ...i, card: true }));
        }
        if (paymentMethods.googlePay) {
          if (paymentMethods.googlePay.error) {
            throw Error(paymentMethods.googlePay.error);
          }
          setInitialized(i => ({ ...i, googlePay: true }));
        }
        if (paymentMethods.applePay) {
          if (paymentMethods.applePay.error) {
            throw Error(paymentMethods.applePay.error);
          }
          setInitialized(i => ({ ...i, applePay: true }));
        }
      }).catch((err: unknown) => {
        if (err === cancelledSetup) {
          return;
        }
        console.error(err);
        if (isSetupError(err)) {
          onSetupError?.(err);
        }
      });
    }, 15);

    return () => {
      clearTimeout(timerId);

      if (isCurrent()) {
        paysafe.current = null;
        setInitialized({
          card: false,
          googlePay: false,
          applePay: false,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
        setupGeneration.current++; // Invalidate this setup generation so any async continuations from it are ignored.
      }
    };
  }, [ setupKey, props.apiKey, getSetupOptions, onSetupError ]);

  const handleSubmit: SubmitEventHandler = useCallback(e => {
    e.preventDefault();

    if (!initialized.card) {
      return;
    }

    paysafe.current?.tokenize(getCardTokenizeOptions?.()).then(result => {
      onCardTokenize?.(result.token);
    }).catch((err: unknown) => {
      console.error(err);
      if (isErrorResponse(err)) {
        onTokenizeError?.(err);
      };
    });
  }, [ getCardTokenizeOptions, initialized.card, onCardTokenize, onTokenizeError ]);

  const handleGooglePayClick: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.preventDefault();

    if (!initialized.googlePay) {
      return;
    }

    paysafe.current?.tokenize(getGooglePayTokenizeOptions?.()).then(result => {
      onGooglePayTokenize?.(result.token);
    }).catch((err: unknown) => {
      console.error(err);
      if (isErrorResponse(err)) {
        onTokenizeError?.(err);
      };
    });
  }, [ getGooglePayTokenizeOptions, initialized.googlePay, onGooglePayTokenize, onTokenizeError ]);

  const handleApplePayClick: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.preventDefault();

    if (!initialized.applePay) {
      return;
    }

    paysafe.current?.tokenize(getApplePayTokenizeOptions?.()).then(result => {
      onApplePayTokenize?.(result.token);
    }).catch((err: unknown) => {
      console.error(err);
      if (isErrorResponse(err)) {
        onTokenizeError?.(err);
      };
    });
  }, [ getApplePayTokenizeOptions, initialized.applePay, onApplePayTokenize, onTokenizeError ]);

  return (
    <FormContextProvider initialized={initialized} setupKey={setupKey.toString()} instance={paysafe.current}>
      {props.cardContainer && (
        <form onSubmit={handleSubmit}>
          <div key={setupKey}>
            {props.cardContainer}
          </div>
        </form>
      )}
      {props.googlePayContainer && (
        <div onClick={handleGooglePayClick}>
          <div key={setupKey}>
            {props.googlePayContainer}
          </div>
        </div>
      )}
      {props.applePayContainer && (
        <div onClick={handleApplePayClick}>
          <div key={setupKey}>
            {props.applePayContainer}
          </div>
        </div>
      )}
    </FormContextProvider>
  );
});

PaysafeForm.displayName = 'PaysafeForm';

const cancelledSetup = Symbol('cancelledSetup');
