import { ApolloError, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { deserializePlanner, initialPlanner } from "@/lib/plannerUtils";
import { MultiPlanner } from "../types/MultiPlanner";
import { PlannerData } from "../types/PlannerData";
import { removeTypenames } from "@/lib/utils";
import { convertPlannerTitles } from "@/lib/plannerUtils";
import { GET_PLANNERS, GET_PLANNER } from "@/graphql/queries";
import { initialLabels } from "@/lib/labels";
import { DefaultPlannerContext } from "../contexts/DefaultPlannerProvider";
import useMajorSelection from "./useMajorSelection";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom hook to load all planners for a particular user
 * @param userId id of the user
 * @returns
 */
export const useLoadAllPlanners = (
  userId: string | undefined,
  onLoadedPlanners?: (numPlanners: number) => void,
): [
  MultiPlanner,
  React.Dispatch<React.SetStateAction<MultiPlanner>>,
  { loading: boolean; error: ApolloError | undefined },
] => {
  const [state, setState] = useState<MultiPlanner>({});
  const [getData, { loading, error }] = useLazyQuery(GET_PLANNERS, {
    onCompleted: (data) => {
      if (data.getAllPlanners.length > 0) {
        setState(convertPlannerTitles(data.getAllPlanners));
      }
      if (onLoadedPlanners !== undefined) {
        onLoadedPlanners(data.getAllPlanners.length);
      }
    },
    onError: (err) => {
      console.error(err);
    },
  });

  useEffect(() => {
    if (userId !== undefined) {
      getData({
        variables: {
          userId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return [state, setState, { loading, error }];
};

/**
 * Hook that loads the default planner of a particular user.
 * @param userId id of a user
 * @returns
 */
export const useLoadDefaultPlanner = (userId?: string) => {
  const { userMajorData } = useMajorSelection(userId);
  const plannerId = userMajorData?.defaultPlannerId;
  const skipLoad = userMajorData === undefined || plannerId === undefined;
  return useLoadPlanner({
    plannerId,
    userId: undefined,
    defaultPlanner: initialPlanner(),
    skipLoad,
  });
};

/**
 * Copies a PlannerData, but changes the id's of the courses within the planner
 * to prevent data inconsistencies
 * Also adds a value for notes
 * @param defaultPlanner a defaultPlanner
 * @returns a unique PlannerData instance
 */
const cloneDefaultPlanner = (defaultPlanner: PlannerData): PlannerData => {
  const clone = { ...defaultPlanner };
  // Create a lookup table between old ids and newStoredCourse
  const lookup = {} as any;
  defaultPlanner.courses.forEach((c) => {
    lookup[c.id] = { ...c, id: uuidv4() };
  });
  // Pass the new Stored courses to the clone
  clone.courses = Object.values(lookup);

  // Replace all the references in the quarters to course ids with their new
  // counterparts
  clone.quarters = defaultPlanner.quarters.map((q) => {
    return {
      ...q,
      courses: q.courses.map((crs) => {
        return lookup[crs].id;
      }),
      notes: "",
    };
  });
  return clone;
};

/**
 * Hook to load a user planner
 */
export const useLoadUserPlanner = ({
  userId,
  plannerId,
  skipLoad,
}: {
  userId: string | undefined;
  plannerId: string;
  skipLoad?: boolean;
}) => {
  const { defaultPlanner } = useContext(DefaultPlannerContext);
  const clonedPlanner = cloneDefaultPlanner(defaultPlanner);
  return useLoadPlanner({
    plannerId,
    userId,
    defaultPlanner: clonedPlanner,
    skipLoad,
  });
};

/**
 * Hook to load a planner
 * @param plannerId id of the planner to load
 * @param userId id of the user
 * @returns
 */
export const useLoadPlanner = ({
  plannerId,
  userId,
  defaultPlanner,
  skipLoad,
}: {
  plannerId: string;
  userId: string | undefined;
  defaultPlanner: PlannerData;
  skipLoad?: boolean;
}): [
  PlannerData,
  React.Dispatch<React.SetStateAction<PlannerData>>,
  { loading: boolean; error: ApolloError | undefined },
] => {
  const [planner, setPlanner] = useState<PlannerData>(defaultPlanner);
  const [getData, { loading, error }] = useLazyQuery(GET_PLANNER, {
    onCompleted: (data) => {
      const planner = data.getPlanner;
      if (planner !== null) {
        removeTypenames(planner);
        setPlanner(deserializePlanner(planner));
      }

      if (data.getPlanner === null) {
        autofillWithDefaultPlanner();
      }
    },
    onError: (err) => {
      console.error(err);
    },
    fetchPolicy: "no-cache",
  });

  function autofillWithDefaultPlanner() {
    setPlanner({
      ...defaultPlanner,
      labels: initialLabels(),
    });
  }

  useEffect(() => {
    if (skipLoad) return;
    getData({
      variables: {
        userId,
        plannerId,
      },
    });
  }, [userId, plannerId, getData, skipLoad]);

  return [planner, setPlanner, { loading, error }];
};
