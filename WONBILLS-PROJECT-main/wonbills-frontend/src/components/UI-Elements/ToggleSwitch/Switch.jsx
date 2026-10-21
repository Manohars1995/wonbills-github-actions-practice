import React, { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import styles from "./SwitchToggle.module.css";
import ConfirmModal from "../modals/ConfirmModal";

function ToggleSwitch({
  field,
  checked = false,
  setChecked = () => {},
  label = false
}) {
  const [showModal, setShowModal] = useState(false);
  const [pendingValue, setPendingValue] = useState(checked);

  const handleToggle = () => {
    setPendingValue(!checked);
    setShowModal(true);
  };

  const confirmChange = () => {
    setChecked(field, pendingValue, true);
    setShowModal(false);
  };

  const cancelChange = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="flex gap-2 bg-transparent">
        {label && (
          <span className="font-semibold text-sm">
            {checked ? "Active" : "Inactive"}
          </span>
        )}

        <label className={`${styles.switch} relative inline-block`} style={{ fontSize: 0 }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
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
          title="Are you sure?"
          confirmText="Yes"
          cancelText="No"
          onConfirm={confirmChange}
          onCancel={cancelChange}
        >
          <span>
            Do you want to mark it as{" "}
            <span className="font-bold">
              {pendingValue ? "Active" : "Inactive"}
            </span>
            ?
          </span>
        </ConfirmModal>
      )}
    </>
  );
}

export default React.memo(ToggleSwitch);
