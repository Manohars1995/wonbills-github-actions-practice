import { useContext } from "react";
import SlideModal from "../../UI-Elements/modals/slider-modal.jsx";
import NotifyModal from "./Notifications.jsx";
import { WonBillsContext } from "../../../store/WonBillsContext.jsx";

const NotificationsHost = () => {
  const { isNotifyOpen, setNotifyOpen } = useContext(WonBillsContext);

  if (!isNotifyOpen) return null;

  return (
    <SlideModal
      isOpen={isNotifyOpen}
      onClose={() => setNotifyOpen(false)}
      title="Alerts"
    >
      <NotifyModal />
    </SlideModal>
  );
};

export default NotificationsHost;
