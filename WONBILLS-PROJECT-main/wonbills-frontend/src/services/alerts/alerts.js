import api from "../api";

const baseUrl = "/alert";

export const getAlerts = (page = 1, limit = 30) => {
  return api.get(`${baseUrl}/me?page=${page}&limit=${limit}`);
};

export const markAlertRead = (alertId) => {
  return api.patch(`${baseUrl}/mark-read/${alertId}`);
};