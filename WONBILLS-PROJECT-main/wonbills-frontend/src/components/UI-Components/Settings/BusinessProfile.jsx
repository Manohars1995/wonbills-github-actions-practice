import React, { useCallback, useEffect, useRef, useState } from "react";
import Accordion from "../../UI-Elements/Accordion";
import { InputTag } from "../../UI-Elements/Input-Elements/Input-tags";
import AvtarImage2 from "../Forms/AvatarImage2";
import { mapBusinessProfileApiToFormState, updateNestedField } from "./utils";
import { extractFormValues } from "../Forms/sharedUtils";
import { getBusinessProfile, uploadLogoSig } from "../../../services/user/user";
import { toast } from "sonner";

const BusinessProfile = () => {
    const [businessProfile, setBusinessProfile] = useState({
        name: { value: "", isValid: false },
        registration_number: { value: "", isValid: false },
        tax_number: { value: "", isValid: false },
        type: { value: "", isValid: false },
        category: { value: "", isValid: false },
        subcategory: { value: "", isValid: false },
        address: {
            country: { value: "", isValid: false },
            state: { value: "", isValid: false },
            city: { value: "", isValid: false },
            postcode: { value: "", isValid: false }
        },
        company_logo: { value: "", isValid: true },
        signature: { value: "", isValid: true }
    });

    const [loading, setLoading] = useState(false);
    const originalPayloadRef = useRef(null);

    /* ---------------- FETCH ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getBusinessProfile();
                if (res?.data?.success) {
                    const mapped = mapBusinessProfileApiToFormState(res.data.data || {});
                    setBusinessProfile(mapped);
                    originalPayloadRef.current = extractFormValues(mapped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ---------------- SAVE IMAGE URL ---------------- */
    const saveImageUrl = async (field, url) => {
        try {
            const res = await uploadLogoSig({ [field]: url });
            if (res?.data?.success) {
                toast.success("Saved successfully");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save");
        }
    };

    /* ---------------- STATE UPDATE (SINGLE SOURCE) ---------------- */
    const onChangeInputHandler = useCallback(
        async (fieldPath, val, isValid) => {
            // 1. Update UI state
            setBusinessProfile((prev) =>
                updateNestedField(prev, fieldPath, () => ({
                    value: val,
                    isValid
                }))
            );

            // 2. Persist image URL immediately (only for images)
            if (fieldPath === "company_logo" || fieldPath === "signature") {
                await saveImageUrl(fieldPath, val);
            }
        },
        []
    );

    const formatSnakeCase = (value = "") =>
        value
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());

    /* ---------------- UI ---------------- */
    return (
        <section>
            <Accordion title="Business Profile">
                {/* BUSINESS DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
                    <InputTag
                        label="Business Reg Name"
                        value={businessProfile.name.value}
                        readonly
                    />

                    <InputTag
                        label="Business Reg No"
                        value={businessProfile.registration_number.value}
                        readonly
                    />

                    <InputTag
                        label="Reg Tax No"
                        value={businessProfile.tax_number.value}
                        readonly
                    />

                    <InputTag
                        label="Company Type"
                        value={formatSnakeCase(businessProfile.type.value)}
                        readonly
                    />

                    <InputTag
                        label="Category"
                        value={formatSnakeCase(businessProfile.category.value)}
                        readonly
                    />

                    <InputTag
                        label="Sub Category"
                        value={formatSnakeCase(businessProfile.subcategory.value)}
                        readonly
                    />

                    <InputTag
                        label="Country"
                        value={businessProfile.address.country.value}
                        readonly
                    />

                    <InputTag
                        label="State"
                        value={businessProfile.address.state.value}
                        readonly
                    />

                    <InputTag
                        label="City"
                        value={businessProfile.address.city.value}
                        readonly
                    />

                    <InputTag
                        label="Zip Code"
                        value={businessProfile.address.postcode.value}
                        readonly
                    />
                </div>

                {/* IMAGE UPLOADS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                    <AvtarImage2
                        title="Company Logo"
                        value={businessProfile.company_logo.value}
                        onChangeVal={(val) =>
                            onChangeInputHandler("company_logo", val, true)
                        }
                    />

                    <AvtarImage2
                        title="Signature"
                        value={businessProfile.signature.value}
                        onChangeVal={(val) =>
                            onChangeInputHandler("signature", val, true)
                        }
                    />
                </div>
            </Accordion>
        </section>
    );

};

export default React.memo(BusinessProfile);
