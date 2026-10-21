import React, { useEffect, useState } from 'react'
import { InputTag, ReactSelect } from '../../../UI-Elements/Input-Elements/Input-tags'
import { companyTypes, industryTypes, allSubCategories } from '../../../../shared/ConstData';
import Modal from '../../../UI-Elements/modals/Modal';
import TermsConditions from '../../Others/TermsConditions';

const Step2 = ({ userState, setUserState, postCodeLoading = false }) => {
  const [subCategory, setSubCategory] = useState([]);
  const [openTerms, setTermsOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);

  // ── Load countries on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/iso')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          const options = data.data
            .map((c) => ({
              value: c.Iso2,     // e.g. "IN"
              label: c.name,     // e.g. "India"
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setCountryOptions(options);
        } else {
          setCountryOptions([]);
        }
      })
      .catch((err) => console.error('Failed to load countries', err))
      .finally(() => setCountriesLoading(false));
  }, []);

  // ── Load states whenever country changes ─────────────────────────────────
  useEffect(() => {
    const countryCode = userState?.country?.value;
    if (!countryCode) {
      return;
    }

    const countryName = countryOptions.find((c) => c.value === countryCode)?.label;
    if (!countryName) return;

    // setStatesLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.states) {
          const options = data.data.states.map((s) => ({
            value: s.state_code || s.name,
            label: s.name,
          }));
          setStateOptions(options);
        } else {
          setStateOptions([]);
        }
      })
      .catch((err) => console.error('Failed to load states', err))
      .finally(() => setStatesLoading(false));
  }, [userState?.country?.value, countryOptions]);

  const onCategoryChange = (category) => {
    setSubCategory(allSubCategories[category] || []);
    setUserState('company_subcategory', null, true);
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-md font-semibold">Business Details</h2>
      <p className='text-xs text-gray-400 mb-4'>Build Your Profile, Build Your Success!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-3 pr-2 lg:p-0">

        <InputTag
          id="company_name"
          label="Company Name *"
          value={userState?.company_name?.value}
          onChangeVal={(val, isValid) => setUserState('company_name', val, isValid)}
        />
        <InputTag
          id="company_registration_no"
          label="Registration No *"
          value={userState?.company_reg_number?.value}
          onChangeVal={(val, isValid) => setUserState('company_reg_number', val, isValid)}
        />
        <InputTag
          id="gst_no"
          label="GST No *"
          value={userState?.company_tax_number?.value}
          onChangeVal={(val, isValid) => setUserState('company_tax_number', val, isValid)}
        />

        <ReactSelect
          id="business_type"
          label="Business Type *"
          options={companyTypes}
          value={companyTypes?.find((opt) => opt.value === userState?.company_type?.value)}
          onChange={(val, isValid) => setUserState('company_type', val, isValid)}
        />

        <ReactSelect
          id="category"
          label="Category *"
          options={industryTypes}
          value={industryTypes?.find((opt) => opt.value === userState?.company_category?.value)}
          onChange={(val, isValid) => {
            setUserState('company_category', val, isValid);
            onCategoryChange(val);
          }}
        />

        {userState?.company_category?.value === 'others' ? (
          <InputTag
            id='sub_category'
            label="Sub Category *"
            value={userState?.company_subcategory?.value}
            onChangeVal={(val, isValid) => setUserState('company_subcategory', val, isValid)}
          />
        ) : (
          <ReactSelect
            id="sub_category"
            label="Sub Category *"
            options={subCategory}
            value={subCategory?.find((opt) => opt.value === userState?.company_subcategory?.value)}
            onChange={(val, isValid) => setUserState('company_subcategory', val, isValid)}
          />
        )}

        <ReactSelect
          id="country"
          label="Country *"
          options={countryOptions}
          value={countryOptions.find((opt) => opt.value === userState?.country?.value) || null}
          onChange={(val, isValid) => {
            setUserState('country', val, isValid);
            setUserState('state', '', false); // reset state
            setStateOptions([]);
            if (val) setStatesLoading(true); // ← new line
          }}
          isLoading={countriesLoading}
        />

        <InputTag
          id='pincode'
          label="Zip Code *"
            max={6}
          value={userState?.postcode?.value}
          onChangeVal={(val, isValid) => setUserState('postcode', val.replace(/\D/g, ''), isValid)}
          loading={postCodeLoading}
        />

        <ReactSelect
          id="state"
          label="State *"
          options={stateOptions}
          value={stateOptions.find((opt) => opt.value === userState?.state?.value) || null}
          onChange={(val, isValid) => setUserState('state', val, isValid)}
          isLoading={statesLoading}
        />

        <InputTag
          id="city"
          label="City *"
          value={userState?.city?.value}
          onChangeVal={(val, isValid) => setUserState('city', val, isValid)}
        />

      </div>

      <label className="flex items-center gap-2 text-sm ml-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(userState?.agreed_to_terms?.value)}
          onChange={(e) => setUserState('agreed_to_terms', e.target.checked, true)}
          className="h-3 w-3 accent-blue-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <span>
          I agree to the{' '}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="underline text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-blue-400"
          >
            Terms & Conditions
          </button>
        </span>
      </label>

      <Modal isOpen={openTerms} onClose={() => setTermsOpen(false)} title="Terms & Privacy Policy">
        <TermsConditions />
      </Modal>
    </div>
  );
};

export default React.memo(Step2);