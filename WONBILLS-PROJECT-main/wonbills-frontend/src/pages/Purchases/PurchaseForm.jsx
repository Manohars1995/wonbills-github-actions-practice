import React, { useCallback, useEffect, useState } from 'react';
import FormHeader from '../../components/UI-Components/Forms/FormHeader';
import Form from '../../components/UI-Components/Forms/Purchase/Form';
import { useNavigate, useParams } from 'react-router-dom';
import {
    initialPurchaseState,
    mapInvoiceLiteListApiToFormState,
    isFormValid,
    mapPaymentApiToFormState
} from '../../components/UI-Components/Forms/Purchase/utils';
import { extractFormValues } from '../../components/UI-Components/Forms/sharedUtils';
import { showToast } from '../../components/UI-Elements/Toast';
import {
    createPurchase,
    updatePurchase,
    getPurchaseById
} from '../../services/purchases/purchases';
import { getActiveInvoices } from '../../services/invoices/invoices';
import FormSkeleton from '../../components/UI-Elements/Loaders/FormSkeleton';
import SEO from '../../components/SEO';

const PurchaseForm = () => {
    const { id = "new" } = useParams();
    const navigate = useNavigate();

    const optional_fields = [
        ...(id === "new" ? ["custom_id", "_id"] : ["_id"]),
        "cheque_number",
        "payment_reference_number",
        "schedule_date",
        "notes"
    ];

    const conditionalRules = [
        {
            field: "cheque_number",
            dependsOn: "mode_of_payment",
            when: (mode) => mode === "cheque"
        }
    ];

    const [paymentDetails, setPaymentDetails] = useState({
        ...initialPurchaseState
    });
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invsLoading, setInvLoading] = useState(false);

    /* ---------------- Fetch purchase (edit mode) ---------------- */
    useEffect(() => {
        if (id !== "new") {
            fetchPayment(id);
        }
    }, [id]);

    const fetchPayment = async (id) => {
        try {
            const res = await getPurchaseById({ id });
            if (res?.data?.success) {
                setPaymentDetails(
                    mapPaymentApiToFormState(res.data.data)
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- Load invoices ---------------- */
    useEffect(() => {
        let isMounted = true;

        const loadInvoices = async (invoiceId) => {
            setInvLoading(true);
            try {
                const res = await getActiveInvoices(invoiceId);

                if (!isMounted) return;

                if (res?.data?.success) {
                    setInvoices(
                        mapInvoiceLiteListApiToFormState(res.data.data)
                    );
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    showToast.error("Something went wrong");
                }
            } finally {
                if (isMounted) setInvLoading(false);
            }
        };

        // NEW purchase → only active invoices
        if (id === "new") {
            loadInvoices();
        }

        // EDIT purchase → wait for invoice_id
        if (
            id !== "new" &&
            paymentDetails?.invoice_id?.value
        ) {
            loadInvoices(paymentDetails.invoice_id.value);
        }

        return () => {
            isMounted = false;
        };
    }, [id, paymentDetails?.invoice_id?.value]);

    /* ---------------- Input handling ---------------- */
    const handleInputChange = useCallback((field, val, isValid) => {
        setPaymentDetails((prev) => {
            const updated = {
                ...prev,
                [field]: { value: val, isValid },
            };

            if (field === "mode_of_payment") {
                updated.schedule_date = { value: "", isValid: true };
            }

            return updated;
        });
    }, []);

    /* ---------------- Validation ---------------- */
    const result = isFormValid(
        paymentDetails,
        optional_fields,
        conditionalRules
    );

    /* ---------------- Submit ---------------- */
    const onSubmitHandler = async () => {
        if (!result.isValid) {
            showToast.error("Fill required fields to continue.");
            return;
        }

        setLoading(true);
        const payload = extractFormValues(paymentDetails);

        if (payload.schedule_date) {
            payload.payment_state = "scheduled";
        }

        if (payload.payment_state === "received") {
            payload.status = "closed";
        }

        try {
            if (id === "new") {
                const res = await createPurchase({ payload });
                if (res?.data?.success) {
                    showToast.success("Purchase created successfully.");
                }
            } else {
                const res = await updatePurchase({
                    id: payload._id,
                    payload
                });
                if (res?.data?.success) {
                    showToast.success("Purchase updated successfully.");
                }
            }
            navigate('/purchases');
        } catch (err) {
            console.error(err);
            showToast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <FormSkeleton count={8} notesCount={2} />;
    }

    return (
        <>
            <SEO
                title="Create/Edit Purchase"
                noIndex={true}
            />
            <div className="h-full w-full flex flex-col">
                <FormHeader
                    header={`Purchase-${id === 'new' ? 'New' : id}`}
                    status={paymentDetails?.status?.value}
                    onStatusChange={handleInputChange}
                />

                <Form
                    ID={id}
                    invoices={invoices}
                    paymentDetails={paymentDetails}
                    onChange={handleInputChange}
                    onSubmit={onSubmitHandler}
                    loading={loading}
                    invsLoading={invsLoading}
                />
            </div>
        </>
    );
};

export default PurchaseForm;
