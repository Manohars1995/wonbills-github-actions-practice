import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormSkeleton from "../../components/UI-Elements/Loaders/FormSkeleton";
import Form from "../../components/UI-Components/Forms/Client/Form";
import SEO from "../../components/SEO";

import {
    initialClientData,
    isFormValid,
    updateNestedField,
    extractFormValues,
    mapClientApiToFormState
} from "../../components/UI-Components/Forms/Client/utils";

import { createClient, updateClient, getClientById } from "../../services/clients/client";
import { showToast } from "../../components/UI-Elements/Toast";

import FormHeader2 from "../../components/UI-Components/Forms/FormHeader2";



const ClientForm = () => {
    const { id = "new" } = useParams();
    const navigate = useNavigate()

    const optional_fields = [
        ...(id === "new" ? ["custom_id", "_id"] : ["_id"]),
        "profile_picture",
        "status",
        "same_as_ofc",
        "notes",
    ];

    const [clientDetails, setClientDetails] = useState({
        ...initialClientData
    });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    useEffect(() => {
        if (id !== 'new') {
            fetchClient(id)
        }
    }, [])

    const fetchClient = async (cId) => {
        setLoading(true);
        try {
            const res = await getClientById({ cId });
            if (res?.data?.success) {
                const mappedState = mapClientApiToFormState(res?.data?.data);
                setClientDetails(mappedState);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    /* ---------- input handler ---------- */
    const handleInputChange = useCallback((fieldPath, val, isValid) => {
        setClientDetails((prev) =>
            updateNestedField(prev, fieldPath, () => ({
                value: val,
                isValid
            }))
        );
    }, []);

    // ---------- validation ---------- 
    const result = isFormValid(clientDetails, optional_fields);

    // ---------- submit ---------- 
    const onSubmitHandler = async () => {

        if (!result.isValid) {
            showToast.error("Fill required fields to continue.");
            return;
        }

        setLoading2(true);
        const payload = extractFormValues(clientDetails);

        try {
            if (id === "new") {
                const res = await createClient({ payload });
                if (res?.data?.success) {
                    showToast.success("Client created successfully.");
                }
            } else {
                const res = await updateClient({ cId: id, payload });
                if (res?.data?.success) {
                    showToast.success("Client updated successfully.");
                }
            }
            navigate('/clients');
        } catch (err) {
            console.error(err);
            showToast.error("Something went wrong.");
        } finally {
            setLoading2(false);
        }
    };

    if (loading) {
        return (
            <FormSkeleton profile={true} />
        )
    }

    return (
        <>
            <SEO
                title="Create/Edit Client"
                noIndex={true}
            />
            <div className="max-h-full w-full flex flex-col gap-y-3">
                <FormHeader2
                    header={`Client-${id === "new" ? "New" : id}`}
                    checked={clientDetails?.status?.value}
                    setChecked={handleInputChange}
                />

                <Form
                    ID={id}
                    clientDetails={clientDetails}
                    onChange={handleInputChange}
                    onSubmit={onSubmitHandler}
                    loading={loading2}
                />
            </div>
        </>
    );
};

export default ClientForm;
