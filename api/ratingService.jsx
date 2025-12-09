import {api} from "./api.jsx";

function createRating(payload) {
  return api.post("/ratings", payload);
}

function getDriverRating(driverId) {
  return api.get(`/ratings/driver/${driverId}`);
}

function getUserRatingsList(driverId) {
  return api.get(`/ratings/driver/${driverId}/ratings`);
}

export {createRating, getDriverRating, getUserRatingsList};
