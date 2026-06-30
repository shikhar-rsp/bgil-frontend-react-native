import axios from "axios";
import { decrypt } from "../../../utils/crypto";
import { clearTokenValues, getTokenValue, setTokenValue } from "../../../utils/tokenStorage";
import { ENV } from "../../../config/env";
import { emitUnauthorized } from "../../authEvents";

// Base URL from app config (see src/config/env.ts).
const apiBaseUrl = ENV.API_BASE_URL || "https://api.uat.bajajgeneral.com";

const tryDecryptPayload = (body: unknown): unknown => {
  if (!body || typeof body !== 'object' || !('payload' in body)) {
    return body;
  }
  try {
    const key = (ENV.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef').trim();
    const iv  = (ENV.ENCRYPTION_IV  || '0123456789abcdef').trim();
    const decrypted = decrypt(key, (body as { payload: string }).payload, iv);
    return JSON.parse(decrypted);
  } catch {
    return body;
  }
};

/* ========================================================
   AXIOS INSTANCE
======================================================== */

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ========================================================
   REQUEST INTERCEPTOR
   - Attach access token
======================================================== */

api.interceptors.request.use(
  (config) => {
    const accessToken = getTokenValue("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    console.group(`[API] ▶ ${config.method?.toUpperCase()} ${config.baseURL ?? ''}/${config.url ?? ''}`);
    console.log('[API] Headers:', config.headers);
    console.log('[API] Decrypted Payload:', tryDecryptPayload(config.data));
    console.groupEnd();

    return config;
  },
  (error) => Promise.reject(error)
);

/* ========================================================
   TOKEN REFRESH COORDINATION
======================================================== */

let isRefreshing: boolean = false;

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

type ErrorLike = {
  response?: {
    status?: number;
    headers?: unknown;
    data?: unknown;
  };
  config?: {
    method?: string;
    baseURL?: string;
    url?: string;
    headers?: Record<string, string>;
    _retry?: boolean;
  };
  message?: string;
};

const processQueue = (
  error: unknown,
  token: string | null = null
): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token as string);
  });

  failedQueue = [];
};
/* ========================================================
   RESPONSE INTERCEPTOR
   - If 401 → refresh token → retry request
======================================================== */

api.interceptors.response.use(
  (response) => {
    console.group(`[API] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL ?? ''}/${response.config.url ?? ''}`);
    console.log('[API] Response Headers:', response.headers);
    console.log('[API] Response Body:', response.data);
    console.groupEnd();

    return response.data;
  },

  async (error: ErrorLike) => {
    if (error.response) {
      console.group(`[API] ❌ ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.baseURL ?? ''}/${error.config?.url ?? ''}`);
      console.log('[API] Response Headers:', error.response.headers);
      console.log('[API] Response Body:', error.response.data);
      console.groupEnd();
    } else {
      console.error('[API] ❌ Network/Timeout error:', error.message);
    }

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    //  Only handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {

      //  If refresh already in progress → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getTokenValue("refreshToken");

        //  Token generation API
        const refreshResponse = await axios.post(
          `${apiBaseUrl}/BagicProperty/token`,
          { refreshToken }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        //  Save new token
        setTokenValue("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        //  Retry original request
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        //  Logout / force re-auth — navigation layer resets to the login stack.
        clearTokenValues();
        emitUnauthorized();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;