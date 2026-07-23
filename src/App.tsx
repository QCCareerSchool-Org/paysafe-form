/** Example implementation - not part of the library */

import type { FC } from 'react';
import { useCallback, useId, useState } from 'react';
import { PaysafeForm } from './lib/paysafeForm';
import type { TokenizeOptions } from './lib/paysafe/tokenize';
import type { SetupOptions } from './lib/paysafe/setup';
import { CardForm } from './cardForm';
import { GooglePayForm } from './googlePayForm';
import { ApplePayForm } from './applePayForm';

const App: FC = () => {
  const [ merchantRefNum ] = useState(`merchant_ref_${Date.now().toString()}`);
  const [ amount, setAmount ] = useState(0);
  const [ currencyCode, setCurrencyCode ] = useState(import.meta.env.VITE_CURRENCY_CODE);
  const id = useId().replace(/:/gu, '');

  const getSetupOptions = useCallback((setupKey: string): SetupOptions => ({
    environment: 'TEST',
    currencyCode,
    accounts: {
      default: parseInt(import.meta.env.VITE_PAYSAFE_ACCOUNT_ID as string, 10),
      googlePay: 1111111111,
    },
    fields: {
      cardNumber: {
        selector: `#cardNumber_${id}_${setupKey}`,
        placeholder: 'Card Number',
      },
      cvv: {
        selector: `#cvv_${id}_${setupKey}`,
        placeholder: 'CVV',
      },
      expiryDate: {
        selector: `#expiryDate_${id}_${setupKey}`,
        placeholder: 'Exp. Date',
      },
      googlePay: {
        selector: `#google-pay_${id}_${setupKey}`,
        type: 'buy',
        color: 'black',
      },
      applePay: {
        selector: `#apple-pay_${id}_${setupKey}`,
      },
    },
  }), [ currencyCode, id ]);

  const getCardTokenizeOptions = useCallback((): TokenizeOptions => ({
    amount,
    merchantRefNum,
    paymentType: 'CARD',
    transactionType: 'PAYMENT',
    customerDetails: {
      billingDetails: { country: 'CA', state: 'ON', zip: 'K1L 6R2' },
      profile: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
      holderName: 'Joe Smith',
    },
    threeDs: {
      merchantUrl: 'https://www.qccareerschool.com',
      deviceChannel: 'BROWSER',
      useThreeDSecureVersion2: true,
      requestorChallengePreference: 'CHALLENGE_MANDATED',
    },
  }), [ amount, merchantRefNum ]);

  const getGooglePayTokenizeOptions = useCallback((): TokenizeOptions => ({
    amount,
    merchantRefNum,
    paymentType: 'GOOGLEPAY',
    transactionType: 'PAYMENT',
    customerDetails: {
      billingDetails: {
        country: 'US',
        zip: '90210',
        street: 'Oak Fields 6',
        city: 'ca',
        state: 'CA',
      },
    },
    googlePay: {
      country: 'CA',
      requiredBillingContactFields: [ 'email' ],
      requiredShippingContactFields: [ 'name' ],
      merchantId: '012345678912345678',
      label: 'My Company',
    },
  }), [ amount, merchantRefNum ]);

  return (
    <div className="container">
      <input type="text" value={currencyCode} onChange={e => setCurrencyCode(e.target.value)} />
      <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value, 10))} />
      <h1>Paysafe Form Test</h1>
      <PaysafeForm
        apiKey={import.meta.env.VITE_PAYSAFE_API_KEY}
        cardContainer={<CardForm id={id} />}
        googlePayContainer={<GooglePayForm id={id} />}
        applePayContainer={<ApplePayForm id={id} />}
        getSetupOptions={getSetupOptions}
        getCardTokenizeOptions={getCardTokenizeOptions}
        getGooglePayTokenizeOptions={getGooglePayTokenizeOptions}
        onSetupError={console.error}
        onCardTokenize={handleTokenize}
        onTokenizeError={console.error}
      />
    </div>
  );
};

export default App;

const handleTokenize = (token: string): void => {
  alert(token);
  const body = { token };
  try {
    void fetch('http://localhost:8080', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    }).then(async response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json() as Promise<unknown>;
    }).then(json => {
      console.log(json);
    });
  } catch (err) {
    console.error(err);
  }
};
