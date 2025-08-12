import axiosClient from "../api/axiosClient";

export const fetchMyTexts = (page = 1, limit = 5) =>
  axiosClient.get(`/texts/me?page=${page}&limit=${limit}`);

export const deleteText = (id) =>
  axiosClient.delete(`/texts/${id}`);
