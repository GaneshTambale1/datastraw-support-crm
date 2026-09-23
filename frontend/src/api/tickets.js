import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTickets = async ({ search = "", status = "" } = {}) => {
  const params = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  if (status) {
    params.status = status;
  }

  const response = await api.get("/api/tickets", { params });

  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post("/api/tickets", ticketData);
  return response.data;
};

export const getTicket = async (ticketId) => {
  const response = await api.get(`/api/tickets/${ticketId}`);
  return response.data;
};

export const updateTicket = async (ticketId, updateData) => {
  const response = await api.put(
    `/api/tickets/${ticketId}`,
    updateData
  );

  return response.data;
};

export default api;