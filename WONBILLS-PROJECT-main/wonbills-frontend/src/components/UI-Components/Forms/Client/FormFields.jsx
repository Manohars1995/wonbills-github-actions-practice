import React, { useEffect, useState, useCallback } from 'react';
import {
  InputTag,
  PhoneInputTag,
  TextareaTag,
  ReactSelect
} from '../../../UI-Elements/Input-Elements/Input-tags';

// ─── Shared hook for country + state loading ───────────────────────────────
const useLocationData = (countryOptions) => {
  const [stateOptions, setStateOptions] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);

  // Triggered directly from the country <ReactSelect>'s onChange — not an
  // effect — so every setState call here is fine with the lint rule.
  const fetchStates = useCallback((countryValue) => {
    if (!countryValue) {
      setStateOptions([]);
      return;
    }
    const countryName = countryOptions.find((c) => c.value === countryValue)?.label;
    if (!countryName) {
      setStateOptions([]);
      return;
    }

    setStatesLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.states) {
          setStateOptions(
            data.data.states.map((s) => ({
              value: s.state_code || s.name,
              label: s.name,
            }))
          );
        } else {
          setStateOptions([]);
        }
      })
      .catch((err) => console.error('Failed to load states', err))
      .finally(() => setStatesLoading(false));
  }, [countryOptions]);

  return { stateOptions, statesLoading, fetchStates };
};
// ─── Shared hook: load countries once at top level ─────────────────────────
const useCountries = () => {
  const [countryOptions, setCountryOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/iso')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          const options = data.data
            .map((c) => ({ value: c.Iso2, label: c.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setCountryOptions(options);
        } else {
          setCountryOptions([]);
        }
      })
      .catch((err) => console.error('Failed to load countries', err))
      .finally(() => setCountriesLoading(false));
  }, []);

  return { countryOptions, countriesLoading };
};
// ──────────────────────────────────────────────────────────────────────────


// CLIENT DETAILS SECTION
const ClientDetailsSection = React.memo(({ details, onChange }) => {
  return (
    <div>
      <h3 className='text-md font-bold text-black/70'>Client Details</h3>

      <div className='grid grid-cols-3 gap-3 mt-2'>

        <InputTag
          id="client_name"
          type="text"
          label="Client Name *"
          value={details.client_name.value}
          onChangeVal={(v, isValid) => onChange("client_name", v, isValid)}
        />
        <InputTag
          id="trading_name"
          type="text"
          label="Trading Name *"
          value={details.trading_name.value}
          onChangeVal={(v, isValid) => onChange("trading_name", v, isValid)}
        />
        <InputTag
          id="registration_number"
          type="text"
          label="Business Registration No *"
          value={details.registration_number.value}
          onChangeVal={(v, isValid) => onChange("registration_number", v, isValid)}
        />
        <PhoneInputTag
          id="primary_no"
          label="Primary Contact *"
          value={details.mobile_number.value}
          onChangeVal={(v, isValid) => onChange("mobile_number", v, isValid)}
        />
        <PhoneInputTag
          id="secondary_no"
          label="Secondary Contact *"
          value={details.work_number.value}
          onChangeVal={(v, isValid) => onChange("work_number", v, isValid)}
        />
        <InputTag
          id="email"
          type="email"
          label="Email *"
          value={details.email.value}
          onChangeVal={(v, isValid) => onChange("email", v, isValid)}
        />
        <InputTag
          id="gst_reference"
          type="text"
          label="GST Number *"
          value={details.gst_reference.value}
          onChangeVal={(v, isValid) => onChange("gst_reference", v, isValid)}
        />
        <InputTag
          id="date_of_birth"
          type="date"
          label="Date Of Birth *"
          value={details.date_of_birth.value}
          onChangeVal={(v, isValid) => onChange("date_of_birth", v, isValid)}
          styles='uppercase'
        />
        <div className='col-span-3'>
          <TextareaTag
            label="Notes"
            value={details.notes.value}
            onChangeVal={(v, isValid) => onChange("notes", v, isValid)}
          />
        </div>

      </div>
    </div>
  );
});


// OFFICE ADDRESS SECTION
const OfficeAddressSection = React.memo(({ office, onChange, countryOptions, countriesLoading }) => {
  const { stateOptions, statesLoading, fetchStates } = useLocationData(countryOptions);

  return (
    <div className='mt-5'>
      <h3 className='text-md font-bold text-black/70'>Office Address</h3>

      <div className='grid grid-cols-3 gap-3 mt-2'>

               <ReactSelect
          id="office_country"
          label="Country *"
          options={countryOptions}
          value={countryOptions.find((opt) => opt.value === office.country.value) || null}
          onChange={(val, isValid) => {
            onChange("office_address.country", val, isValid);
            onChange("office_address.state", "", false);
            fetchStates(val);
          }}
          isLoading={countriesLoading}
        />

        <ReactSelect
          id="office_state"
          label="State *"
          options={stateOptions}
          value={stateOptions.find((opt) => opt.value === office.state.value) || null}
          onChange={(val, isValid) => onChange("office_address.state", val, isValid)}
          isDisabled={!office.country.value}
          isLoading={statesLoading}
        />

        <InputTag
          id="office_zip_code"
          label="Zip Code *"
          value={office.zip_code.value}
          onChangeVal={(v, isValid) => onChange("office_address.zip_code", v, isValid)}
        />
        <InputTag
          id="office_city"
          label="City *"
          value={office.city.value}
          onChangeVal={(v, isValid) => onChange("office_address.city", v, isValid)}
        />
        <InputTag
          id="office_street"
          label="Street *"
          value={office.street_name.value}
          onChangeVal={(v, isValid) => onChange("office_address.street_name", v, isValid)}
        />
        <InputTag
          id="office_flat_no"
          label="Flat No *"
          value={office.flat_no.value}
          onChangeVal={(v, isValid) => onChange("office_address.flat_no", v, isValid)}
        />
        <PhoneInputTag
          id="office_phone_no"
          label="Phone Number *"
          value={office.phone.value}
          onChangeVal={(v, isValid) => onChange("office_address.phone", v, isValid)}
        />

      </div>
    </div>
  );
});


// BILLING ADDRESS SECTION
const BillingAddressSection = React.memo(({ billing, office, sameAsOffice, onChange, countryOptions, countriesLoading }) => {
  const { stateOptions, statesLoading, fetchStates } = useLocationData(countryOptions);

  const handleCopyOffice = useCallback((checked) => {
    onChange("same_as_ofc", checked, true);
    if (!checked) return;
    Object.keys(office).forEach((key) => {
      onChange(`billing_address.${key}`, office[key].value, true);
    });
    fetchStates(office.country.value); // keep billing's state list in sync with the copied country
  }, [office, onChange, fetchStates]);

  return (
    <div className='mt-5'>
      <div className='w-full flex justify-between'>
        <h3 className='text-md font-bold text-black/70'>Billing Address</h3>
        <div className='flex gap-5'>
          <h4 className='text-black font-semibold'>Same as office address</h4>
          <input
            type="checkbox"
            checked={sameAsOffice}
            onChange={(e) => handleCopyOffice(e.target.checked)}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-3 mt-2'>

              <ReactSelect
          id="billing_country"
          label="Country *"
          options={countryOptions}
          value={countryOptions.find((opt) => opt.value === billing.country.value) || null}
          onChange={(val, isValid) => {
            onChange("billing_address.country", val, isValid);
            onChange("billing_address.state", "", false);
            fetchStates(val);
          }}
          isLoading={countriesLoading}
        />

        <ReactSelect
          id="billing_state"
          label="State *"
          options={stateOptions}
          value={stateOptions.find((opt) => opt.value === billing.state.value) || null}
          onChange={(val, isValid) => onChange("billing_address.state", val, isValid)}
          isDisabled={!billing.country.value}
          isLoading={statesLoading}
        />

        <InputTag
          id="billing_zip_code"
          label="Zip Code *"
          value={billing.zip_code.value}
          onChangeVal={(v, isValid) => onChange("billing_address.zip_code", v, isValid)}
        />
        <InputTag
          id="billing_city"
          label="City *"
          value={billing.city.value}
          onChangeVal={(v, isValid) => onChange("billing_address.city", v, isValid)}
        />
        <InputTag
          id="billing_street"
          label="Street *"
          value={billing.street_name.value}
          onChangeVal={(v, isValid) => onChange("billing_address.street_name", v, isValid)}
        />
        <InputTag
          id="billing_flat_no"
          label="Flat No *"
          value={billing.flat_no.value}
          onChangeVal={(v, isValid) => onChange("billing_address.flat_no", v, isValid)}
        />
        <PhoneInputTag
          id="billing_phone_no"
          label="Phone Number *"
          value={billing.phone.value}
          onChangeVal={(v, isValid) => onChange("billing_address.phone", v, isValid)}
        />

      </div>
    </div>
  );
});


// MAIN FORM FIELDS WRAPPER
const FormFields = ({ clientDetails, onChange = (() => { }) }) => {
  // Load countries ONCE here and pass down — avoids 3 separate fetch calls
  const { countryOptions, countriesLoading } = useCountries();

  return (
    <div className='h-full'>

      <ClientDetailsSection
        details={clientDetails}
        onChange={onChange}
      />

      <OfficeAddressSection
        office={clientDetails.office_address}
        onChange={onChange}
        countryOptions={countryOptions}
        countriesLoading={countriesLoading}
      />

      <BillingAddressSection
        billing={clientDetails.billing_address}
        office={clientDetails.office_address}
        sameAsOffice={clientDetails.same_as_ofc.value}
        onChange={onChange}
        countryOptions={countryOptions}
        countriesLoading={countriesLoading}
      />

    </div>
  );
};

export default FormFields;