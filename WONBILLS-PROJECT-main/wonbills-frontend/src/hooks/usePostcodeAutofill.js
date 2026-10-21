import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "./useDebounce";
import { getAddressByPostcode } from "../services/shared/shared";
import { showToast } from "../components/UI-Elements/Toast";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

const usePostcodeAutofill = ({ postcode, onAutofill, debounceMs = 500 }) => {
    const [loading, setLoading] = useState(false);

    // Normalize input
    const normalizedPostcode =
        typeof postcode === "string" ? postcode.trim() : "";

    // Debounce
    const debouncedPostcode = useDebounce(normalizedPostcode, debounceMs);

    // Safe postcode
    const safePostcode = useMemo(() => {
        return PINCODE_REGEX.test(debouncedPostcode)
            ? debouncedPostcode
            : null;
    }, [debouncedPostcode]);

    const lastFetchedRef = useRef(null);
    const isFetchingRef = useRef(false);
    //  lastFetchedRef.current = safePostcode;

    useEffect(() => {
        if (
            !safePostcode ||
            safePostcode === lastFetchedRef.current ||
            isFetchingRef.current
        ) {
            return;
        }

        isFetchingRef.current = true;

        const run = async () => {
            setLoading(true);

            try {
                const res = await getAddressByPostcode({ postcode: safePostcode });

                // HANDLE API-LEVEL FAILURE
                if (!res?.data?.success) {
                    const msg = res?.data?.message || "Failed to fetch postcode data";
                    showToast.error(msg);
                    return; //  stop here
                }

                const data = res.data.data;
                if (!data) return;

                onAutofill(data);
                lastFetchedRef.current = safePostcode;
            } catch (err) {
                console.error("Postcode autofill failed", err);
                showToast.error("Something went wrong while fetching postcode");
            } finally {
                isFetchingRef.current = false;
                setLoading(false);
            }
        };

        run();
    }, [safePostcode, onAutofill]);


    //  expose loading
    return { loading };
};

export default usePostcodeAutofill;
