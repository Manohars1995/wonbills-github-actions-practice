import React, { useCallback, useEffect, useState } from 'react';
import Form from '../../components/UI-Components/Forms/Item/Form';
import { useNavigate, useParams } from 'react-router-dom';
import { isFormValid, mapItemApiToFormState, parseFloatSafe, calculateItemPricing, initialItemData } from '../../components/UI-Components/Forms/Item/utils';
import { showToast } from '../../components/UI-Elements/Toast';
import { extractFormValues } from '../../components/UI-Components/Forms/sharedUtils';
import { createItem, updateItem, getItemById } from '../../services/items/items';
import FormHeader2 from '../../components/UI-Components/Forms/FormHeader2';
import FormSkeleton from '../../components/UI-Elements/Loaders/FormSkeleton';
import { toast } from 'sonner';
import SEO from '../../components/SEO';

const ERROR_TOAST_ID = "item-form-error";
const SUBMIT_TOAST_ID = "item-submit";


const ItemForm = () => {
    const { id = "new" } = useParams();
    const navigate = useNavigate();

    const [itemDetails, setItemDetails] = useState({
        ...initialItemData
    });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    const optional_fields = [
        ...(id === "new" ? ["custom_id", "_id"] : ["_id"]),
        "image",
        "status",
        "description",
        "notes",
        "tax_amount",
        "discount_amount",
        ...(itemDetails?.category?.value !== "product" ? ["total_stock", "in_stock"] : [])
    ];

    useEffect(() => {
        if (id !== 'new') {
            fetchClient(id)
        }
    }, []);

    const fetchClient = async (id) => {
        setLoading(true);
        try {
            const res = await getItemById({ id });
            if (res?.data?.success) {
                const mappedState = mapItemApiToFormState(res?.data?.data);
                setItemDetails(mappedState);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const isCompleteDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);
    const isValidDate = (d) => d instanceof Date && !isNaN(d);

    const handleInputChange = useCallback((field, val, isValid) => {
        setItemDetails((prev) => {

            const nonNegativeFields = ["total_stock", "in_stock", "value", "taxation", "discount", "price"];

            if (nonNegativeFields.includes(field)) {
                const numValue = parseFloatSafe(val);
                if (numValue < 0) {
                    toast.error(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} cannot be negative`, {
                        id: ERROR_TOAST_ID
                    });
                    return prev;
                }
            }

            // ---- taxation validation ----
            if (field === "taxation") {
                const tax = parseFloatSafe(val);
                if (tax > 100) {
                    toast.error("Taxation cannot be more than 100%", {
                        id: ERROR_TOAST_ID
                    });
                    return prev;
                }
            }

            // ---- discount validation ----
            if (field === "discount") {
                const tax = parseFloatSafe(val);
                if (tax > 100) {
                    toast.error("Discount cannot be more than 100%", {
                        id: ERROR_TOAST_ID
                    });
                    return prev;
                }
            }

            let currentValidStatus = isValid;

            if (field === "valid_from" || field === "valid_until") {
                const sVal = field === "valid_from" ? val : prev.valid_from.value;
                const eVal = field === "valid_until" ? val : prev.valid_until.value;

                const sDate = new Date(sVal);
                const eDate = new Date(eVal);

                // Only validate if both strings actually look like full dates
                if (sVal?.length >= 10 && eVal?.length >= 10) {
                    if (!isNaN(sDate) && !isNaN(eDate) && eDate < sDate) {
                        currentValidStatus = false;
                        toast.error("End date must be after start date", { id: ERROR_TOAST_ID });
                    }
                }
            }

            const updated = {
                ...prev,
                [field]: { value: val, isValid }
            };

            // Clear stock fields when category changes from 'product' to non-product
            if (field === "category" && val !== "product") {
                updated.total_stock = { value: "", isValid: true };
                updated.in_stock = { value: "", isValid: true };
            }


            // ---- stock sync ----
            if (field === "total_stock") {
                updated.in_stock = {
                    ...prev.in_stock,
                    value: val,
                    isValid: true
                };
            }

            // ---- pricing recalculation ----
            if (["value", "discount", "taxation"].includes(field)) {
                const pricing = calculateItemPricing({
                    value: updated.value?.value,
                    discount: updated.discount?.value,
                    taxation: updated.taxation?.value
                });

                updated.tax_amount = {
                    value: pricing.tax_amount,
                    isValid: true
                };

                updated.discount_amount = {
                    value: pricing.discount_amount,
                    isValid: true
                };

                updated.price = {
                    value: pricing.price,
                    isValid: true
                };
            }

            return updated;
        });
    }, []);


    // ---------- validation ---------- 
    const result = isFormValid(itemDetails, optional_fields);



    const onSubmitHandler = async () => {

        if (!result.isValid) {
            toast.error("Fill required fields to continue.", {
                id: SUBMIT_TOAST_ID
            });
            return;
        }

        setLoading2(true);
        const payload = extractFormValues(itemDetails);

        try {
            if (id === "new") {
                const res = await createItem({ payload });

                if (res?.data?.success) {
                    toast.success("Item created successfully.", {
                        id: SUBMIT_TOAST_ID
                    });
                }
            } else {
                const res = await updateItem({ id, payload });

                if (res?.data?.success) {
                    toast.success("Item updated successfully.", {
                        id: SUBMIT_TOAST_ID
                    });
                }
            }

            navigate("/items");

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.", {
                id: SUBMIT_TOAST_ID
            });
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
                title="Create/Edit Item"
                noIndex={true}
            />
            <div className='max-h-full w-full flex flex-col '>
                <FormHeader2
                    header={`Item-${id === 'new' ? 'New' : id}`}
                    checked={itemDetails?.status?.value}
                    setChecked={handleInputChange}
                />
                <Form
                    ID={id}
                    itemDetails={itemDetails}
                    onChange={handleInputChange}
                    onSubmit={onSubmitHandler}
                    loading={loading2}
                />
            </div>
        </>
    )
}

export default ItemForm;
