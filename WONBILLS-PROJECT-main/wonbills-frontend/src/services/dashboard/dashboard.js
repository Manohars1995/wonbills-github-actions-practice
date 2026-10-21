import api from "../api";

const baseUrl = '/dashboard';

export const getUserChartsData = () => {
    return api.get(`${baseUrl}/vendor/charts`)
};
