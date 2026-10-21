import React, { useMemo } from 'react';
import {
  InputTag, ReactSelect
} from '../../../UI-Elements/Input-Elements/Input-tags';


const InvoiceDetails = React.memo(({ details, onChange = (() => { }), clients = [] }) => {

  const clientOptions = useMemo(() => {
    if (!Array.isArray(clients)) return [];

    return clients.map((client) => ({
      value: client._id,
      label: (
        <div className="flex justify-between">
          <h2 className="font-semibold text-sm">
            {client?.custom_id}
          </h2>
          <span className="text-xs text-black bg-blue-300 px-2 rounded-2xl flex items-center">
            {client?.client_name}
          </span>
        </div>
      ),
      meta: client
    }));
  }, [clients]);

  const selectedClient = useMemo(() => {
    return clientOptions.find(
      (opt) => opt.value === details?.client?.value
    ) || null;
  }, [clientOptions, details?.client?.value]);

  const isClosed =
    details?.status?.value === 'closed' ||
    details?.status?.value === 'inactive';




  return (
    <div >
      <h3 className='text-md font-bold text-black/70'>Item Details</h3>
      <div className='grid grid-cols-3 gap-3 mt-2'>

        <InputTag
          id="invoice_name"
          type='text'
          label="Name *"
          value={details?.invoice_name?.value}
          onChangeVal={(v, isValid) => onChange("invoice_name", v, isValid)}
          readonly={isClosed}
        />

        <ReactSelect
          id="client"
          label="Client *"
          options={clientOptions || []}
          value={selectedClient}
          onChange={(v, isValid) => {
            onChange("client", v, isValid)
          }}
          placeholder="Select Client"
          readonly={isClosed}
        />

        <InputTag
          id="due_date"
          type='date'
          label="Due Date *"
          styles='uppercase'
          value={details?.due_date?.value}
          onChangeVal={(v, isValid) => onChange("due_date", v, isValid)}
          min={new Date().toISOString().split('T')[0]} // today as minimum
          readonly={isClosed}
        />

        <InputTag
          id="valid_from"
          type='date'
          label="Valid from *"
          styles='uppercase'
          value={details?.valid_from?.value}
          onChangeVal={(v, isValid) => onChange("valid_from", v, isValid)}
          readonly={isClosed}
        />

        <InputTag
          id="valid_until"
          type='date'
          label="Valid Until *"
          styles='uppercase'
          value={details?.valid_until?.value}
          onChangeVal={(v, isValid) => onChange("valid_until", v, isValid)}
          readonly={isClosed}
        />

      </div>
    </div>

  )
})






const FormFields = ({ invoiceDetails, onChange = (() => { }), clients = [] }) => {

  return (
    <div className='h-fit'>
      <InvoiceDetails
        details={invoiceDetails}
        onChange={onChange}
        clients={clients}
      />
    </div>
  )
}

export default React.memo(FormFields)
