# paysafe-form

React lifecycle wrapper for Paysafe.js. The component owns the outer `<form>`, Paysafe setup lifecycle, validation state, and tokenization call. Your app owns the Paysafe setup options, tokenization options, and the JSX rendered inside the form.

## Install

```sh
npm install paysafe-form
```

React and React DOM are peer dependencies.

## Paysafe script

This package expects the Paysafe browser SDK to already be loaded on `window.paysafe` before the form sets up. If the SDK is missing, setup throws `Paysafe script has not loaded`.

## Basic Usage

```tsx
import { useCallback, useEffect, useState } from 'react';
import { PaysafeForm, useFormContext } from 'paysafe-form';

export function CheckoutForm() {
  const [amount, setAmount] = useState(234);
  const [merchantRefNum] = useState('order-123');
  const [currencyCode, setCurrencyCode] = useState('USD');

  const getSetupOptions = useCallback((setupKey: string) => ({
    environment: 'TEST',
    currencyCode,
    fields: {
      cardNumber: {
        selector: `#paysafe-${setupKey}-cardNumber`,
        placeholder: 'Card Number',
      },
      cvv: {
        selector: `#paysafe-${setupKey}-cvv`,
        placeholder: 'CVV',
      },
      expiryDate: {
        selector: `#paysafe-${setupKey}-expiryDate`,
        placeholder: 'Exp. Date',
      },
    },
  } as const), [currencyCode]);

  const getTokenizationOptions = useCallback(() => ({
    amount,
    merchantRefNum,
    transactionType: 'PAYMENT',
    customerDetails: {
      holderName: 'Jane Smith',
      billingDetails: { country: 'US', zip: '10001' },
      profile: { firstName: 'Jane', lastName: 'Smith' },
    },
  } as const), [amount, merchantRefNum]);

  return (
    <PaysafeForm
      apiKey={import.meta.env.VITE_PAYSAFE_API_KEY}
      getSetupOptions={getSetupOptions}
      getTokenizationOptions={getTokenizationOptions}
      onTokenize={token => {
        console.log(token);
      }}
      onTokenizeError={err => {
        console.error(err.displayMessage);
      }}
      onSetupError={err => {
        console.error(err.displayMessage);
      }}
    >
      <CardFields />
    </PaysafeForm>
  );
}

function CardFields() {
  const { initialized, setupKey } = useFormContext();

  return (
    <>
      <div id={`paysafe-${setupKey}-cardNumber`} />
      <div id={`paysafe-${setupKey}-cvv`} />
      <div id={`paysafe-${setupKey}-expiryDate`} />
      <button type="submit" disabled={!initialized}>Pay</button>
    </>
  );
}
```

## Context

Children rendered inside `PaysafeForm` can call `useFormContext()`.

The context contains:

- `setupKey: string` - Current internal setup key. Use it to build field container ids that match `getSetupOptions`.
- `initialized: boolean` - True after Paysafe setup/show completes.
- `instance: PaysafeInstance | null` - Current Paysafe instance, available after initialization.

The hook must be called by a descendant of `PaysafeForm`, not by the component that renders `PaysafeForm` itself.

## Setup Options and Markup

`getSetupOptions(setupKey)` returns the `SetupOptions` object passed to `paysafe.fields.setup(apiKey, options)`.

Your rendered field container ids must match the selectors returned from `getSetupOptions` for the same `setupKey`.

Correct:

```tsx
const getSetupOptions = (setupKey: string) => ({
  environment: 'TEST',
  currencyCode: 'USD',
  fields: {
    cardNumber: { selector: `#paysafe-${setupKey}-cardNumber` },
    cvv: { selector: `#paysafe-${setupKey}-cvv` },
    expiryDate: { selector: `#paysafe-${setupKey}-expiryDate` },
  },
});

function CardFields() {
  const { setupKey } = useFormContext();

  return (
    <>
      <div id={`paysafe-${setupKey}-cardNumber`} />
      <div id={`paysafe-${setupKey}-cvv`} />
      <div id={`paysafe-${setupKey}-expiryDate`} />
    </>
  );
}
```

The static-id version can break when React remounts or reruns effects and the Paysafe SDK is still finishing older async setup work. The setup key lets the wrapper create a fresh keyed form subtree and fresh field ids for each Paysafe setup.

## Tokenization Options

`getTokenizationOptions()` is called when the form is submitted. Return the options you want passed to `paysafeInstance.tokenize(...)`.

Use this function to create per-submit values such as `merchantRefNum` when needed:

```tsx
const getTokenizationOptions = useCallback(() => ({
  amount,
  merchantRefNum: crypto.randomUUID(),
  transactionType: 'PAYMENT',
  customerDetails,
}), [amount, customerDetails]);
```

If your backend requires one stable merchant reference per order, create it at the order level and return that value from `getTokenizationOptions`.

## Stable Function Props

`getSetupOptions` is a setup input. If its reference changes, `PaysafeForm` creates a new Paysafe setup.

Use React's normal dependency model: make `getSetupOptions` change identity when any setup value it captures changes. You can do that with React Compiler, `useCallback`, or by defining stable functions outside render.

`getTokenizationOptions` is used on submit, not setup. Its reference should still follow normal React rules so submit uses current values.

## Props

### Required

- `apiKey: string` - Paysafe API key.
- `getSetupOptions: (setupKey: string) => SetupOptions` - Returns the options passed to `paysafe.fields.setup` for the current setup key.
- `getTokenizationOptions: () => Omit<TokenizeOptions, 'paymentType'>` - Returns tokenization options for the current submit. The wrapper adds `paymentType: 'CARD'`.
- `children: ReactNode` - JSX rendered inside the wrapper's form. Descendants can call `useFormContext()`.
- `onTokenize: (token: string) => void` - Called with the token after successful tokenization.

### Optional

- `onTokenizeError?: (err) => void` - Called for recognized Paysafe tokenization errors.
- `onSetupError?: (err) => void` - Called for recognized Paysafe setup errors.

## Submit Behavior

`PaysafeForm` renders the outer `<form>` and owns `onSubmit`. Children should render a submit button, but should not replace the form submit handler.

```tsx
<button type="submit" disabled={!initialized}>Pay</button>
```

`initialized` becomes true after Paysafe setup completes.
