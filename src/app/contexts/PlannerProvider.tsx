import { createContext } from "react";
import usePlanner from "../hooks/usePlanner";
import { useSession } from "next-auth/react";
import { PlannerContextProps, PlannerProviderProps } from "../types/Context";
import useHandleCourseDrag from "../hooks/useHandleCourseDrag";
import useMajorSelection from "../hooks/useMajorSelection";

export const PlannerContext = createContext({} as PlannerContextProps);

export function PlannerProvider({
  children,
  plannerId,
  title,
  order,
}: PlannerProviderProps) {
  const { data: session } = useSession();
  const { majorData } = useMajorSelection(session?.user.id);
  const catalogYear: number = parseInt(
    majorData?.getMajor.catalog_year.split("-")[0],
  );
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
  } = usePlanner(
    {
      userId: session?.user.id,
      plannerId: plannerId,
      title,
      order,
    },
    catalogYear,
  );

  const { handleDragEnd } = useHandleCourseDrag({
    courseState,
    handleCourseUpdate,
  });

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
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}
