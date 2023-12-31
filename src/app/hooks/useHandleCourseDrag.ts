import { DraggableLocation, DropResult } from "@hello-pangea/dnd";
import { PlannerData } from "../types/PlannerData";
import { Quarter, findQuarter } from "../types/Quarter";
import { v4 as uuidv4 } from "uuid";
import { createCourseFromId } from "@/lib/plannerUtils";

const CUSTOM_DROPPABLE = "custom-droppable";
const SEARCH_DROPPABLE = "search-droppable";

export default function useHandleCourseDrag({
  courseState,
  handleCourseUpdate,
}: {
  courseState: PlannerData;
  handleCourseUpdate: any;
}) {
  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    function draggedFromSearch(droppableId: string) {
      return droppableId === SEARCH_DROPPABLE;
    }

    function draggedFromCustom(droppableId: string) {
      return droppableId === CUSTOM_DROPPABLE;
    }

    // ensure that drag is valid
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    if (
      draggedFromSearch(source.droppableId) ||
      draggedFromCustom(source.droppableId)
    ) {
      addCourseFromSearch(draggableId, destination);
      return;
    }

    moveCourse(source, destination);
  }

  function addCourseFromSearch(
    draggableId: string,
    destination: DraggableLocation,
  ) {
    const { quarter, idx } = findQuarter(
      courseState.quarters,
      destination.droppableId,
    );
    const newStoredCourses = Array.from(quarter.courses);
    const cid = uuidv4();
    newStoredCourses.splice(destination.index, 0, cid);
    const course = createCourseFromId(draggableId);
    courseState.courses.push({
      id: cid,
      ...course,
    });
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

    handleCourseUpdate(newState);
  }

  function moveCourse(
    source: DraggableLocation,
    destination: DraggableLocation,
  ) {
    const { quarter: startQuarter, idx } = findQuarter(
      courseState.quarters,
      source.droppableId,
    );
    const { quarter: finishQuarter, idx: idx2 } = findQuarter(
      courseState.quarters,
      destination.droppableId,
    );

    function isSameQuarter(startQuarter: Quarter, finishQuarter: Quarter) {
      return startQuarter.id === finishQuarter.id;
    }

    if (isSameQuarter(startQuarter, finishQuarter)) {
      moveCourseWithinQuarter(startQuarter, source, destination, idx);
    } else {
      moveCourseToNewQuarter(
        startQuarter,
        finishQuarter,
        source,
        destination,
        idx,
        idx2,
      );
    }
  }

  function moveCourseWithinQuarter(
    quarter: Quarter,
    source: DraggableLocation,
    destination: DraggableLocation,
    idx: number,
  ) {
    const newStoredCourses = Array.from(quarter.courses);
    newStoredCourses.splice(source.index, 1);
    newStoredCourses.splice(
      destination.index,
      0,
      quarter.courses[source.index],
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

    handleCourseUpdate(newState);
  }

  function moveCourseToNewQuarter(
    startQuarter: Quarter,
    finishQuarter: Quarter,
    source: DraggableLocation,
    destination: DraggableLocation,
    idx: number,
    idx2: number,
  ) {
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

    handleCourseUpdate(newState);
  }

  return {
    handleDragEnd,
  };
}
