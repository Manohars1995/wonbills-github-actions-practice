import React from 'react';
import {
  InputTag, TextareaTag,
  ReactSelect
} from '../../../UI-Elements/Input-Elements/Input-tags';
import { categoryOptions } from './utils';


const ItemDetails = React.memo(({ details, onChange = (() => { }) }) => {
  const isProductCategory = details?.category?.value === "product";
  
  return (
    <div >
      <h3 className='text-md font-bold text-black/70'>Item Details</h3>
      <div className='grid grid-cols-3 gap-3 mt-2'>

        <InputTag
          id="item_name"
          type='text'
          label="Item Name *"
          value={details?.item_name?.value}
          onChangeVal={(v, isValid) => onChange("item_name", v, isValid)}
        />

        <ReactSelect
          id="category"
          label="Category *"
          options={categoryOptions}
          value={categoryOptions?.find(
            (opt) => opt.value === details?.category?.value
          ) || null}
          onChange={(val, isValid) =>
            onChange("category", val, isValid)
          }
          placeholder="Select Category"
        />

        <InputTag
          id="serial_no"
          type='text'
          label="Serial Number *"
          value={details?.serial_no?.value}
          onChangeVal={(v, isValid) => onChange("serial_no", v, isValid)}
        />

        {isProductCategory && (
          <>
            <InputTag
              id="total_stock"
              type='number'
              label="Total Stock *"
              value={details?.total_stock?.value}
              onChangeVal={(v, isValid) => onChange("total_stock", v, isValid)}
            />

            <InputTag
              id="in_stock"
              type='number'
              label="In Stock *"
              value={details?.in_stock?.value}
              onChangeVal={(v, isValid) => onChange("in_stock", v, isValid)}
            />
          </>
        )}

        <InputTag
          id="value"
          type='number'
          label="Original Price *"
          value={details?.value?.value}
          onChangeVal={(v, isValid) => onChange("value", v, isValid)}
        />

        <InputTag
          id="taxation"
          type='number'
          label="Taxation(%) *"
          value={details?.taxation?.value}
          onChangeVal={(v, isValid) => onChange("taxation", v, isValid)}
        />

        <InputTag
          id="discount"
          type='number'
          label="Discount(%) *"
          value={details?.discount?.value}
          onChangeVal={(v, isValid) => onChange("discount", v, isValid)}
        />
        <InputTag
          id="final_price"
          type='number'
          label="Final Price *"
          value={details?.price?.value}
          onChangeVal={(v, isValid) => onChange("price", v, isValid)}
        />

        <InputTag
          id="start_date"
          type='date'
          label="Start Date *"
          styles='uppercase'
          value={details?.valid_from?.value}
          onChangeVal={(v, isValid) => onChange("valid_from", v, isValid)}
        />

        <InputTag
          id="end_date"
          type='date'
          label="End Date *"
          styles='uppercase'
          value={details?.valid_until?.value}
          onChangeVal={(v, isValid) => onChange("valid_until", v, isValid)}
        />
        <div className='col-span-3'>
          <div className='grid grid-cols-2 gap-3'>
            <TextareaTag
              id="description"
              label="Description"
              value={details?.description?.value}
              onChangeVal={(v, isValid) => onChange("description", v, isValid)}
            />

            <TextareaTag
              id="notes"
              label="Notes"
              value={details?.notes?.value}
              onChangeVal={(v, isValid) => onChange("notes", v, isValid)}
            />
          </div>
        </div>

      </div>
    </div>

  )
})




const FormFields = ({ itemDetails, onChange = (() => { }) }) => {

  return (
    <div className='h-full'>

      <ItemDetails
        details={itemDetails}
        onChange={onChange}
      />

    </div>
  )
}

export default React.memo(FormFields)
