import axios from "axios";

const axiosInstance = axios.create({
 // baseURL:"http://localhost:3001/api",
 baseURL: "https://makallataskmanagement.lobborecords.com/api",
  withCredentials: true, // send cookies to the server
  Credentials: "include", // send cookies to the server
});

export default axiosInstance;