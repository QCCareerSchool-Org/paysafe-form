export type Environment = 'LIVE' | 'TEST';

type Field = 'cardNumber' | 'cvv' | 'expiryDate' | 'expiryYear' | 'expiryMonth' | 'applePay' | 'googlePay';

type Id = '#cvv' | '#card-number' | '#expiry-date' | '#expiry-year' | '#expiry-month';
type Class = 'valid' | 'invalid';
type Property = 'color' | 'opacity' | 'letter-spacing' | 'text-align' | 'text-indent' | 'text-decoration' | 'text-shadow' | 'font' | 'font-style' | 'font-weight' | 'font-size' | 'line-height' | 'font-family' | 'transition' | '-ms-filter';

export type Style = Partial<Record<Id | `${Id}.${Class}` | 'input' | ':focus' | '.invalid' | '.valid', Partial<Record<Property, string>>>>;

export type Fields = Partial<Record<Field, {
  /** CSS selector that uniquely identifies the empty container in which to insert the field iframe. */
  selector: string;
  /** Placeholder for the iframe input element. */
  placeholder?: string;
  /** An accessibility label that will be read from the Screen Readers, if the client uses any (default - When no accessibility label is specified, the placeholder's value is used. If there is neither accessibilityLabel nor a placeholder, the default value is Card Number/CVV/Card expiry date/Card expiry month/Card expiry year) */
  accessibilityLabel?: string;
  /** An error message which will be read from the Screen Readers when the field is invalid (if the client uses any). Empty by default. */
  accessibilityErrorMessage?: string;
  /** The title that will be assigned to the iframe. The default value is 'secured'. */
  iframeTitle?: string;
  /**
   * Available for the card number field only. If no separator is specified the default is white space (" "). Accepted values are: null, undefined, "", " ", "-".
   *
   * If the separator value is null or undefined, no separator is applied. If the separator is " " or "-", this is automatically added after every 4 digits when a card number is entered (e.g., "4532-5647-1747-9616", "4078 2050 3082 0").
   */
  separator?: string;
  /**
   * Warning: Available for all fields only when using saved card functionality (passing of singleUseCustomerToken and paymentTokenFrom on tokenize function), otherwise available for the CVV field only.
   *
   * Defaults to "false". If the value is "true", the field will not be required for making a tokenization, but will be validated if it is not empty.
   */
  optional?: boolean;
  /**
   * WARNING:  Available for the CVV field only.
   *
   * Defaults to "false". If the value is "true" the CVV value will be masked.
   */
  mask?: boolean;
  /**
   * WARNING: Available and required for the applePay field only.
   *
   * Label displayed immediately after the "Pay" button on the Apple Pay payment window.
   */
  label?: string;
  /**
   * Warning:  Available for the applePay and googlePay fields only.
   *
   * The text that will appear on the Apple Pay/Google Pay button type.
   *
   * Defaults to pay.
   */
  type?: 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'continue';
  /**
   * WARNING:  Available for the applePay and googlePay fields only.
   *
   * The button color.
   *
   * The Apple Pay default is "white-outline" - see the Apple Pay guidelines.
   *
   * The Google Pay default is "black" - see the Google Pay guidelines.
   */
  color?: 'black' | 'white' | 'white-outline';
  /**
   * Limits payments to cards from specific countries.
   *
   * two-letter ISO 3166 country code array
   */
  supportedCountries?: string[];
}>>;

export interface SetupOptions {
  /**
   * The payment currency of the merchant account, for example, USD for US dollars.
   *
   * That currency code will be used to preload the merchant configurations like supported card brands and transaction salvage.
   *
   * When there is a single account configured for that currency and payment type, it will be used for tokenization.
   */
  currencyCode?: string;
  /**
   * Environment to use for all tokenization and logging calls; either:
   *
   * LIVE – used for Production
   *
   * TEST – used for the Test or sandbox environment
   */
  environment?: Environment;
  /** Configuration for the specified fields. */
  fields?: Fields;
  style?: Style;
  /** The maximum time (in milliseconds; default is 5000) that the SDK will wait for the iframes to get ready before returning an error. */
  initializationTimeout?: number;
  /** The threshold value is specific to transaction salvage flow. Specifies the maximum decline rate of a card bin. */
  threshold?: number;
  /**
   * The accounts which will be used to preload the merchant configurations from the admin portal when the merchant is configured for multiple accounts from the same Currency.
   *
   * If accounts value is not provided, Paysafe JS will try to guess the account for setup based on the merchant configuration in the admin portal.
   */
  accounts?: {
    /**
     * The account will be used for all payment types if anything else is not provided.
     *
     * It is required if accounts object is provided
     */
    default: number;
    /**
     * The account will be used for Apple Pay integration.
     *
     * By default, if no applePay account is provided, the value from accounts.default will be used.
     */
    applePay?: number;
    /**
     * The account will be used for Google Pay integration.
     *
     * By default, if no google pay account is provided, the value from accounts.default will be used.
     */
    googlePay?: number;
  };
}

export interface SetupError {
  /** Error code */
  code: string;
  /** Error message for display to customers */
  displayMessage: string;
  /** Detailed description of the error (this information should not be displayed to customers). */
  detailedMessage: string;
  /** Unique error ID to be provided to Paysafe Support during investigation. */
  correlationId: string;
}

export const isSetupError = (val: unknown): val is SetupError => {
  return typeof val === 'object' && val !== null
    && 'code' in val && typeof val.code === 'string'
    && 'displayMessage' in val && typeof val.displayMessage === 'string'
    && 'detailedMessage' in val && typeof val.detailedMessage === 'string'
    && 'correlationId' in val && typeof val.correlationId === 'string';
};
