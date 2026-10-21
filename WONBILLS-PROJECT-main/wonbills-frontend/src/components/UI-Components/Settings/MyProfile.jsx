import React, { useEffect, useState, useRef } from "react";
import Accordion from "../../UI-Elements/Accordion";
import {
  BtnTag,
  InputTag,
  PhoneInputTag
} from "../../UI-Elements/Input-Elements/Input-tags";
import AvtarImage from "../Forms/AvatarImage";

import { getProfile, updateProfile } from "../../../services/user/user";
import { showToast } from "../../UI-Elements/Toast";
import InputSkeleton from "../../UI-Elements/Loaders/InputSkeleton";
import AvatarSkeleton from "../../UI-Elements/Loaders/AvatarSkeleton";
import BtnSkeleton from "../../UI-Elements/Loaders/ButtonSkeleton";
import { mapProfileApiToFormState } from "./utils";
import { extractFormValues, isFormValid } from "../Forms/sharedUtils";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_REQUIRE
} from "../../UI-Elements/Input-Elements/input-validators";

const OPTIONAL_FIELDS = ["profile_picture", "national_id"];

const MyProfile = () => {
  const [profile, setProfile] = useState({
    custom_id: { value: "", isValid: false },
    first_name: { value: "", isValid: false },
    last_name: { value: "", isValid: false },
    contact_number: { value: "", isValid: false },
    email: { value: "", isValid: false },
    national_id: { value: "", isValid: false },
    profile_picture: { value: "", isValid: false }
  });

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const originalPayloadRef = useRef(null);

  // ✅ NEW: explicit dirty state
  const [isDirty, setIsDirty] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProfile();

      if (res?.data?.success) {
        const mapped = mapProfileApiToFormState(res.data.data || {});
        setProfile(mapped);

        const extracted = extractFormValues(mapped);
        originalPayloadRef.current = extracted;

        setIsDirty(false); // reset dirty
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChangeInputHandler = (field, value, isValid) => {
    setProfile((prev) => ({
      ...prev,
      [field]: { value, isValid }
    }));

    setIsDirty(true); // ✅ key fix
  };

  const validation = isFormValid(profile, OPTIONAL_FIELDS);

  const onSubmitHandler = async () => {
    if (!validation.isValid) {
      showToast.error("Fill required fields to continue.");
      return;
    }

    if (!isDirty) {
      showToast.info("No changes detected.");
      return;
    }

    const currentPayload = extractFormValues(profile);

    setLoading2(true);
    try {
      const res = await updateProfile({ payload: currentPayload });

      if (res?.data?.success) {
        showToast.success("Updated successfully.");

        originalPayloadRef.current = currentPayload;
        setIsDirty(false); // reset dirty after success
      }
    } catch (err) {
      console.error(err);
      showToast.error("Something went wrong.");
    } finally {
      setLoading2(false);
    }
  };

  return (
    <section>
      <Accordion
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-gray-900">
              My Profile
            </span>

            {profile?.custom_id?.value && (
              <span className="relative inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full bg-gray-100 border border-gray-200">
                {profile.custom_id.value}
              </span>
            )}
          </div>
        }
        place="top"
      >
        {loading ? (
          <div className="w-full flex flex-col items-center">
            <AvatarSkeleton />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full mt-3">
              {[...Array(4)].map((_, i) => (
                <InputSkeleton key={i} />
              ))}
            </div>

            <div className="w-full flex justify-end mt-4">
              <BtnSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <AvtarImage
                value={profile.profile_picture.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("profile_picture", v, isValid)
                }
              />
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <InputTag
                id="first_name"
                label="First Name"
                value={profile.first_name.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("first_name", v, isValid)
                }
                readonly
                validators={[VALIDATOR_REQUIRE()]}
              />

              <InputTag
                id="last_name"
                label="Last Name"
                value={profile.last_name.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("last_name", v, isValid)
                }
                readonly
                validators={[VALIDATOR_REQUIRE()]}
              />

              <PhoneInputTag
                id="contact_number"
                label="Phone Number"
                value={profile.contact_number.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("contact_number", v, isValid)
                }
                readonly
                validators={[
                  VALIDATOR_REQUIRE(),
                  VALIDATOR_MAXLENGTH(13)
                ]}
              />

              <InputTag
                id="email"
                label="Email"
                type="email"
                value={profile.email.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("email", v, isValid)
                }
                readonly
                validators={[
                  VALIDATOR_REQUIRE(),
                  VALIDATOR_EMAIL()
                ]}
              />

              <InputTag
                id="national_id"
                label="National ID"
                value={profile.national_id.value}
                onChangeVal={(v, isValid) =>
                  onChangeInputHandler("national_id", v, isValid)
                }
              />
            </div>

            {/* Button */}
            <div className="flex justify-end mt-6">
              <BtnTag
                type="button"
                BtnText="Update"
                loading={loading2}
                disabled={
                  loading2 ||
                  !validation.isValid ||
                  !isDirty // ✅ key fix
                }
                onClick={onSubmitHandler}
                styles="bg-[#3965FF] w-full sm:w-60 h-10 text-white border-2 border-[#3965FF] hover:bg-[#2F52CC]"
              />
            </div>
          </>
        )}
      </Accordion>
    </section>
  );
};

export default React.memo(MyProfile);