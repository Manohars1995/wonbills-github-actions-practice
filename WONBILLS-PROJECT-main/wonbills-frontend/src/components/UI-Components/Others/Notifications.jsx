import { useEffect, useRef, useState } from "react";
import { getAlerts, markAlertRead } from "../../../services/alerts/alerts";

const NotifyModal = () => {
  const [alerts, setAlerts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [markingReadId, setMarkingReadId] = useState(null);

  const observerRef = useRef(null);
  const initialFetchDone = useRef(false);

  /* ---------------- FETCH ALERTS ---------------- */
  const fetchAlerts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await getAlerts(page);

      if (res?.data?.success) {
        const newAlerts = res.data.data || [];

        setAlerts(prev => {
          const map = new Map(prev.map(a => [a._id, a]));
          newAlerts.forEach(a => map.set(a._id, a));
          return Array.from(map.values());
        });

        setHasMore(res.data.pagination?.hasNextPage);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error("Fetch alerts error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    fetchAlerts();
  }, []);

  /* ---------------- INTERSECTION OBSERVER ---------------- */
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        fetchAlerts();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  /* ---------------- MARK AS READ ---------------- */
  const handleMarkRead = async (id) => {
    try {
      setMarkingReadId(id);
      await markAlertRead(id);

      setAlerts(prev =>
        prev.map(alert =>
          alert._id === id ? { ...alert, read: true } : alert
        )
      );
    } catch (err) {
      console.error("Mark read failed:", err);
    } finally {
      setMarkingReadId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1">
      {alerts.length === 0 ? (
        <div className="">
          <p className="text-sm text-gray-400 text-center">
           --- No alerts to show ---
          </p>

        </div>
      ) : (

        alerts.map(alert => (
          <div
            key={alert._id}
            className={`
            flex items-start gap-2
            p-2 sm:p-3
            rounded-xl
            ${alert.read ? "bg-white" : "bg-blue-50"}
          `}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2">
                {alert.alert_text}
              </p>

              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                {new Date(alert.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {!alert.read && (
              <button
                onClick={() => handleMarkRead(alert._id)}
                disabled={markingReadId === alert._id}
                className="
                shrink-0
                text-[10px] sm:text-xs
                px-2 py-1
                rounded-full
                border border-blue-400
                text-blue-600
                hover:bg-blue-100
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center
              "
              >
                {markingReadId === alert._id ? (
                  <span
                    className="
                    h-3 w-3
                    animate-spin
                    rounded-full
                    border-2 border-blue-500 border-t-transparent
                  "
                  />
                ) : (
                  "Mark read"
                )}
              </button>
            )}
          </div>
        ))

      )

      }


      {hasMore && (
        <div
          ref={observerRef}
          className="h-8 text-center text-xs text-gray-400 flex items-center justify-center"
        >
          {loading ? "Loading..." : "Load more"}
        </div>
      )}

      {!hasMore && alerts.length > 0 && (
        <p className="text-xs text-center text-gray-400 py-2">
          You’re all caught up
        </p>
      )}
    </div>
  );
};

export default NotifyModal;
