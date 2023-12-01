import { ApolloError, gql, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { deserializePlanner, getInitialPlanner } from "@/lib/plannerUtils";
import { MultiPlanner } from "../types/MultiPlanner";
import { PlannerTitle } from "@/graphql/planner/schema";
import { PlannerData } from "../types/PlannerData";
import { removeTypenames } from "@/lib/utils";

const GET_PLANNERS = gql`
  query ($userId: String!) {
    getAllPlanners(userId: $userId) {
      title
      id
    }
  }
`;

const GET_PLANNER = gql`
  query ($userId: String!, $plannerId: String!) {
    getPlanner(userId: $userId, plannerId: $plannerId) {
      quarters {
        title
        id
        courses {
          id
          departmentCode
          number
          quartersOffered
          ge
          title
          credits
          labels
        }
      }
      years
      labels {
        id
        name
        color
      }
    }
  }
`;

/**
 * Custom hook to load all planners for a particular user
 * @param userId id of the user
 * @returns
 */
export const useLoadAllPlanners = (
  userId: string | undefined,
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
 * Custom hook to load a particular user's planner
 * @param plannerId id of the planner to load
 * @param userId id of the user
 * @returns
 */
export const useLoadPlanner = (
  plannerId: string,
  userId: string | undefined,
  userCatalogYear: number,
): [
  PlannerData,
  React.Dispatch<React.SetStateAction<PlannerData>>,
  { loading: boolean; error: ApolloError | undefined },
] => {
  const [state, setState] = useState<PlannerData>(
    getInitialPlanner(userCatalogYear),
  );
  const [getData, { loading, error }] = useLazyQuery(GET_PLANNER, {
    onCompleted: (data) => {
      const planner = data.getPlanner;
      if (planner !== null) {
        removeTypenames(planner);
        setState(deserializePlanner(planner));
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
          plannerId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  return [state, setState, { loading, error }];
};

const convertPlannerTitles = (queryResult: PlannerTitle[]): MultiPlanner => {
  const mp: MultiPlanner = {};

  queryResult.forEach((p, idx) => {
    if (idx == 0) {
      mp[p.id] = [p.title, true];
    } else {
      mp[p.id] = [p.title, false];
    }
  });

  return mp;
};
