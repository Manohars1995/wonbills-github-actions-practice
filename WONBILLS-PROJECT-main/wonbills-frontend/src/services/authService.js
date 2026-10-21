import api from "./api";
const url = '/auth'

export const getAuthenticatedUser = async () => {
  const response = await api.get(`${url}/me`); // Cookie will be sent automatically
  return response.data.user;
};