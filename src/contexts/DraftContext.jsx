import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const DraftContext = createContext();

export const DraftProvider = ({ children }) => {
    const { authData } = useAuth();

    const [draftItems, setDraftItems] = useState(() => {
        const stored = localStorage.getItem("draftItems");
        return stored ? JSON.parse(stored) : [];
    });

    const [market, setMarket] = useState(() => {
        const stored = localStorage.getItem("currentMarket");
        return stored || "";
    });

    const [isSaving, setIsSaving] = useState(false);
    const [savedRascunhos, setSavedRascunhos] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem("draftItems", JSON.stringify(draftItems));
        if (draftItems.length === 0) {
            localStorage.removeItem("currentMarket");
        }
    }, [draftItems]);

    useEffect(() => {
        if (market && draftItems.length > 0) {
            localStorage.setItem("currentMarket", market);
        } else if (!market) {
            localStorage.removeItem("currentMarket");
        }
    }, [market, draftItems]);

    const fetchDrafts = async () => {

        if (!authData || !authData.token) return;

        setLoadingSaved(true);
        try {
            const res = await api.get("/api/rascunhos");
            if (res && res.status === 200) {
                setSavedRascunhos(Array.isArray(res.data) ? res.data : []);
            } else {
                toast.error("Erro ao buscar rascunhos salvos");
            }
        } catch (err) {
            console.error("Erro ao buscar rascunhos:", err);
            if (authData?.token) {

                const msg = err?.response?.data
                    ? JSON.stringify(err.response.data)
                    : err.message || String(err);
                toast.error(`Não foi possível carregar rascunhos: ${msg}`);
            }
        } finally {
            setLoadingSaved(false);
        }
    };


    useEffect(() => {
        if (authData?.token) {
            fetchDrafts();
        }
    }, [authData?.token]);

    useEffect(() => {
        const handler = () => fetchDrafts();
        window.addEventListener('rascunhos:updated', handler);
        return () => window.removeEventListener('rascunhos:updated', handler);
    }, []);

    const addItem = (item) => {
        const newItem = {
            ...item,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };
        setDraftItems((prev) => [...prev, newItem]);
    };

    const removeItem = (id) => {
        setDraftItems((prev) => prev.filter(item => item.id !== id));
    };

    const clearItems = () => {
        setDraftItems([]);
    };

    const clearDraft = () => {
        setDraftItems([]);
        setMarket("");
    };

    const handleSaveDraft = async () => {
        if (!market || market.trim() === "") {
            toast.error("Informe o mercado antes de salvar");
            return false;
        }

        if (!draftItems || draftItems.length === 0) {
            toast.info("Não há rascunhos para salvar");
            return false;
        }

        const conteudo = JSON.stringify(draftItems);
        const mercado = market;

        setIsSaving(true);
        try {
            const res = await api.post("/api/rascunhos", { mercado, conteudo });
            if (res && res.status >= 200 && res.status < 300) {
                clearDraft();
                toast.success("Rascunho salvo no servidor com sucesso");
                window.dispatchEvent(new CustomEvent("rascunhos:updated"));
                return true;
            } else {
                toast.error(`Erro ao salvar rascunho: ${res ? res.status : "sem resposta"}`);
                return false;
            }
        } catch (err) {
            console.error("Falha ao salvar rascunho:", err);
            const errMsg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Não foi possível salvar: ${errMsg}`);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDraft = async (id) => {
        const ok = window.confirm("Confirma exclusão do rascunho?");
        if (!ok) return false;

        try {
            const delRes = await api.delete(`/api/rascunhos/${id}`);
            if (delRes && (delRes.status === 200 || delRes.status === 204)) {
                toast.success("Rascunho excluído");
                window.dispatchEvent(new CustomEvent("rascunhos:updated"));
                return true;
            } else {
                toast.error("Erro ao excluir rascunho");
                return false;
            }
        } catch (err) {
            console.error("Erro ao excluir rascunho", err);
            toast.error("Não foi possível excluir o rascunho");
            return false;
        }
    };

    return (
        <DraftContext.Provider value={{
            draftItems,
            market,
            setMarket,
            addItem,
            removeItem,
            clearItems,
            clearDraft,
            handleSaveDraft,
            handleDeleteDraft,
            isSaving,
            savedRascunhos,
            loadingSaved,
            fetchDrafts
        }}>
            {children}
        </DraftContext.Provider>
    );
};

export const useDraft = () => {
    const context = useContext(DraftContext);
    return context;
};
