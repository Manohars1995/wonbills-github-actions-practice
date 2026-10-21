import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../UI-Elements/Accordion";
import {
    BtnTag,
    InputTag,
} from "../../UI-Elements/Input-Elements/Input-tags";
import { extractFormValues, isFormValid } from "../Forms/sharedUtils";
import { mapKycApiToFormState, KYC_STATUS_CONFIG } from "./utils";
import { getKycDetails, updateKycDetails } from "../../../services/user/user";
import { showToast } from "../../UI-Elements/Toast";
import InputSkeleton from "../../UI-Elements/Loaders/InputSkeleton";
import ButtonSkeleton from "../../UI-Elements/Loaders/ButtonSkeleton";
import { VALIDATOR_IFSC, VALIDATOR_REQUIRE } from "../../UI-Elements/Input-Elements/input-validators";
import KYCStatusBadge from "../../UI-Elements/KYCStatusBadge";



const KycDetails = () => {
    const [kycDetails, setKycDetails] = useState({
        account_holder_name: { value: "", isValid: false },
        account_number: { value: "", isValid: false },
        ifsc_code: { value: "", isValid: false },
        razorpay_account_status: { value: "", isValid: true },
    });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    // Holds original payload snapshot
    const originalPayloadRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getKycDetails();

            if (res?.data?.success) {
                const mapped = mapKycApiToFormState(res.data.data || {});
                setKycDetails(mapped);

                //  Save original extracted payload
                originalPayloadRef.current = extractFormValues(mapped);
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
        setKycDetails((prev) => ({
            ...prev,
            [field]: { value, isValid }
        }));
    };

    const validation = isFormValid(kycDetails, ["razorpay_account_status"]);

    const onSubmitHandler = async () => {
        if (!validation.isValid) {
            showToast.error("Fill required fields to continue.");
            return;
        }

        const currentPayload = extractFormValues(kycDetails);

        // No changes detected
        if (
            JSON.stringify(currentPayload) ===
            JSON.stringify(originalPayloadRef.current)
        ) {
            showToast.info("No changes detected.");
            return;
        }

        setLoading2(true);
        try {
            const res = await updateKycDetails({ payload: currentPayload });
            if (res?.data?.success) {
                showToast.success("Updated successfully.");
                originalPayloadRef.current = currentPayload; // refresh baseline
            }
        } catch (err) {
            console.error(err);
            showToast.error("Something went wrong.");
        } finally {
            setLoading2(false);
        }
    }



    return (
        <section>
            <Accordion
                title={
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">KYC Details</span>
                        <KYCStatusBadge
                            status={kycDetails?.razorpay_account_status?.value}
                        />
                    </div>
                }
            >
                <div className="mb-2">
                    <h4 className="font-bold text-black/70">
                        Fund Account Details
                    </h4>
                </div>

                {loading ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full mt-3">
                            {[...Array(3)].map((_, i) => (
                                <InputSkeleton key={i} />
                            ))}
                        </div>

                        <div className="w-full flex justify-end mt-4">
                            <ButtonSkeleton />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* FORM FIELDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4 mt-3">
                            <InputTag
                                id="account_holder_name"
                                label="Account Holder Name"
                                value={kycDetails.account_holder_name.value}
                                onChangeVal={(v, isValid) =>
                                    onChangeInputHandler(
                                        "account_holder_name",
                                        v,
                                        isValid
                                    )
                                }
                                readonly={
                                    kycDetails?.razorpay_account_status?.value ===
                                    "activated"
                                }
                                validators={[VALIDATOR_REQUIRE()]}
                            />

                            <InputTag
                                id="ifsc_code"
                                label="IFSC Code"
                                value={kycDetails.ifsc_code.value}
                                onChangeVal={(v, isValid) =>
                                    onChangeInputHandler(
                                        "ifsc_code",
                                        v.toUpperCase(),
                                        isValid
                                    )
                                }
                                validators={[
                                    VALIDATOR_REQUIRE(),
                                    VALIDATOR_IFSC(),
                                ]}
                                readonly={
                                    kycDetails?.razorpay_account_status?.value ===
                                    "activated"
                                }
                                styles="uppercase"
                            />

                            <InputTag
                                id="account_number"
                                label="Account Number"
                                value={kycDetails.account_number.value}
                                onChangeVal={(v, isValid) =>
                                    onChangeInputHandler(
                                        "account_number",
                                        v,
                                        isValid
                                    )
                                }
                                readonly={
                                    kycDetails?.razorpay_account_status?.value ===
                                    "activated"
                                }
                                validators={[VALIDATOR_REQUIRE()]}
                            />
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end mt-6">
                            <BtnTag
                                type="button"
                                BtnText="Update"
                                loading={loading2}
                                disabled={
                                    !validation?.isValid ||
                                    kycDetails?.razorpay_account_status?.value ===
                                    "activated"
                                }
                                onClick={onSubmitHandler}
                                styles="
                                bg-[#3965FF]
                                w-full sm:w-60
                                h-10
                                text-white
                                border-2
                                border-[#3965FF]
                                hover:bg-[#2F52CC]
                            "
                            />
                        </div>
                    </>
                )}
            </Accordion>
        </section>
    );

};

export default React.memo(KycDetails);
