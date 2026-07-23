/** Example implementation - not part of the library */

import type { FC } from 'react';
import { useFormContext } from './lib/useFormContext';

interface Props {
  id: string;
}

export const ApplePayForm: FC<Props> = ({ id }) => {
  const { setupKey } = useFormContext();

  return <div id={`apple-pay_${id}_${setupKey}`} />;
};
