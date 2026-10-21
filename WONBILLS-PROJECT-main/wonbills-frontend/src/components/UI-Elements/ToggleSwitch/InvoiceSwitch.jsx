import React, { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import styles from "./SwitchToggle.module.css";
import ConfirmModal from "../modals/ConfirmModal";

// statusConfig.ts
const STATUS_CONFIG = {
    active: {
        checked: true,
        label: "Active",
        editable: true
    },
    inactive: {
        checked: false,
        label: "Inactive",
        editable: true
    },
    initiated: {
        checked: true,        // looks Active
        label: "Initiated",
        editable: false       // cannot toggle
    },
    closed: {
        checked: false,       // looks Inactive
        label: "Closed",
        editable: false       // cannot toggle
    }
};


function InvoiceToggleSwitch({ status, onChange = (() => { }), label = true }) {
    const [showModal, setShowModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;

    const handleToggle = () => {
        if (!config.editable) return;

        const nextStatus =
            status === "active" ? "inactive" : "active";

        setPendingStatus(nextStatus);
        setShowModal(true);
    };

    const confirmChange = () => {
        onChange("status", pendingStatus, true);
        setShowModal(false);
    };

    return (
        <>
            <div className="flex gap-2 items-center">
                {label && (
                    <span className="text-sm font-semibold">
                        {config.label}
                    </span>
                )}

                <label
                    className={`${styles.switch} ${!config.editable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <input
                        type="checkbox"
                        checked={config.checked}
                        onChange={handleToggle}
                        disabled={!config.editable}
                    />
                    <div className={styles.slider}>
                        <div className={styles.circle}>
                            <FaCheck className={styles.checkmark} />
                            <FaTimes className={styles.cross} />
                        </div>
                    </div>
                </label>
            </div>

            {showModal && (
                <ConfirmModal
                    title="Confirm status change"
                    confirmText="Yes"
                    cancelText="No"
                    onConfirm={confirmChange}
                    onCancel={() => setShowModal(false)}
                >
                    Change status to{" "}
                    <strong>
                        {pendingStatus === "active" ? "Active" : "Inactive"}
                    </strong>
                    ?
                </ConfirmModal>
            )}
        </>
    );
}

export default React.memo(InvoiceToggleSwitch);
