import { useState } from "react";

export default function useModals() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCourseInfoModal, setShowCourseInfoModal] = useState(false);
  const [showMajorSelectionModal, setShowMajorSelectionModal] = useState(false);
  const [showDegreeRequirementsModal, setShowDegreeRequirementsModal] =
    useState(false);

  function handleShowCourseInfoModal() {
    setShowCourseInfoModal(true);
  }

  return {
    showExportModal,
    setShowExportModal,
    showCourseInfoModal,
    setShowCourseInfoModal,
    onShowCourseInfoModal: handleShowCourseInfoModal,
    showMajorSelectionModal,
    setShowMajorSelectionModal,
    showDegreeRequirementsModal,
    setShowDegreeRequirementsModal,
  };
}
