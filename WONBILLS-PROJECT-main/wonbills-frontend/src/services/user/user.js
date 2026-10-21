import api from "../api";

const baseUrl = '/user';

export const getProfile = () => {
    return api.get(`${baseUrl}/profile`);
};

export const updateProfile = ({ payload }) => {
    return api.put(`${baseUrl}/update/profile`, payload);
};

export const getBusinessProfile = () => {
    return api.get(`${baseUrl}/business-profile`);
};

export const getKycDetails = () => {
    return api.get(`${baseUrl}/kyc`);
}

export const updateKycDetails = ({ payload }) => {
    return api.put(`${baseUrl}/update/bank-details/kyc`, payload);
}

export const getAlertNotificationStatus = () => {
    return api.get(`${baseUrl}/alerts/notifications`);
}

export const toggleAlerts = (payload) => {
    // payload = { alert: boolean }
    return api.put(`${baseUrl}/toggle/alerts`, payload);
};

export const toggleNotifications = (payload) => {
    // payload = { notification: boolean }
    return api.put(`${baseUrl}/toggle/notifications`, payload);
};

export const updateSelectedInvTemp = (payload) => {
    return api.put(`${baseUrl}/inv/temp`, payload);
}

export const uploadLogoSig = (payload) => {
    return api.put(`${baseUrl}/upload/logo/sig`, payload);
};

