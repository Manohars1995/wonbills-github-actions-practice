import React, { useState } from "react";
import Accordion from "../../UI-Elements/Accordion";
import { InputTag, BtnTag } from "../../UI-Elements/Input-Elements/Input-tags";
import { RiSendPlaneFill } from "react-icons/ri";
import {
    VALIDATOR_EMAIL,
    VALIDATOR_REQUIRE
} from "../../UI-Elements/Input-Elements/input-validators";
import { toast } from "sonner";
import { sendInvite } from "../../../services/shared/shared";

const Invite = () => {
    const [email, setEmail] = useState({
        value: "",
        isValid: false
    });

    const [loading, setLoading] = useState(false);

    const onChangeHandler = (value, isValid) => {
        setEmail({ value, isValid });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!email.isValid || !email.value || loading) return;

        setLoading(true);
        try {
            const res = await sendInvite({ email: email.value });
            if (res?.data?.success) {
                toast.success("Invite sent successfully");
                setEmail({ value: "", isValid: false });
            } else {
                toast.error(res?.data?.message || "Failed to send invite");
            }
        } catch (err) {
            toast.error("Something went wrong while sending invite");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <Accordion title="Invite">
                <form
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    onSubmit={submitHandler}
                >
                    <InputTag
                        id="email"
                        label="Email ID"
                        type="email"
                        validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
                        value={email.value}
                        onChangeVal={onChangeHandler}
                    />

                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end mt-4">
                        <BtnTag
                            type="submit"
                            BtnText={loading ? "Sending..." : "Send Invite"}
                            disabled={!email.isValid || loading}
                            styles={`
                            w-full sm:w-48 h-10
                            text-white border-2
                            ${email.isValid && !loading
                                    ? "bg-[#3965FF] border-[#3965FF] hover:bg-[#2F52CC]"
                                    : "bg-gray-400 border-gray-400 cursor-not-allowed"
                                }
                        `}
                        >
                            <RiSendPlaneFill size={22} />
                        </BtnTag>
                    </div>
                </form>
            </Accordion>
        </section>
    );

};

export default React.memo(Invite);
