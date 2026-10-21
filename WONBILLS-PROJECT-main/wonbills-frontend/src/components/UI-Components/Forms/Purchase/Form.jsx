import React from 'react';
import AvtarImage from '../AvatarImage';
import FormFields from './FormFields';
import { BtnTag } from '../../../UI-Elements/Input-Elements/Input-tags';
import { Link } from 'react-router-dom';


const Form = ({
  ID = '',
  invoices = [],
  paymentDetails = [],
  onChange = (() => { }),
  onSubmit = (() => { }),
  loading = false,
  invsLoading = false
}) => {
  return (
    <div className="flex-1 h-full flex flex-col px-3  ">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <form className="min-h-full">
          <FormFields
            ID={ID}
            invoices={invoices}
            PurchaseState={paymentDetails}
            onChange={onChange}
            invsLoading={invsLoading}
          />
        </form>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-white pt-3 pb-2  flex flex-col items-end gap-1">
        <BtnTag
          type="button"
          BtnText={ID === 'new' ? 'Submit' : 'Update'}
          loading={loading}
          disabled={paymentDetails?.status?.value === 'closed'}
          onClick={onSubmit}
          styles="bg-[#3965FF] w-60 h-10 text-white border-2 border-[#3965FF] hover:bg-[#2F52CC] transition-all duration-200"
        />

        <p className="text-xs text-right max-w-md">
          <strong className="text-xl">*</strong>{" "}
          Note: Online payments require{" "}
          <Link to="/settings" className="text-blue-700 font-semibold">KYC verification</Link>.
        </p>
      </div>

      {/* 🔒 Interaction blocker */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#3965FF] font-medium">
            <span className="loader" />
            Submitting<span className="typing-dots" />
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(Form);

