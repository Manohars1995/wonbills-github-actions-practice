import React, { useState, useRef, useCallback } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { BtnTag } from "../../../UI-Elements/Input-Elements/Input-tags";
import {
  initialState,
  BTN_CONTINUE,
  BTN_SUBMIT,
  extractFormValues,
} from "./utils";
import usePostcodeAutofill from "../../../../hooks/usePostcodeAutofill";
import { registerUser } from "../../../../services/auth/auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isFormValid } from "../sharedUtils";

const optionalFields = ["street"];
const SUBMIT_ID = "SUBMIT_ID_";

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userDetails, setUserDetails] = useState({ ...initialState });

    const manuallyEditedRef = useRef({ state: false, city: false, street: false });


   const handleAutofill = useCallback((data) => {
    setUserDetails((prev) => ({
      ...prev,
      state: manuallyEditedRef.current.state
        ? prev.state
        : { value: data?.state || "", isValid: true },
      city: manuallyEditedRef.current.city
        ? prev.city
        : { value: data?.city || "", isValid: true },
      street: manuallyEditedRef.current.street
        ? prev.street
        : { value: data?.street || "", isValid: true },
    }));
  }, []);

  const { loading: postCodeLoading } = usePostcodeAutofill({
    postcode: userDetails?.postcode?.value,
    onAutofill: handleAutofill,
  });
  /* ---------------- Handlers ---------------- */
  const onChangeHandler = (field, val, isValid) => {
    if (field === "state" || field === "city" || field === "street") {
      manuallyEditedRef.current[field] = true;
    }
    setUserDetails((prev) => ({
      ...prev,
      [field]: { value: val, isValid },
    }));
  };

  const canProceed = phoneVerified && emailVerified;

  const result = isFormValid(userDetails, optionalFields);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!result.isValid) {
      toast.error("fill required fields to continue.", {
        id: SUBMIT_ID,
      });
      return;
    }

    if (!userDetails?.agreed_to_terms?.value) {
      toast.error("Please accept terms and conditions to proceed.", {
        id: SUBMIT_ID,
      });
      return;
    }

    setLoading(true);

    const payload = extractFormValues(userDetails);

    try {
      const res = await registerUser({ userData: payload });

      if (res?.data?.success) {
        toast.success("Account created successfully.", {
          id: SUBMIT_ID,
        });

        setUserDetails({ ...initialState });

        setTimeout(() => {
          navigate("/signin");
        }, 1000);
      }
    } catch (err) {
      console.error("Register error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage, {
        id: SUBMIT_ID,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="w-full flex justify-center max-h-full items-start">
      <div
        className="
        w-full
        max-w-3xl
        bg-white
        rounded-3xl
        shadow-xl
        p-4
        sm:p-6
        flex
        flex-col
        max-h-[90vh]
      "
      >
        {/* TITLE */}
        <h1 className="font-bold text-xl sm:text-2xl text-blue-1000 text-center">
          SIGN UP
        </h1>

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* STEP INDICATOR */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 my-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`
              text-xs
              px-3 py-1
              rounded-full
              border-2
              font-semibold
              ${
                step === 1
                  ? "bg-blue-900 text-white border-blue-900"
                  : "text-gray-400 border-gray-300"
              }
            `}
            >
              1. Personal Details
            </button>

            <div className="hidden sm:block h-px w-10 bg-gray-300" />

            <div
              className={`
              text-xs
              px-3 py-1
              rounded-full
              border-2
              font-semibold
              ${
                step === 2
                  ? "bg-blue-900 text-white border-blue-900"
                  : "text-gray-400 border-gray-300"
              }
            `}
            >
              2. Business Details
            </div>
          </div>

          {/* STEP CONTENT */}
          <div className="flex-1 overflow-y-auto pr-1">
            {step === 1 && (
              <Step1
                phoneVerified={phoneVerified}
                emailVerified={emailVerified}
                onPhoneVerified={() => setPhoneVerified(true)}
                onEmailVerified={() => setEmailVerified(true)}
                userState={userDetails}
                setUserState={onChangeHandler}
              />
            )}

            {step === 2 && (
              <Step2
                userState={userDetails}
                setUserState={onChangeHandler}
                postCodeLoading={postCodeLoading}
              />
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-400">
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <Link to="/signin" className="text-blue-600 font-medium">
                Sign in
              </Link>
            </p>

            {step === 1 && (
              <BtnTag
                disabled={!canProceed}
                onClick={() => setStep(2)}
                styles={`px-6 border-2 ${BTN_CONTINUE}`}
              >
                Continue
              </BtnTag>
            )}

            {step === 2 && (
              <BtnTag
                type="submit"
                disabled={!result.isValid || loading}
                styles={`px-8 border-2 ${BTN_SUBMIT}`}
                loading={loading}
                BtnText="Submit"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
