import { createContext } from "react";
import usePlanner from "../hooks/usePlanner";
import { useSession } from "next-auth/react";
import { PlannerContextProps, PlannerProviderProps } from "../types/Context";
import useHandleCourseDrag from "../hooks/useHandleCourseDrag";
import useCustomCourseSelection from "../hooks/useCustomCourseSelection";

export const PlannerContext = createContext({} as PlannerContextProps);

export function PlannerProvider({
  children,
  plannerId,
  title,
  order,
}: PlannerProviderProps) {
  const { data: session } = useSession();
  const {
    deleteCourse,
    editCustomCourse,
    displayCourse,
    setDisplayCourse,
    totalCredits,
    geSatisfied,
    courseState,
    saveStatus,
    saveError,
    handleCourseUpdate,
    getCourseLabels,
    getAllLabels,
    editCourseLabels,
    updatePlannerLabels,
    updateNotes,
  } = usePlanner({
    userId: session?.user.id,
    plannerId: plannerId,
    title,
    order,
  });

  const { handleDragEnd } = useHandleCourseDrag({
    courseState,
    handleCourseUpdate,
  });

  const { customCourses, handleAddCustom, handleRemoveCustom } =
    useCustomCourseSelection();

  return (
    <PlannerContext.Provider
      value={{
        deleteCourse,
        editCustomCourse,
        displayCourse,
        setDisplayCourse,
        totalCredits,
        geSatisfied,
        courseState,
        handleDragEnd,
        saveStatus,
        saveError,
        getCourseLabels,
        getAllLabels,
        editCourseLabels,
        updatePlannerLabels,
        customCourses,
        handleAddCustom,
        handleRemoveCustom,
        updateNotes,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}
