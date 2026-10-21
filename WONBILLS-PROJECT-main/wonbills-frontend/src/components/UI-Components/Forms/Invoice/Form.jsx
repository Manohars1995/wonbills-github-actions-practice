import FormFields from './FormFields';
import ItemsComponent from './ItemsComponent';
import { BtnTag } from '../../../UI-Elements/Input-Elements/Input-tags';
import React, { useCallback } from 'react';

const Form = ({
  ID = 'new',
  invoiceDetails = {},
  onChange = (() => { }),
  onSubmit = (() => { }),
  itemsHandler = (() => { }),
  items = [],
  onChangeQuantity = (() => { }),
  onRemoveItem = (() => { }),
  clients,
  loading = false
}) => {

  const toPaise = (val) => {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  };

  const fromPaise = (val) => {
    return (val / 100).toFixed(2); // string for UI
  };

  const grandTotal = useCallback(() => {
    const items = invoiceDetails.items?.value || [];

    const totalPaise = items.reduce((acc, item) => {
      return acc + toPaise(item?.total);
    }, 0);

    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalPaise / 100);

    return {
      paise: totalPaise,           // for backend / calculations
      amount: totalPaise / 100,   // numeric rupees if needed
      formatted                   // UI display
    };
  }, [invoiceDetails.items]);


  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col px-3">
      <form className='flex-1'>
        <FormFields
          clients={clients}
          invoiceDetails={invoiceDetails}
          onChange={onChange}
        />

        <ItemsComponent
          items={items}
          invoiceDetails={invoiceDetails}
          onChange={itemsHandler}
          onChangeQuantity={onChangeQuantity}
          onRemoveItem={onRemoveItem}
        />

        <div className="w-full flex justify-between mt-4">
          <div className="h-10 col-span-2 flex justify-between items-center px-3 rounded-xl bg-blue-100">
            <h3>Grand Total :</h3>
            <p className="font-semibold">
              ₹ {grandTotal().formatted}
            </p>
          </div>
          <p></p>
          <BtnTag
            type='button'
            BtnText={ID === 'new' ? 'Submit' : 'Update'}
            loading={loading}
            onClick={onSubmit}
            styles='bg-[#3965FF] w-60 h-10 text-white border-2 border-[#3965FF] hover:bg-[#2F52CC] transition-all duration-200'
            disabled={invoiceDetails?.status?.value === 'closed'}
          />
        </div>

        {/* Interaction blocker */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#3965FF] font-medium">
              <span className="loader" />
              Submitting<span className="typing-dots" />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default React.memo(Form);
