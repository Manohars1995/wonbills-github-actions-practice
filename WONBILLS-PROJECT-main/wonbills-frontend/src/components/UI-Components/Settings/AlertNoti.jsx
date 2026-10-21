import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../UI-Elements/Accordion";
import ToggleSwitch from "../../UI-Elements/ToggleSwitch/Switch";
import {
  getAlertNotificationStatus,
  toggleAlerts,
  toggleNotifications
} from "../../../services/user/user";
import { extractFormValues } from "../Forms/sharedUtils";
import { toast } from "sonner";

const AlertNoti = () => {
  const [status, setStatus] = useState({
    alerts: { value: false, isValid: true },
    notifications: { value: false, isValid: true }
  });

  const originalPayloadRef = useRef(null);

  /* ---------------- FETCH INITIAL STATE ---------------- */
  const fetchData = async () => {
    try {
      const res = await getAlertNotificationStatus();

      if (res?.data?.success) {
        const mapped = {
          alerts: { value: !!res.data.data.alerts, isValid: true },
          notifications: { value: !!res.data.data.notifications, isValid: true }
        };

        setStatus(mapped);
        originalPayloadRef.current = extractFormValues(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- LOCAL STATE UPDATE ---------------- */
  const onCheckHandler = (field, value, isValid = true) => {
    setStatus(prev => ({
      ...prev,
      [field]: { value, isValid }
    }));
  };

  /* ---------------- ALERTS SIDE EFFECT ---------------- */
  useEffect(() => {
    if (!originalPayloadRef.current) return;

    const prev = originalPayloadRef.current.alerts;
    const next = status.alerts.value;

    if (prev === next) return;

    const toastId = toast.loading("Updating alerts...");

    (async () => {
      try {
        const res = await toggleAlerts({ alert: next });

        if (!res?.data?.success) {
          throw new Error();
        }

        toast.success("Alerts updated", { id: toastId });
        originalPayloadRef.current.alerts = next;
      } catch (err) {
        toast.error("Failed to update alerts", { id: toastId });
        console.error(err)
        // rollback
        setStatus(prevState => ({
          ...prevState,
          alerts: { value: prev, isValid: true }
        }));
      }
    })();
  }, [status.alerts.value]);

  /* ---------------- NOTIFICATIONS SIDE EFFECT ---------------- */
  useEffect(() => {
    if (!originalPayloadRef.current) return;

    const prev = originalPayloadRef.current.notifications;
    const next = status.notifications.value;

    if (prev === next) return;

    const toastId = toast.loading("Updating notifications...");

    (async () => {
      try {
        const res = await toggleNotifications({ notification: next });

        if (!res?.data?.success) {
          throw new Error();
        }

        toast.success("Notifications updated", { id: toastId });
        originalPayloadRef.current.notifications = next;
      } catch (err) {
        toast.error("Failed to update notifications", { id: toastId });

        // rollback
        setStatus(prevState => ({
          ...prevState,
          notifications: { value: prev, isValid: true }
        }));
      }
    })();
  }, [status.notifications.value]);

  return (
    <section>
      <Accordion title="Alerts & Notifications">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div
            className="
                        bg-gray-200
                        shadow-sm
                        min-h-[44px]
                        flex items-center justify-between
                        px-3
                        rounded-2xl
                    "
          >
            <label className="font-semibold text-sm sm:text-base">
              Alerts
            </label>
            <ToggleSwitch
              field="alerts"
              checked={status.alerts.value}
              setChecked={onCheckHandler}
            />
          </div>

          <div
            className="
                        bg-gray-200
                        shadow-sm
                        min-h-[44px]
                        flex items-center justify-between
                        px-3
                        rounded-2xl
                    "
          >
            <label className="font-semibold text-sm sm:text-base">
              Notifications
            </label>
            <ToggleSwitch
              field="notifications"
              checked={status.notifications.value}
              setChecked={onCheckHandler}
            />
          </div>
        </div>
      </Accordion>
    </section>
  );

};

export default React.memo(AlertNoti);
