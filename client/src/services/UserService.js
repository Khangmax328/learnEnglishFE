import axiosClient from "../api/axiosClient";

export const loginUser = (payload) => {
  return axiosClient.post("/auth/login", payload);
};
export const registerUser = (payload) => {
  return axiosClient.post("/auth/register", payload);
};
export const getUserDetails = () => {
  return axiosClient.get("/auth/me");
};
