/** Example implementation - not part of the library */

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useFormContext } from './lib/useFormContext';

interface Validity {
  fields: {
    CardNumber: boolean;
    Cvv: boolean;
    ExpiryDate: boolean;
  };
  allValid: boolean;
}

interface Props {
  id: string;
}

export const InnerForm: FC<Props> = ({ id }) => {
  const { initialized, setupKey, instance } = useFormContext();
  const [ validity, setValidity ] = useState<Validity>({
    fields: {
      CardNumber: false,
      Cvv: false,
      ExpiryDate: false,
    },
    allValid: false,
  });

  useEffect(() => {
    if (!instance) {
      return;
    }

    let active = true;

    instance.fields('Cvv CardNumber ExpiryDate').on('Valid Invalid', function (this: HTMLElement, _, event) {
      if (!active) {
        return;
      }

      this.classList.toggle('is-invalid', event.type === 'Invalid');
      this.classList.toggle('is-valid', event.type === 'Valid');

      setValidity(v => {
        const fields = {
          ...v.fields,
          [event.target.fieldName]: event.type === 'Valid',
        };
        return {
          ...v,
          fields,
          allValid: Object.values(fields).every(Boolean),
        };
      });
    });

    return () => { active = false; };
  }, [ instance ]);

  return (
    <>
      <div className="row gx-3 gy-2 mb-2">
        <div className="col-12">
          <div id={`cardNumber_${id}_${setupKey}`} className="form-control" style={{ height: 31 }} />
        </div>
        <div className="col-6">
          <div id={`cvv_${id}_${setupKey}`} className="form-control" style={{ height: 31 }} />
        </div>
        <div className="col-6">
          <div id={`expiryDate_${id}_${setupKey}`} className="form-control" style={{ height: 31 }} />
        </div>
      </div>
      <button type="submit" disabled={!initialized || !validity.allValid} className="btn btn-primary">Click Me</button>
    </>
  );
};
