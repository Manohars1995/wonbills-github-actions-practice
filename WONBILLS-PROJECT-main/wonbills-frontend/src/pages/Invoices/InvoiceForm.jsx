import React, { useCallback, useEffect, useState } from "react";
import FormHeader from "../../components/UI-Components/Forms/FormHeader";
import Form from "../../components/UI-Components/Forms/Invoice/Form";
import { useNavigate, useParams } from "react-router-dom";
import {
    initialInvoiceState,
    mapApiItemsToInvoiceItems,
    mapInvoiceApiToFormState
} from "../../components/UI-Components/Forms/Invoice/utils";
import { showToast } from "../../components/UI-Elements/Toast";
import {
    isFormValid,
    extractFormValues
} from "../../components/UI-Components/Forms/sharedUtils";
import {
    createInvoice,
    getInvoiceById,
    updateInvoice
} from "../../services/invoices/invoices";
import { getValidActiveItems } from "../../services/items/items";
import { getActiveClients } from "../../services/clients/client";
import FormSkeleton from "../../components/UI-Elements/Loaders/FormSkeleton";
import { toast } from "sonner";
import SEO from "../../components/SEO";

const VALID_DATE = 'valid_from_until'

const InvoiceForm = () => {
    const { id = "new" } = useParams();
    const navigate = useNavigate();

    const optional_fields = [...(id === "new" ? ["custom_id", "_id"] : ["_id"])];

    const [invoiceDetails, setInvoiceDetails] = useState({
        ...initialInvoiceState
    });
    const [items, setItems] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id !== "new") {
            fetchInvoice(id);
        }
    }, []);

    const fetchInvoice = async (id) => {
        try {
            const res = await getInvoiceById({ id });
            if (res?.data?.success) {
                const mappedState = mapInvoiceApiToFormState(res?.data?.data);
                setInvoiceDetails(mappedState);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadItems = async () => {
            try {
                const res = await getValidActiveItems();
                if (!isMounted) return;

                if (res?.data?.success) {
                    const mappedItems = mapApiItemsToInvoiceItems(res.data.items);
                    setItems(mappedItems);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    showToast.error("Something went wrong");
                }
            }
        };

        const loadClients = async () => {
            try {
                const res = await getActiveClients();
                if (!isMounted) return;

                if (res?.data?.success) {
                    // const mappedClients = mapApiItemsToInvoiceItems(res.data.clients);
                    setClients(res.data.clients || []);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    showToast.error("Something went wrong");
                }
            }
        };

        loadItems();
        loadClients();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = useCallback((field, val, isValid) => {
        setInvoiceDetails((prev) => {
            // Helper function to check if a date string is complete and valid
            const isCompleteDate = (dateStr) => {
                if (!dateStr || dateStr.length !== 10) return false;

                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return false;

                // Extract year from YYYY-MM-DD format
                const year = parseInt(dateStr.split('-')[0], 10);

                // Only consider it complete if year is reasonable (e.g., >= 1000)
                // This prevents validation during typing: 0002, 0020, 0202, etc.
                return year >= 1000;
            };

            // ALWAYS update state first
            const updated = {
                ...prev,
                [field]: { value: val, isValid }
            };

            // Only validate date relationship if this is a date field
            if (field === "valid_from" || field === "valid_until") {
                const fromValue = field === "valid_from" ? val : prev.valid_from?.value;
                const untilValue = field === "valid_until" ? val : prev.valid_until?.value;

                // Only validate if BOTH dates are complete
                if (isCompleteDate(fromValue) && isCompleteDate(untilValue)) {
                    const from = new Date(fromValue);
                    const until = new Date(untilValue);

                    if (until <= from) {
                        showToast.error(
                            "Valid until must be greater than valid from",
                            { id: VALID_DATE }
                        );
                        return prev; // Block state update
                    }
                }
            }

            return updated;
        });
    }, []);

    // item change handler
    const handleItemsChange = useCallback(
        (selectedItems = [], isValid) => {
            const prevItems = invoiceDetails.items.value;

            // 1. Identify what was added and what was removed
            const addedItems = selectedItems.filter(
                (si) => !prevItems.some((pi) => pi.id === si.id)
            );
            const removedItems = prevItems.filter(
                (pi) => !selectedItems.some((si) => si.id === pi.id)
            );

            // 2. Update Master Stock (Run this OUTSIDE of setInvoiceDetails)
            if (addedItems.length > 0 || removedItems.length > 0) {
                setItems((prevMaster) =>
                    prevMaster.map((mi) => {
                        const added = addedItems.find(
                            (a) => a.id === mi.id && mi.category === "product"
                        );
                        const removed = removedItems.find(
                            (r) => r.id === mi.id && r.category === "product"
                        );

                        if (added) return { ...mi, in_stock: Number(mi.in_stock) - 1 };
                        if (removed)
                            return {
                                ...mi,
                                in_stock: Number(mi.in_stock) + Number(removed.quantity)
                            };
                        return mi;
                    })
                );
            }

            // 3. Update Invoice Details
            const updatedItems = selectedItems.map((si) => {
                const existing = prevItems.find((pi) => pi.id === si.id);
                // If it's new, give it qty 1, otherwise keep the existing object
                return existing
                    ? existing
                    : { ...si, quantity: 1, total: Number(si.final_price.toFixed(2)) };
            });

            // 4. Recalculate totals
            const gross = updatedItems.reduce(
                (sum, i) => sum + i.final_price * i.quantity,
                0
            );
            const net = updatedItems.reduce(
                (sum, i) => sum + i.unit_price * i.quantity,
                0
            );

            setInvoiceDetails((prev) => ({
                ...prev,
                items: { value: updatedItems, isValid },
                gross_amount: { value: Number(gross.toFixed(2)), isValid: true },
                net_amount: { value: Number(net.toFixed(2)), isValid: true },
                total_tax_amount: {
                    value: Number((gross - net).toFixed(2)),
                    isValid: true
                },
                quantity: {
                    value: updatedItems.reduce((s, i) => s + i.quantity, 0),
                    isValid: true
                }
            }));
        },
        [invoiceDetails.items.value]
    );

    const onQuantityChange = useCallback((operation, productId) => {
        const invoiceItem = invoiceDetails.items.value.find(
            (i) => i.id === productId
        );
        if (!invoiceItem) return;

        const isProduct = invoiceItem.category === "product";
        const masterItem = items.find((i) => i.id === productId);

        const change = operation === "plus" ? 1 : -1;

        // Guards
        if (operation === "minus" && invoiceItem.quantity <= 1) return;

        if (operation === "plus" && isProduct) {
            if (Number(masterItem?.in_stock) <= 0) {
                showToast.error("No more stock available");
                return;
            }
        }

        // Update Master Stock (ONLY for products)
        if (isProduct) {
            setItems((prev) =>
                prev.map((mi) => {
                    if (mi.id !== productId) return mi;

                    return {
                        ...mi,
                        in_stock:
                            operation === "plus"
                                ? Number(mi.in_stock) - 1
                                : Number(mi.in_stock) + 1
                    };
                })
            );
        }

        // Update Invoice
        setInvoiceDetails((prev) => {
            const updatedItems = prev.items.value.map((item) => {
                if (item.id !== productId) return item;

                const newQty = item.quantity + change;
                const newItemTotal = Number(
                    (newQty * item.final_price).toFixed(2)
                );

                return {
                    ...item,
                    quantity: newQty,
                    total: newItemTotal
                };
            });

            const gross = updatedItems.reduce(
                (sum, i) => sum + (i.total || 0),
                0
            );

            const net = updatedItems.reduce(
                (sum, i) => sum + i.unit_price * i.quantity,
                0
            );

            return {
                ...prev,
                items: { ...prev.items, value: updatedItems },
                gross_amount: { value: Number(gross.toFixed(2)), isValid: true },
                net_amount: { value: Number(net.toFixed(2)), isValid: true },
                total_tax_amount: {
                    value: Number((gross - net).toFixed(2)),
                    isValid: true
                },
                quantity: {
                    value: updatedItems.reduce((s, i) => s + i.quantity, 0),
                    isValid: true
                }
            };
        });
    }, [items, invoiceDetails.items.value]);

    // item remove
    const onRemoveItem = (productId) => {
        // This is essentially handleItemsChange but for a single ID
        const currentItems = invoiceDetails.items.value;
        const filtered = currentItems.filter((item) => item.id !== productId);
        handleItemsChange(filtered, filtered.length > 0);
    };

    // ---------- validation ----------
    const result = isFormValid(invoiceDetails, optional_fields);

    const onSubmitHandler = async () => {

        if (invoiceDetails?.status?.value === "closed") {
            return;
        }

        if (!result.isValid) {
            showToast.error("Fill required fields to continue.");
            return;
        }

        setLoading(true);
        const payload = extractFormValues(invoiceDetails);

        try {
            if (id === "new") {
                const res = await createInvoice({ payload });
                if (res?.data?.success) {
                    showToast.success("Item created successfully.");
                }
            } else {
                const res = await updateInvoice({ id, payload });
                if (res?.data?.success) {
                    showToast.success("Item updated successfully.");
                }
            }
            navigate("/invoices");
        } catch (err) {
            console.error(err);
            showToast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <FormSkeleton count={12} notesCount={2} />;
    }

    return (
        <>
            <SEO
                title="Create/Edit Invoice"
                noIndex={true}
            />
            <div className="h-full w-full flex flex-col ">
                <FormHeader
                    header={`Invoice-${id === "new" ? "New" : id}`}
                    status={invoiceDetails?.status?.value}
                    onStatusChange={handleInputChange}
                />
                <Form
                    ID={id}
                    invoiceDetails={invoiceDetails}
                    onChange={handleInputChange}
                    onSubmit={onSubmitHandler}
                    itemsHandler={handleItemsChange}
                    items={items}
                    onChangeQuantity={onQuantityChange}
                    onRemoveItem={onRemoveItem}
                    clients={clients}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default React.memo(InvoiceForm);
