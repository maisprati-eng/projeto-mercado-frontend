import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, newToken) => {
    queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(newToken)));
    queue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queue.push({ resolve, reject });
                })
                    .then((token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        return api(original);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token found");

                const { data } = await api.post("/auth/refresh-token", { refreshToken });


                const { token, refreshTokenId } = data;

                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", refreshTokenId);
                api.defaults.headers.Authorization = `Bearer ${token}`;

                processQueue(null, token);


                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            } catch (err) {
                processQueue(err, null);
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
