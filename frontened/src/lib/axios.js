// import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL:"http://localhost:5001/api",
//   withCredentials: true //send cookies with requests
// });


// import axios from "axios";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";


// export const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // send cookies with the request
// });


import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:5001/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});