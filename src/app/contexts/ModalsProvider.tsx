import { createContext, useContext } from "react";
import { PlannerContext } from "./PlannerProvider";
import { ModalsContextProps } from "../types/Context";
import useModals from "../hooks/useModals";

export const ModalsContext = createContext({} as ModalsContextProps);

export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const {
    showExportModal,
    setShowExportModal,
    showCourseInfoModal,
    setShowCourseInfoModal,
    onShowCourseInfoModal,
    showMajorSelectionModal,
    setShowMajorSelectionModal,
    showDegreeRequirementsModal,
    setShowDegreeRequirementsModal,
  } = useModals();

  const { courseState } = useContext(PlannerContext);

  return (
    <ModalsContext.Provider
      value={{
        showExportModal,
        setShowExportModal,
        showCourseInfoModal,
        setShowCourseInfoModal,
        onShowCourseInfoModal,
        showMajorSelectionModal,
        setShowMajorSelectionModal,
        showDegreeRequirementsModal,
        setShowDegreeRequirementsModal,
        courseState,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
}
