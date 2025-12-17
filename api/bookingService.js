import {api} from "./api.js";

function createBooking(payload) {
  return api.post("/bookings", payload);
}

function getAllBookings() {
  return api.get("/bookings");
}

function getBookingsByPassengerID(passengerId) {
  return api.get(`/bookings/passenger/${passengerId}`);
}

function deleteBooking(bookingId) {
  return api.delete(`/bookings/${bookingId}`);
}

function updateBooking(bookingId, payload) {
  return api.put(`/bookings/${bookingId}`, payload);
}

export {
  createBooking,
  getAllBookings,
  getBookingsByPassengerID,
  deleteBooking,
  updateBooking,
};
