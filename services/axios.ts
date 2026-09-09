import axios from "axios";
import { env } from "process";

const backendApi = axios.create({
  baseURL:
    env.NEXT_PUBLIC_API_BASE_URL ??
    "https://tech-challenge-02-latest.onrender.com/",
  timeout: 10000,
});

export default backendApi;
