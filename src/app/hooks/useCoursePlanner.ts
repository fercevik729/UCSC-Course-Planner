import { createCourseFromId, getTotalCredits } from "@/lib/courseUtils";
import { DragStart, DropResult } from "@hello-pangea/dnd";
import { useCallback, useState } from "react";
import { PlannerData } from "../types/PlannerData";
import { gql } from "@apollo/client";
import useAutosave from "./useAutosave";
import { useEffect } from "react";
import { findQuarter } from "../types/Quarter";
import { useLoadPlanner } from "./useLoad";
import useDeepMemo from "./useDeepMemo";

const SAVE_PLANNER = gql`
  mutation SavePlanner($input: PlannerCreateInput!) {
    upsertPlanner(input: $input) {
      plannerId
    }
  }
`;

export default function useCoursePlanner(input: {
  userId: string | undefined;
  plannerId: string;
  title: string;
  order: number;
}) {
  const [courseState, setCourseState] = useLoadPlanner(
    input.plannerId,
    input.userId,
  );
  const [totalCredits, setTotalCredits] = useState(
    getTotalCredits(courseState),
  );
  const [unavailableQuarters, setUnavailableQuarters] = useState<string[]>([]);
  const [saveData, { loading: saveStatus, error: saveError }] = useAutosave(
    SAVE_PLANNER,
    {},
  );
  const memoAlreadyCourses = useDeepMemo(
    () => coursesAlreadyAdded(),
    [courseState],
  );

  // Auto-saving
  useEffect(() => {
    if (
      input.userId !== undefined &&
      input.title.length > 1 &&
      input.title.length < 20
    ) {
      const variables = {
        input: {
          ...input,
          plannerData: courseState,
        },
      };
      saveData({
        variables,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(input), JSON.stringify(courseState)]);

  useEffect(() => {
    setTotalCredits(getTotalCredits(courseState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseState]);

  /**
   * A curried callback to be invoked upon deleting a course, so
   * as to appropriately rerender the state of the planner
   * @param quarterId id of the quarter card
   * @returns
   */
  const deleteCourse = useCallback((quarterId: string) => {
    return (deleteIdx: number) => {
      const { quarter, idx } = findQuarter(courseState.quarters, quarterId);
      const quarterCourses = quarter.courses;
      const newCourses = [
        ...quarterCourses.slice(0, deleteIdx),
        ...quarterCourses.slice(deleteIdx + 1),
      ];
      setCourseState((prev) => {
        return {
          ...prev,
          quarters: [
            ...prev.quarters.slice(0, idx),
            {
              id: quarter.id,
              title: quarter.title,
              courses: newCourses,
            },
            ...prev.quarters.slice(idx + 1),
          ],
        };
      });
      setTotalCredits(getTotalCredits(courseState));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Check if the dragged course is available in the destination quarter
  const getQuarterFromId = (droppableId: string) => {
    return droppableId.split("-")[2];
  };

  // Handle the drag start event for course items.
  // result Contains information about the current drag event of the array of unavailable quarters.
  const handleOnDragStart = (start: DragStart) => {
    const courseBeingDragged = createCourseFromId(start.draggableId);

    if (courseBeingDragged) {
      const unavailable = courseState.quarters
        .filter((quarter) => {
          return !courseBeingDragged?.quartersOffered.includes(
            getQuarterFromId(quarter.id),
          );
        })
        .map((quarter) => quarter.id);
      setUnavailableQuarters(unavailable);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setUnavailableQuarters([]);
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // add course dragged from 'search-droppable' to quarter
    if (source.droppableId === "search-droppable") {
      const { quarter, idx } = findQuarter(
        courseState.quarters,
        destination.droppableId,
      );

      const newStoredCourses = Array.from(quarter.courses);
      newStoredCourses.splice(
        destination.index,
        0,
        createCourseFromId(draggableId),
      );
      const newQuarter = {
        ...quarter,
        courses: newStoredCourses,
      };

      const newState = {
        ...courseState,
        quarters: [
          ...courseState.quarters.slice(0, idx),
          newQuarter,
          ...courseState.quarters.slice(idx + 1),
        ],
      };

      setCourseState(newState);
      return;
    }

    // delete course dragged into delete area or search-droppable
    if (
      destination.droppableId == "remove-course-area1" ||
      destination.droppableId == "remove-course-area2" ||
      destination.droppableId == "search-droppable"
    ) {
      const { quarter: startQuarter, idx } = findQuarter(
        courseState.quarters,
        result.source.droppableId,
      );
      const newStoredCourses = Array.from(startQuarter.courses);
      newStoredCourses.splice(result.source.index, 1);

      const newQuarter = {
        ...startQuarter,
        courses: newStoredCourses,
      };

      const newState = {
        ...courseState,
        quarters: [
          ...courseState.quarters.slice(0, idx),
          newQuarter,
          ...courseState.quarters.slice(idx + 1),
        ],
      };

      setCourseState(newState);
      return;
    }

    const { quarter: startQuarter, idx } = findQuarter(
      courseState.quarters,
      source.droppableId,
    );
    const { quarter: finishQuarter, idx: idx2 } = findQuarter(
      courseState.quarters,
      destination.droppableId,
    );
    if (startQuarter === finishQuarter) {
      // moving course within startQuarter
      const newStoredCourses = Array.from(startQuarter.courses);
      newStoredCourses.splice(source.index, 1);
      newStoredCourses.splice(
        destination.index,
        0,
        startQuarter.courses[source.index],
      );

      const newQuarter = {
        ...startQuarter,
        courses: newStoredCourses,
      };

      const newState = {
        ...courseState,
        quarters: [
          ...courseState.quarters.slice(0, idx),
          newQuarter,
          ...courseState.quarters.slice(idx + 1),
        ],
      };

      setCourseState(newState);
    } else {
      // moving course from startQuarter to finishQuarter
      const movedStoredCourse = startQuarter.courses[source.index];
      const startStoredCourses = Array.from(startQuarter.courses);
      startStoredCourses.splice(source.index, 1);
      const newStart = {
        ...startQuarter,
        courses: startStoredCourses,
      };

      const finishStoredCourses = Array.from(finishQuarter.courses);
      finishStoredCourses.splice(destination.index, 0, movedStoredCourse);
      const newFinish = {
        ...finishQuarter,
        courses: finishStoredCourses,
      };

      let newState: PlannerData = {
        ...courseState,
        quarters: [
          ...courseState.quarters.slice(0, idx),
          newStart,
          ...courseState.quarters.slice(idx + 1),
        ],
      };
      newState = {
        ...newState,
        quarters: [
          ...newState.quarters.slice(0, idx2),
          newFinish,
          ...newState.quarters.slice(idx2 + 1),
        ],
      };

      setCourseState(newState);
    }
  };

  function coursesAlreadyAdded(): string[] {
    const coursesAlreadyAdded: string[] = [];
    Object.values(courseState.quarters).forEach((quarter) => {
      quarter.courses.forEach((course) => {
        coursesAlreadyAdded.push(course.department + "-" + course.number);
      });
    });
    return coursesAlreadyAdded;
  }

  return {
    courseState,
    totalCredits,
    handleDragEnd,
    memoAlreadyCourses,
    handleOnDragStart,
    unavailableQuarters,
    saveStatus,
    saveError,
    deleteCourse,
  };
}
