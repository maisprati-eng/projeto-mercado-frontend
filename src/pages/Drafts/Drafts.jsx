import { useEffect } from "react";
import styles from "./Drafts.module.css";
import UnitPriceComparatorModal from "../../components/UnitPriceComparatorModal/UnitPriceComparatorModal";
import DraftModal from "../../components/Drafts/DraftModal";
import { DraftItem } from "../../components/Drafts/DrafItem";
import DraftsTable from "../../components/Drafts/Table/DraftsTable";
import { useModal } from "../../contexts/ModalContext";
import formatLocalDate from "../../utils/formatDate";
import { useDraft } from "../../contexts/DraftContext";

const Drafts = () => {
  const {
    isDraftModalOpen,
    isUnitCompareModalOpen,
    openUnitCompareModal,
  } = useModal();

  const {
    draftItems = [],
    savedRascunhos,
    loadingSaved,
    fetchDrafts
  } = useDraft();

  const handleUnitCompareClick = () => {
    openUnitCompareModal();
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const hasSavedRascunhos = savedRascunhos && savedRascunhos.length > 0;
  const hasDraftItems = draftItems && draftItems.length > 0;

  return (
    <main>
      <header className={styles.headerSection} role="banner">
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Rascunho de Compras</h1>
          <h2 className={styles.subtitle}>
            Organize suas compras em tempo real enquanto está no mercado
          </h2>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.btnUnitCompare}
            onClick={handleUnitCompareClick}
            type="button"
          >
            Comparação unitária
          </button>
        </div>
      </header>

      <DraftItem hasSavedRascunhos={hasSavedRascunhos} />

      {hasSavedRascunhos && !hasDraftItems && (
        <section style={{ padding: "1.5rem 0" }}>
          <DraftsTable
            savedRascunhos={savedRascunhos}
            refresh={fetchDrafts}
            formatDate={formatLocalDate}
            loading={loadingSaved}
          />
        </section>
      )}

      {isUnitCompareModalOpen && <UnitPriceComparatorModal />}
      {isDraftModalOpen && <DraftModal />}
    </main>
  );
};

export default Drafts;