export interface TokenizeOptions {
  /**
   * The payment amount is in minor units to charge the customer's card. Use the correct minor units amount for the merchant account currency.
   *
   * For example, to process US $10.99, this value should be 1099. To process 1000 Japanese Yen, this value should be 1000. To process 10.139 Tunisian dinar, this value should be 10139.
   *
   * Min = 1
   *
   * Max = 999999999
   *
   * When using 3DS 2 (i.e. useThreeDSecureVersion2= true), amount with value: "0" can be passed.
   */
  amount: number;
  /**
   * This specifies the transaction type for which the Payment Handle is created. Possible values are:
   *
   * PAYMENT - Payment Handle is created to continue the Payment.
   *
   * STANDALONE_CREDIT - Payment Handle is created to continue the standalone credit.
   *
   * ORIGINAL_CREDIT - Payment Handle is created to continue the original credit.
   *
   * VERIFICATION - Payment Handle is created to continue the verification request.
   */
  transactionType: 'PAYMENT' | 'STANDALONE_CREDIT' | 'ORIGINAL_CREDIT' | 'VERIFICATION';
  /** This is the payment type associated with this Payment Handle. */
  paymentType: 'CARD' | 'APPLEPAY' | 'GOOGLEPAY';
  /** A unique identifier is provided by the merchant for every transaction from Paysafe JS. */
  merchantRefNum: string;
  /** Additional customer data associated with the single-use handle from the Customer Vault. */
  customerDetails: {
    /**
     * Name of the cardholder, maximum 160 characters.
     *
     * When using 3DS 2 (i.e. useThreeDSecureVersion2= true) and supported card brand for 3DS 2, the holder name is required and should be between 2 and 160 characters.
     */
    holderName?: string;
    /** Card billing address - additional details for the billingDetails object can be found in the Payments API documentation. */
    billingDetails?: {
      /** Country of billing address */
      country: string;
      /** Zip code of the address */
      zip: string;
      /** State/province/region of the address */
      state?: string;
      /** City in which the address is located */
      city?: string;
      /** The first line of the street address */
      street?: string;
      /** The second line of the street address */
      street2?: string;
      /** The phone number of the customer */
      phone?: string;
      /** The nickname of the customer */
      nickname?: string;
    };
    /** This is the profile of the customer - additional details for the profile object can be found in the Payments API documentation. */
    profile?: {
      /** This is the customer’s first name. */
      firstName?: string;
      /** This is the customer’s lastt name. */
      lastName?: string;
      /** This is the customer’s locale. */
      locale?: 'ca_en' | 'en_US' | 'fr_CA' | 'en_GB';
      /** This is the customer’s date of birth. */
      dateOfBirth?: {
        /** The day on which the customer is born. */
        day: number;
        /** The year in which the customer is born. */
        year: number;
        /** The month in which the customer is born. */
        month: number;
      };
      /** This is the customer’s email address. */
      email?: string;
      /** This is the customer’s phone number. */
      phone?: string;
    };
  };
  /**
   * This is a merchant descriptor that is displayed on a customer’s card statement.
   */
  merchantDescriptor?: {
    /**
     * This is a merchant descriptor that is displayed on a customer’s card statement
     * */
    dynamicDescriptor: string;
    /**
     * This is the merchant’s phone number, which is appended to the merchant descriptor on a customer’s card statement.
     */
    phone?: string;
  };
  /**
   * The id of the selected merchant account to use to process the payment.
   *
   * If you are a merchant, then this field is required only if you have more than one account configured for the same payment method and currency. If you are a partner using a shared API key, then this field is mandatory.
   *
   * If an account is provided on setup, this one will override it.
   */
  accountId?: number;
  threeDs?: {
    /** This is the fully qualified URL of the merchant's commercial or customer care website. */
    merchantUrl: string;
    /** This is the type of channel interface used to initiate the transaction. */
    deviceChannel: 'BROWSER' | 'SDK' | '3RI';
    /**
     * Specifies whether this instance of Paysafe.js should implement 3DS 2. If true and accountId is not configured for 3DS 2, an error will be returned in the callback.
     *
     * If omitted, defaults to false.
     */
    useThreeDSecureVersion2?: boolean;
    /**
     * Indicates the type of Authentication request. This data element provides additional information to the ACS to determine the best approach for handing an authentication request.
     *
     * If omitted, defaults to PAYMENT_TRANSACTION.
     */
    authenticationPurpose?: 'PAYMENT_TRANSACTION' | 'INSTALMENT_TRANSACTION';
    /**
     * Indicates the maximum number of authorizations permitted for installment payments.
     *
     * Min = 1
     *
     * Max = 999
     *
     * Required when authenticationPurpose = INSTALMENT_TRANSACTION.
     */
    maxAuthorizationsForInstalmentPayment?: number;
    /**
     * Billing cycle information for recurring payments.
     *
     * Required when authenticationPurpose = INSTALMENT_TRANSACTION.
     */
    billingCycle?: {
      /** This is the date after which no further authorizations will be performed. The ISO 8601 date format is expected, i.e., YYYY-MM-DD. */
      endDate: string;
      /**
       * This is the minimum number of days between authorizations.
       *
       * Min = 1
       *
       * Max = 999
       */
      frequency: number;
    };
    /** This is the electronic delivery information. */
    electronicDelivery?: {
      /** This indicates whether there is an electronic delivery for the product. The electronicDelivery object is optional; however, if the object is used, this element is required. */
      isElectronicDelivery: boolean;
      /**
       * This is the email address to which the merchandise was delivered.
       *
       * length <= 240 chars
       */
      email: string;
    };
    /** This is the customer profile. */
    profile?: {
      /**
       * This is the email address of the customer.
       *
       * length <= 255 chars
       */
      email?: string;
      /**
       * This is the customer's primary phone.
       *
       * length <= 40 chars
       */
      phone?: string;
      /**
       * This is the customer's cell phone.
       *
       * length <= 40 chars
       */
      cellphone?: string;
    };
    /**
     * This is the category of the message for a specific use case.
     *
     * If omitted, defaults to PAYMENT.
     */
    messageCategory?: 'PAYMENT' | 'NON_PAYMENT';
    /** This indicates whether a challenge is requested for this transaction. */
    requestorChallengePreference?: 'CHALLENGE_MANDATED' | 'CHALLENGE_REQUESTED' | 'NO_PREFERENCE';
    /** This identifies the type of transaction being authenticated. This element is required only in certain markets, e.g., Brazil. */
    transactionIntent?: 'GOODS_OR_SERVICE_PURCHASE' | 'CHECK_ACCEPTANCE' | 'ACCOUNT_FUNDING' | 'QUASI_CASH_TRANSACTION' | 'PREPAID_ACTIVATION';
    /** This is the date and time of the purchase. The ISO 8601 date format is expected i.e., YYYY-MM-DD-THH:MM:SSZ. Note: This element is required only if messageCategory=NON_PAYMENT and authenticationPurpose=INSTALMENT_TRANSACTION or RECURRING_TRANSACTION. */
    initialPurchaseTime?: string;
    /** These are the details of a previously made purchase or preorder. */
    orderItemDetails?: {
      /** For a pre-ordered purchase, this is the date that the merchandise is expected to be available. The ISO 8601 date format is expected, i.e., YYYY-MM-DD. */
      preOrderItemAvailabilityDate?: string;
      /** This indicates whether the cardholder is placing an order for available merchandise or merchandise with a future availability or release date. */
      preOrderPurchaseIndicator?: 'MERCHANDISE_AVAILABLE' | 'FUTURE_AVAILABILITY';
      /** This indicates whether the cardholder is reordering merchandise. */
      reorderItemsIndicator?: 'FIRST_TIME_ORDER' | 'REORDER';
      /** This is the shipping method for the transaction. */
      shippingIndicator?: 'SHIP_TO_BILLING_ADDRESS' | 'SHIP_TO_VERIFIED_ADDRESS' | 'SHIP_TO_DIFFERENT_ADDRESS' | 'SHIP_TO_STORE' | 'DIGITAL_GOODS' | 'TRAVEL_AND_EVENT_TICKETS' | 'OTHER';
    };
    /** These are the details of a previously made gift card purchase. */
    purchasedGiftCardDetails?: {
      /**
       * This is the amount of the gift card, in minor units.
       *
       * Max = 99999999999
       */
      amount: number;
      /**
       * This is the total count of individual prepaid or gift cards or codes purchased.
       *
       * Max = 99
       */
      count: number;
      /** Three character code for the currency of the gift card – for example, USD for US dollars. */
      currency: string;
    };
    /** These are the user account details from the merchant website. */
    userAccountDetails?: {
      /** This is the date when the cardholder opened the account with the 3DS Requestor. The ISO 8601 date format is expected, i.e., YYYY-MM-DD. */
      createdDate?: string;
      /** This is the length of time between the cardholder opening the account with the 3DS Requestor and the API call of the current transaction. */
      createdRange?: 'DURING_TRANSACTION' | 'NO_ACCOUNT' | 'LESS_THAN_THIRTY_DAYS' | 'THIRTY_TO_SIXTY_DAYS' | 'MORE_THAN_SIXTY_DAYS';
      /** This is the date that the cardholder’s account with the 3DS Requestor was last changed. The ISO 8601 date format is expected, i.e., YYYY-MM-DD. */
      changedDate?: string;
      /** This is the length of time between the most recent change to the cardholder’s account information and the API call of the current transaction. */
      changedRange?: 'MORE_THAN_SIXTY_DAYS' | 'DURING_TRANSACTION' | 'LESS_THAN_THIRTY_DAYS' | 'THIRTY_TO_SIXTY_DAYS';
      /** This is the date when the cardholder’s account was reset or the password was changed. The ISO 8601 date format is expected, i.e., YYYY-MM-DD. */
      passwordChangedDate?: string;
      /** This is the length of time between the most recent password change or cardholder account reset and the API call of the current transaction. */
      passwordChangedRange?: 'MORE_THAN_SIXTY_DAYS' | 'NO_CHANGE' | 'DURING_TRANSACTION' | 'LESS_THAN_THIRTY_DAYS' | 'THIRTY_TO_SIXTY_DAYS';
      /**
       * This is the total number of purchases from this cardholder account in the previous six months.
       *
       * Max = 9999
       */
      totalPurchasesSixMonthCount?: number;
      /**
       * This is the number of Add Card attempts in the last 24 hours.
       *
       * Max = 999
       */
      addCardAttemptsForLastDay?: number;
      /**
       * This is the number of transactions (successful and abandoned) for this cardholder account with the 3DS Requestor across all payment accounts in the previous 24 hours.
       *
       * Max = 999
       */
      transactionCountForPreviousDay?: number;
      /**
       * This is the number of transactions (successful and abandoned) for this cardholder account with the 3DS Requestor across all payment accounts in the previous year.
       *
       * Max = 999
       */
      transactionCountForPreviousYear?: number;
      /** This indicates whether the 3DS Requestor has experienced suspicious activity, including previous fraud, on the cardholder account. */
      suspiciousAccountActivity?: boolean;
      /** This is the shipping usage information. */
      shippingDetailsUsage?: {
        cardHolderNameMatch?: boolean;
        initialUsageDate?: string;
        initialUsageRange?: 'MORE_THAN_SIXTY_DAYS' | 'CURRENT_TRANSACTION' | 'LESS_THAN_THIRTY_DAYS' | 'THIRTY_TO_SIXTY_DAYS';
      };
      /** These are the details of the current payment account of the cardholder. */
      paymentAccountDetails?: {
        createdDate?: string;
        createdRange?: 'MORE_THAN_SIXTY_DAYS' | 'NO_ACCOUNT' | 'DURING_TRANSACTION' | 'LESS_THAN_THIRTY_DAYS' | 'THIRTY_TO_SIXTY_DAYS';
      };
      /** This is the cardholder login information. */
      userLogin?: {
        /**
         * This field is reserved for future iterations of 3D Secure 2.
         *
         * length <= 2048 chars
         */
        data?: string;
        /** This is the mechanism used by the cardholder to authenticate to the 3DS Requestor. */
        authenticationMethod?: 'THIRD_PARTY_AUTHENTICATION' | 'NO_LOGIN' | 'INTERNAL_CREDENTIALS' | 'FEDERATED_ID' | 'ISSUER_CREDENTIALS' | 'FIDO_AUTHENTICATOR';
        /** This is the date and time of the cardholder authentication. The ISO 8601 date format is expected, i.e., YYYY-MM-DD-THH:MM:SSZ. */
        time?: string;
      };
      /** This is the previous authentication information used with current merchant, cardholder, and card. */
      priorThreeDSAuthentication?: {
        /**
         * This field is reserved for future iterations of 3D Secure 2.
         *
         * length <= 2048 chars
         */
        data?: string;
        /** This is the mechanism used previously by the cardholder to authenticate to the 3DS Requestor. */
        method?: 'FRICTIONLESS_AUTHENTICATION' | 'ACS_CHALLENGE' | 'AVS_VERIFIED' | 'OTHER_ISSUER_METHOD';
        /**
         * This is a previous authentication ID for the cardholder.
         *
         * length <= 36 chars
         */
        id?: string;
        /** This is the date and time of the cardholder authentication. The ISO 8601 date format is expected, i.e., YYYY-MM-DD-THH:MM:SSZ. */
        time?: string;
      };
      /** These are the Amex-specific travel details. */
      travelDetails?: {
        /**
         * This indicates whether the transaction is an air travel related purchase, e.g., a ticket purchase.
         *
         * If omitted, defaults to false.
         */
        isAirTravel?: boolean;
        /**
         * This is the selected airline carrier.
         *
         * Note: This element is required only if isAirTravel=true.
         *
         * length <= 256 chars
         */
        airlineCarrier?: string;
        /**
         * This is the date of departure in the time zone of the departure location. The ISO 8601 date format is expected, i.e., YYYY-MM-DD.
         *
         * Note: This element is required only if isAirTravel=true.
         */
        departureDate?: string;
        /**
         * This is the airport code of the destination airport.
         *
         * Note: This element is required only if isAirTravel=true.
         *
         * length <= 5 chars
         */
        destination?: string;
        /**
         * This is the airport code of the originating airport.
         *
         * Note: This element is required only if isAirTravel=true.
         *
         * length <= 5 chars
         */
        origin?: string;
        /**
         * This is the first name of the cardholder from the billing details.
         *
         * Note: This element is required only if isAirTravel=true.
         *
         * length <= 99 chars
         */
        passengerFirstName?: string;
        /**
         * This is the last name of the cardholder from the billing details.
         *
         * Note: This element is required only if isAirTravel=true.
         *
         * length <= 99 chars */
        passengerLastName?: string;
      };
    };
    /** Whether 3DS 1 should be forced during the 3DS 2 flow. */
    force3DS1?: boolean;
  };
  /**
   * Specify how any external authorization windows will be opened (3DS etc.)
   *
   * IFRAME
   *
   * NEW_TAB
   */
  openAs?: 'IFRAME' | 'NEW_TAB';
  /** Additional data for the Apple Pay payment method. Must be provided if paymentType = APPLEPAY */
  applePay?: never;
  /** Additional data for the Google Pay payment method. Must be provided if paymentType = GOOGLEPAY */
  googlePay?: never;
  /** This is the singleUseCustomerToken that the merchant generated using the Create a Single-Use Customer Token request. */
  singleUseCustomerToken?: string;
  /** This is single-use payment handle associated with the customer. */
  paymentTokenFrom?: string;
}

export interface TokenizationResult {
  token: string;
}

export interface ErorrResponse {
  code: string;
  displayMessage: string;
  detailedMessage: string;
  correlationId: string;
  fieldErrors?: {
    field: string;
    message: string;
  }[];
}

export const isErrorResponse = (value: unknown): value is ErorrResponse => {
  return typeof value === 'object' && value !== null
    && 'code' in value && typeof value.code === 'string'
    && 'displayMessage' in value && typeof value.displayMessage === 'string'
    && 'detailedMessage' in value && typeof value.detailedMessage === 'string'
    && 'correlationId' in value && typeof value.correlationId === 'string'
    && (('fieldErrors' in value && Array.isArray(value.fieldErrors) && value.fieldErrors.every((f: unknown) => {
      return typeof f === 'object' && f !== null
        && 'field' in f && typeof f.field === 'string'
        && 'message' in f && typeof f.message === 'string';
    })) || (!('fieldErrors' in value)));
};
