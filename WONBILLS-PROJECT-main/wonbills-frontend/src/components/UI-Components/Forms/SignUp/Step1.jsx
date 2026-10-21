import React, { useState, useEffect } from "react";
import { BtnTag, InputTag } from "../../../UI-Elements/Input-Elements/Input-tags";
import MobileNumberInput from "../../../UI-Elements/Input-Elements/MobileNumInput";
import EmailInput from "../../../UI-Elements/Input-Elements/EmailInput";
import OtpInput from "../SignIn/OtpInput";
import { sendOtpSignUp, verifyOtpSignUp } from "../../../../services/auth/auth";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MIN,
  VALIDATOR_REQUIRE
} from "../../../UI-Elements/Input-Elements/input-validators";
import { showToast } from "../../../UI-Elements/Toast";
import { GoVerified } from "react-icons/go";
import { formatTime } from "./utils";

const OTP_TIMER_DURATION = 180; // seconds

const Step1 = ({
  phoneVerified,
  emailVerified,
  onPhoneVerified,
  onEmailVerified,
  userState,
  setUserState
}) => {
  /* ---------------- PHONE STATES ---------------- */
  const [phoneOtpRequested, setPhoneOtpRequested] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);

  /* ---------------- EMAIL STATES ---------------- */
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  /* ---------------- PHONE TIMER ---------------- */
  useEffect(() => {
    if (!phoneOtpRequested) return;

    const interval = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhoneOtpRequested(false); // 👈 hide OTP input
          setPhoneOtp("");            // 👈 clear OTP
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phoneOtpRequested]);


  /* ---------------- EMAIL TIMER ---------------- */
  useEffect(() => {
    if (!emailOtpRequested) return;

    const interval = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEmailOtpRequested(false); // 👈 hide OTP input
          setEmailOtp("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [emailOtpRequested]);


  /* ---------------- PHONE HANDLERS ---------------- */
  const handleSendPhoneOtp = async () => {
    if (!userState?.phone?.value) {
      showToast.error("Please enter phone number");
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await sendOtpSignUp({
        identifier: userState.phone.value,
        type: "phone"
      });

      if (res?.data?.success) {
        setPhoneOtpRequested(true);
        setPhoneTimer(OTP_TIMER_DURATION);
        setPhoneOtp("");
        showToast.success("OTP sent successfully");
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 6) {
      showToast.error("Please enter valid OTP");
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await verifyOtpSignUp({
        identifier: userState.phone.value,
        type: "phone",
        otp: phoneOtp
      });

      if (res?.data?.success) {
        onPhoneVerified();
        showToast.success("Phone verified successfully");
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setPhoneLoading(false);
    }
  };

  /* ---------------- EMAIL HANDLERS ---------------- */
  const handleSendEmailOtp = async () => {
    if (!userState?.email?.value) {
      showToast.error("Please enter email");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await sendOtpSignUp({
        identifier: userState.email.value,
        type: "email"
      });

      if (res?.data?.success) {
        setEmailOtpRequested(true);
        setEmailTimer(OTP_TIMER_DURATION);
        setEmailOtp("");
        showToast.success("OTP sent successfully");
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      showToast.error("Please enter valid OTP");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await verifyOtpSignUp({
        identifier: userState.email.value,
        type: "email",
        otp: emailOtp
      });

      if (res?.data?.success) {
        onEmailVerified();
        showToast.success("Email verified successfully");
      }
    } catch (err) {
      showToast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const isPhoneReady =
    userState?.phone?.value && userState.phone.value.length === 10;

  const isEmailReady =
    userState?.email?.value && userState?.email?.isValid;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex flex-col">
      <h2 className="text-md font-semibold">Personal Details</h2>
      <p className="text-xs text-gray-400 mb-4">
        Your Next Invoice is Just a Click Away!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <InputTag
          label="First Name *"
          value={userState?.first_name?.value}
          onChangeVal={(v, isValid) =>
            setUserState("first_name", v, isValid)
          }
        />

        <InputTag
          label="Last Name *"
          value={userState?.last_name?.value}
          onChangeVal={(v, isValid) =>
            setUserState("last_name", v, isValid)
          }
        />

        {/* PHONE */}
        <div className="flex flex-col items-center">
          <MobileNumberInput
            label="Phone *"
            disabled={phoneVerified}
            value={userState?.phone?.value}
            onChangeVal={(v, isValid) =>
              setUserState("phone", v, isValid)
            }
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MIN(10)]}
          />

          {!phoneOtpRequested && !phoneVerified && (
            <BtnTag
              disabled={!isPhoneReady}
              loading={phoneLoading}
              onClick={handleSendPhoneOtp}
              styles="mt-2 w-full max-w-xs"
            >
              Get OTP
            </BtnTag>
          )}

          {phoneOtpRequested && !phoneVerified && (
            <>
              <OtpInput onOtpChange={setPhoneOtp} identifier='mobile number' />

              <BtnTag
                loading={phoneLoading}
                disabled={!phoneOtp}
                onClick={handleVerifyPhoneOtp}
                styles="mt-2 w-full max-w-xs"
              >
                Verify OTP
              </BtnTag>

              {phoneTimer > 0 ? (
                <p className="text-xs text-gray-500 mt-2">
                  Resend OTP in{" "}
                  <span className="font-semibold text-blue-600">
                    {formatTime(phoneTimer)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  className="text-xs text-blue-600 mt-2 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </>
          )}

          {phoneVerified && (
            <p className="text-green-600 bg-green-100 text-sm px-2 py-1 rounded-md mt-2 flex items-center gap-2">
              Phone verified <GoVerified size={16} />
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="flex flex-col items-center">
          <EmailInput
            label="Email *"
            disabled={!phoneVerified || emailVerified}
            value={userState?.email?.value}
            onChangeVal={(v, isValid) =>
              setUserState("email", v, isValid)
            }
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
          />

          {!emailOtpRequested && phoneVerified && !emailVerified && (
            <BtnTag
              disabled={!isEmailReady}
              loading={emailLoading}
              onClick={handleSendEmailOtp}
              styles="mt-2 w-full max-w-xs"
            >
              Get OTP
            </BtnTag>
          )}

          {emailOtpRequested && !emailVerified && (
            <>
              <OtpInput onOtpChange={setEmailOtp} identifier='Email' />

              <BtnTag
                loading={emailLoading}
                disabled={!emailOtp}
                onClick={handleVerifyEmailOtp}
                styles="mt-2 w-full max-w-xs"
              >
                Verify OTP
              </BtnTag>

              {emailTimer > 0 ? (
                <p className="text-xs text-gray-500 mt-2">
                  Resend OTP in{" "}
                  <span className="font-semibold text-blue-600">
                    {formatTime(emailTimer)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  className="text-xs text-blue-600 mt-2 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </>
          )}

          {emailVerified && (
            <p className="text-green-600 bg-green-100 text-sm px-2 py-1 rounded-md mt-2 flex items-center gap-2">
              Email verified <GoVerified size={16} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Step1);
