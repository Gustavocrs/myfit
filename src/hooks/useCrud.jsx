"use client";
import {useState, useEffect, useCallback} from "react";
import useRequest from "./useRequest";
import {notifyError, notifySuccess} from "@/components/Notify";

export const useCrud = ({
  apiEndpoint,
  initialState,
  formatTableData,
  entityName = "Item",
}) => {
  const {get, post, patch, loading} = useRequest();
  const [rows, setRows] = useState([]);
  const [reload, setReload] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [itemId, setItemId] = useState(null);

  // Busca os dados principais para a tabela
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`api/${apiEndpoint}`);
        const source = response?.data?.data ?? response?.data ?? response ?? [];
        const arr = Array.isArray(source) ? source : [];
        const formattedData = formatTableData(arr);
        setRows(formattedData);
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          `Erro ao carregar ${entityName}s.`;
        notifyError(msg);
      } finally {
        setReload(false);
      }
    };
    fetchData();
  }, [reload, apiEndpoint, get, formatTableData, entityName]);

  const handleCreateOpen = useCallback(
    (extraData = {}) => {
      setEditFormData({...initialState, ...extraData});
      setItemId(null);
      setOpenEditModal(true);
    },
    [initialState]
  );

  const handleEditOpen = useCallback((id) => {
    setEditLoading(true);
    setItemId(id);
  }, []);

  const handleSave = useCallback(
    async (dataToSave) => {
      try {
        setEditLoading(true);
        const action = itemId ? "atualizar" : "criar";
        const successMessage = `${entityName} ${
          action === "atualizar" ? "atualizado(a)" : "criado(a)"
        } com sucesso!`;

        // Construir um payload seguro evitando referências cíclicas ou valores não-serializáveis.
        const safeClone = (value, seen = new WeakMap()) => {
          if (value === null) return null;
          if (typeof value !== "object") return value;
          if (seen.has(value)) return undefined; // ciclo detectado -> ignora
          seen.set(value, true);
          if (Array.isArray(value)) {
            return value
              .map((v) => safeClone(v, seen))
              .filter((v) => v !== undefined);
          }
          const out = {};
          for (const [k, v] of Object.entries(value)) {
            if (typeof v === "function") continue;
            // ignorar nós DOM e elementos React
            if (v && (v.nodeType || v instanceof Element)) continue;
            const cloned = safeClone(v, seen);
            if (cloned !== undefined) out[k] = cloned;
          }
          return out;
        };

        const payload = dataToSave;

        let resp = null;
        if (itemId) {
          resp = await patch(`api/${apiEndpoint}/${itemId}`, payload);
        } else {
          resp = await post(`api/${apiEndpoint}`, payload);
        }

        // Prefer server-provided message when available
        const serverMsg = resp?.data?.message || resp?.message;
        notifySuccess(serverMsg || successMessage);
        setOpenEditModal(false);
        setReload(true);
      } catch (error) {
        const action = itemId ? "atualizar" : "criar";
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          `Erro ao ${action} ${entityName}.`;
        notifyError(msg);
      } finally {
        setEditLoading(false);
      }
    },
    [apiEndpoint, itemId, patch, post, entityName, initialState]
  );

  const handleClose = () => {
    setOpenEditModal(false);
    setEditFormData(initialState);
    setItemId(null);
    setEditLoading(false);
  };

  return {
    rows,
    loading,
    editLoading,
    openEditModal,
    editFormData,
    setEditFormData,
    setEditLoading,
    setOpenEditModal,
    handleCreateOpen,
    handleEditOpen,
    handleSave,
    handleClose,
    setReload,
    itemId,
  };
};
