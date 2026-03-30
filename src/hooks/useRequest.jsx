import {useState, useCallback, useRef, useEffect} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

/**
 * Hook unificado para requisições HTTP com configuração dinâmica, autenticação e estados de loading/error.
 * Parâmetros: busca, page, start, stop, sort, dir, fields
 */
export default function useRequest(
  busca = "",
  page = "",
  start = "",
  stop = "",
  sort = "",
  dir = "",
  fields = "",
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const router = useRouter();

  const baseUrlRaw = process.env.NEXT_PUBLIC_API_URL || "";
  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const verificaValor = (domainValue, paramValue) => {
    if (paramValue !== undefined && paramValue !== null && paramValue !== "") {
      return paramValue;
    }
    if (
      domainValue !== undefined &&
      domainValue !== null &&
      domainValue !== ""
    ) {
      return domainValue;
    }
    return "";
  };

  const handle401 = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  const buildHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token && token !== "null") {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const config = {
    searchParams: {
      params: {
        query: busca,
        fields: verificaValor(fields),
        page: verificaValor(page),
        start: verificaValor(start),
        limit: verificaValor(stop),
        sort: verificaValor(sort),
        dir: verificaValor(dir),
      },
      headers: buildHeaders(),
    },
    defaultParams: {
      headers: buildHeaders(),
    },
  };

  const get = useCallback(
    async (url, customConfig = config.defaultParams) => {
      if (isMounted.current) {
        setLoading(true);
      }
      setError(null);
      try {
        const cleanUrl = String(url).replace(/^\/+/, "");
        const finalConfig = {
          ...customConfig,
          params: {
            ...(customConfig.params || {}),
            _t: new Date().getTime(),
          },
        };
        const response = await axios.get(`${baseUrl}/${cleanUrl}`, finalConfig);
        return {
          data: response.data,
          total: response.data.total,
          headers: response.headers,
          config: response.config,
          status: response.status,
        };
      } catch (error) {
        if (error?.response?.status === 401) handle401();
        const errData = error?.response?.data;
        if (isMounted.current) {
          setError(errData);
        }
        throw error;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [token, busca, page, start, stop, sort, dir, fields],
  );
  const post = useCallback(
    async (url, data = {}, options = {}) => {
      if (isMounted.current) {
        setLoading(true);
      }
      setError(null);
      try {
        const cleanUrl = String(url).replace(/^\/+/, "");

        const headers = {
          ...config.defaultParams.headers,
          ...(options.headers || {}),
        };
        if (typeof FormData !== "undefined" && data instanceof FormData) {
          delete headers["Content-Type"];
        }

        const finalConfig = {
          ...config.defaultParams,
          ...options,
          headers,
          params: {
            ...(options.params || {}),
            _t: new Date().getTime(),
          },
        };
        const response = await axios.post(
          `${baseUrl}/${cleanUrl}`,
          data,
          finalConfig,
        );
        return {data: response.data};
      } catch (error) {
        if (error?.response?.status === 401) handle401();
        const errData = error?.response?.data;
        if (isMounted.current) {
          setError(errData);
        }
        throw error;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [token, baseUrl],
  );
  const patch = useCallback(
    async (url, data = {}, options = {}) => {
      if (isMounted.current) setLoading(true);
      setError(null);
      try {
        const cleanUrl = String(url).replace(/^\/+/, "");

        const headers = {
          ...config.defaultParams.headers,
          ...(options.headers || {}),
        };
        if (typeof FormData !== "undefined" && data instanceof FormData) {
          delete headers["Content-Type"];
        }

        const finalConfig = {
          ...config.defaultParams,
          ...options,
          headers,
          params: {
            ...(options.params || {}),
            _t: new Date().getTime(),
          },
        };
        const response = await axios.patch(
          `${baseUrl}/${cleanUrl}`,
          data,
          finalConfig,
        );
        return {data: response.data};
      } catch (error) {
        if (error?.response?.status === 401) handle401();
        const errData = error?.response?.data;
        if (isMounted.current) setError(errData);
        throw error;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [token, baseUrl],
  );
  const put = useCallback(
    async (url, data = {}, options = {}) => {
      if (isMounted.current) setLoading(true);
      setError(null);
      try {
        const cleanUrl = String(url).replace(/^\/+/, "");

        const headers = {
          ...config.defaultParams.headers,
          ...(options.headers || {}),
        };
        if (typeof FormData !== "undefined" && data instanceof FormData) {
          delete headers["Content-Type"];
        }

        const finalConfig = {
          ...config.defaultParams,
          ...options,
          headers,
          params: {
            ...(options.params || {}),
            _t: new Date().getTime(),
          },
        };
        const response = await axios.put(
          `${baseUrl}/${cleanUrl}`,
          data,
          finalConfig,
        );
        return {data: response.data};
      } catch (error) {
        if (error?.response?.status === 401) handle401();
        const errData = error?.response?.data;
        if (isMounted.current) setError(errData);
        throw error;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [token, baseUrl],
  );
  const del = useCallback(
    async (url, options = {}) => {
      if (isMounted.current) {
        setLoading(true);
      }
      setError(null);
      try {
        const cleanUrl = String(url).replace(/^\/+/, "");
        const finalConfig = {
          ...config.defaultParams,
          ...options,
          headers: {
            ...config.defaultParams.headers,
            ...(options.headers || {}),
          },
          params: {
            ...(options.params || {}),
            _t: new Date().getTime(),
          },
        };
        const response = await axios.delete(
          `${baseUrl}/${cleanUrl}`,
          finalConfig,
        );
        return {data: response.data};
      } catch (error) {
        if (error?.response?.status === 401) handle401();
        const errData = error?.response?.data;
        if (isMounted.current) {
          setError(errData);
        }
        try {
          const message =
            errData?.message ||
            errData?.msg ||
            JSON.stringify(errData) ||
            "Erro na requisição.";
          // notifyError may be unavailable here; guard call
          if (typeof window !== "undefined" && window.notifyError) {
            window.notifyError(message);
          }
        } catch (e) {
          /* ignore */
        }
        throw error;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [token, baseUrl],
  );
  return {get, post, patch, put, del, loading, error, config};
}
