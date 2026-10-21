import { useState, useCallback, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import MobileNumberInput from "../../../UI-Elements/Input-Elements/MobileNumInput";
import EmailInput from "../../../UI-Elements/Input-Elements/EmailInput";
import OtpInput from "./OtpInput";

import { initialSigninState } from "./utils";
import { sendSigninOtp, verifySignInOtp } from "../../../../services/auth/auth";
import { showToast } from "../../../UI-Elements/Toast";

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_EMAIL
} from "../../../UI-Elements/Input-Elements/input-validators";

import { WonBillsContext } from "../../../../store/WonBillsContext";
import { BtnTag } from "../../../UI-Elements/Input-Elements/Input-tags";

const SigninForm = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserRole, setUserID, setCompanyName, setBusinessLogo } =
    useContext(WonBillsContext);

  const [signinDetails, setSigninDetails] = useState(initialSigninState);
  const [isOtpInputOpen, setIsOtpInputOpen] = useState(false);
  const [timer, setTimer] = useState(180);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  /* ---------------- OTP TIMER ---------------- */
  useEffect(() => {
    if (!isOtpInputOpen) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOtpInputOpen(false);   // 👈 hide OTP input
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOtpInputOpen]);

  /* ---------------- INPUT HANDLER ---------------- */
  const handleInputChange = useCallback((field, val, isValid) => {
    setSigninDetails((prev) => ({
      ...prev,
      [field]: { value: val, isValid }
    }));

    if (field === "identifier") {
      setIsBlocked(false);
      setIsOtpInputOpen(false);
      setTimer(180);
    }
  }, []);

  /* ---------------- TYPE SWITCH ---------------- */
  const handleTypeSwitch = (type) => {
    if (type === signinDetails.type.value) return;

    setSigninDetails({
      ...initialSigninState,
      type: { value: type, isValid: true }
    });

    setIsOtpInputOpen(false);
    setIsBlocked(false);
    setTimer(180);
  };

  /* ---------------- GET OTP ---------------- */
  const GetOtpHandler = async () => {
    if (loading || isBlocked) return;
    setLoading(true);

    try {
      if (!signinDetails.identifier.isValid) {
        showToast.error("Enter a valid identifier");
        return;
      }

      const res = await sendSigninOtp({
        identifier: signinDetails.identifier.value,
        type: signinDetails.type.value
      });

      if (res?.data?.success) {
        showToast.success(res.data.message);
        setIsOtpInputOpen(true);
        setTimer(180);
      }

    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 403) {
        // setIsBlocked(true);
        setIsOtpInputOpen(false);
        setTimer(180);
        showToast.error(
          message || "Account is disabled. Please contact support."
        );
      } else {
        showToast.error(message || "Error sending OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOTP = async () => {
    if (loading || isBlocked) return;
    setLoading(true);

    try {
      if (!signinDetails.otp.isValid) {
        showToast.error("Invalid OTP");
        return;
      }

      const res = await verifySignInOtp({
        identifier: signinDetails.identifier.value,
        type: signinDetails.type.value,
        otp: signinDetails.otp.value
      });

      if (!res?.data?.success) {
        showToast.error(res?.data?.message || "OTP verification failed");
        return;
      }

      const { user } = res.data;
      if (!user?.reference_id) {
        throw new Error("Invalid user payload");
      }

      setUserID(user.reference_id);
      setUserRole(user.role);
      setIsLoggedIn(true);
      setCompanyName(user?.company_name);
      setBusinessLogo(user?.logo)

      showToast.success(res.data.message);
      navigate("/dashboard");

    } catch (error) {
      showToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ENTER KEY SUPPORT ---------------- */
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (loading || isBlocked) return;

    if (isOtpInputOpen) {
      verifyOTP();
    } else {
      GetOtpHandler();
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div
      className="
      w-full
      flex
      justify-center
      items-center
      outline-none
    "
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="
        w-full
        max-w-md
        bg-white
        rounded-3xl
        p-5
        sm:p-6
        shadow-2xl
      "
      >
        {/* HEADER */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-1">
          Sign In
        </h2>
        <h3 className="text-xs sm:text-sm font-light text-gray-600 text-center mb-6">
          Welcome back — let’s get to work
        </h3>

        {/* TYPE SWITCH */}
        <section className="flex h-10 border-2 border-blue-400 rounded-full overflow-hidden mb-4">
          {["phone", "email"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeSwitch(type)}
              className={`
              flex-1 text-sm sm:text-base font-semibold
              transition
              ${signinDetails.type.value === type
                  ? "bg-blue-400 text-white"
                  : "bg-white text-gray-700"
                }
            `}
            >
              {type === "phone" ? "Phone" : "Email"}
            </button>
          ))}
        </section>

        {/* IDENTIFIER INPUT */}
        {signinDetails.type.value === "phone" ? (
          <MobileNumberInput
            value={signinDetails.identifier.value}
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(10)]}
            onChangeVal={(v, ok) =>
              handleInputChange("identifier", v, ok)
            }
          />
        ) : (
          <EmailInput
            value={signinDetails.identifier.value}
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
            onChangeVal={(v, ok) =>
              handleInputChange("identifier", v, ok)
            }
          />
        )}

        {/* BLOCKED MESSAGE */}
        {isBlocked && (
          <p className="mt-2 text-sm text-center text-red-500 font-semibold">
            Your account is disabled. Please contact support.
          </p>
        )}

        {/* OTP INPUT */}
        {isOtpInputOpen && !isBlocked && (
          <OtpInput
            onOtpChange={(v, ok) =>
              handleInputChange("otp", v, ok)
            }
          />
        )}

        {/* ACTION BUTTON */}

        <BtnTag
          type="button"
          disabled={
            loading ||
            !signinDetails.identifier.isValid ||
            isBlocked
          }
          loading={loading}
          onClick={isOtpInputOpen ? verifyOTP : GetOtpHandler}
          styles="mt-4
          w-full
          py-2.5
          rounded-xl
          bg-blue-600
          text-white
          font-semibold
          transition"
        >
          {isBlocked
            ? "Account Disabled"
            : isOtpInputOpen
              ? "Verify OTP"
              : timer === 0
                ? "Resend OTP"
                : "Get OTP"}

        </BtnTag>

        {/* TIMER */}
        {isOtpInputOpen && !isBlocked && (
          <p className="text-center font-semibold text-gray-600 text-sm mt-2">
            Resend OTP in{" "}
            <strong className="text-red-400">
              {Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, "0")}
            </strong>
          </p>
        )}

        {/* SIGNUP LINK */}
        <p className="text-center text-xs sm:text-sm mt-3 text-gray-600">
          Don&apos;t have an account?
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline ml-1"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );


};

export default SigninForm;
