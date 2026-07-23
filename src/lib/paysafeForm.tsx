import type { FC, PropsWithChildren, SubmitEventHandler } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { PaysafeEvent, PaysafeInstance } from './paysafe';
import { getPaysafeWindow } from './paysafe';
import type { SetupError, SetupOptions } from './paysafe/setup';
import { isSetupError } from './paysafe/setup';
import type { ErorrResponse, TokenizeOptions } from './paysafe/tokenize';
import { isErrorResponse } from './paysafe/tokenize';
import { FormContextProvider } from './formContextProvider';

export type FormComponent = FC<{ ready: boolean; prefix: string }>;

interface Props {
  apiKey: string;
  getSetupOptions: (setupKey: string) => SetupOptions;
  getTokenizationOptions: () => TokenizeOptions;
  onTokenize: (token: string) => void;
  onTokenizeError?: (err: ErorrResponse) => void;
  onSetupError?: (err: SetupError) => void;
}

interface Validity {
  fields: {
    CardNumber: boolean;
    Cvv: boolean;
    ExpiryDate: boolean;
  };
  valid: boolean;
}

export const PaysafeForm: FC<PropsWithChildren<Props>> = memo(({ getSetupOptions, getTokenizationOptions, onTokenize, onSetupError, onTokenizeError, children, ...props }) => {
  const [ validity, setValidity ] = useState<Validity>({ fields: { CardNumber: false, Cvv: false, ExpiryDate: false }, valid: false });
  const [ setupKey, setSetupKey ] = useState(0);
  const paysafe = useRef<PaysafeInstance>(null);
  const setupGeneration = useRef(0);
  const [ initialized, setInitialized ] = useState(false);

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

    setInitialized(false);

    // avoid calling setup twice in strict mode by delaying long enough for the first cleanup to cancel the timeout
    const timerId = setTimeout(() => {
      const setupOptions = getSetupOptions(setupKey.toString());
      getPaysafeWindow().paysafe.fields.setup(props.apiKey, setupOptions).then(async instance => {
        if (!isCurrent()) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw cancelledSetup;
        }
        paysafe.current = instance;
        return instance.show();
      }).then(paymentMethods => {
        if (!isCurrent()) {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw cancelledSetup;
        }
        if (paymentMethods.card && !paymentMethods.card.error) {
          paysafe.current?.fields('Cvv CardNumber ExpiryDate').on('Valid Invalid', handleFieldChange(setValidity, isCurrent));
          setInitialized(true);
        } else {
          if (!paymentMethods.card) {
            throw Error('Card payment method not supported.');
          } else {
            throw Error(paymentMethods.card.error);
          }
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
        setInitialized(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setupGeneration.current++; // Invalidate this setup generation so any async continuations from it are ignored.
      }
    };
  }, [ setupKey, props.apiKey, getSetupOptions, onSetupError ]);

  const handleSubmit: SubmitEventHandler = useCallback(e => {
    e.preventDefault();

    if (!initialized || !validity.valid) {
      return;
    }

    paysafe.current?.tokenize(getTokenizationOptions()).then(result => {
      onTokenize(result.token);
    }).catch((err: unknown) => {
      console.error(err);
      if (isErrorResponse(err)) {
        onTokenizeError?.(err);
      };
    });
  }, [ getTokenizationOptions, initialized, validity.valid, onTokenize, onTokenizeError ]);

  return (
    <FormContextProvider initialized={initialized} setupKey={setupKey.toString()} instance={paysafe.current}>
      <form onSubmit={handleSubmit}>
        <div key={setupKey}>
          {children}
        </div>
      </form>
    </FormContextProvider>
  );
});

PaysafeForm.displayName = 'PaysafeForm';

const cancelledSetup = Symbol('cancelledSetup');

const handleFieldChange = (setValidity: React.Dispatch<React.SetStateAction<Validity>>, isCurrent: () => boolean) => function (this: HTMLElement, _: PaysafeInstance, event: PaysafeEvent) {
  if (!isCurrent()) {
    return;
  }

  if (event.type === 'Invalid') {
    this.classList.add('invalid');
  } else {
    this.classList.remove('invalid');
  }
  setValidity(v => {
    const newFields = {
      ...v.fields,
      [event.target.fieldName]: event.type === 'Valid',
    };
    return {
      fields: newFields,
      valid: Object.values(newFields).every(Boolean),
    };
  });
};
