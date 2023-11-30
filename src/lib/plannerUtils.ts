import { Quarter } from "../app/types/Quarter";
import { PlannerData, findCourseById } from "../app/types/PlannerData";
import {
  PlannerDataInput,
  QuarterInput,
  PlannerData as PlannerDataOutput,
} from "@/graphql/planner/schema";
import { Term } from "../app/types/Quarter";
import { StoredCourse } from "@/app/types/Course";
import { v4 as uuidv4 } from "uuid";
import { initialLabels } from "./labels";
import { LabelColor } from "@prisma/client";

const quarterNames = ["Summer", "Fall", "Winter", "Spring"];
const years = 4;
export const quartersPerYear = 4;

export const initialPlanner: PlannerData = {
  quarters: createQuarters(),
  years,
  courses: [],
  labels: initialLabels,
};

export const emptyPlanner: PlannerData = {
  quarters: [],
  years,
  courses: [],
  labels: [],
};

export function createQuarters() {
  const quarters: Quarter[] = [];

  for (let year = 0; year < years; year++) {
    for (let quarter = 0; quarter < quartersPerYear; quarter++) {
      const id = `quarter-${year}-${quarterNames[quarter]}`;
      quarters.push({
        id,
        title: `${quarterNames[quarter]}`,
        courses: [],
      });
    }
  }

  return quarters;
}

export function serializePlanner(courseState: PlannerData): PlannerDataInput {
  const result: PlannerDataInput = {
    years: courseState.years,
    quarters: [],
    labels: courseState.labels.map((l) => {
      return {
        ...l,
        color: l.color as string,
      };
    }),
  };

  courseState.quarters.forEach((q) => {
    const quarter: QuarterInput = {
      id: q.id,
      title: q.title,
      courses: q.courses.map((cid) => {
        const course = findCourseById(courseState, cid);
        course.title = getTitle(course);
        return course;
      }),
    };
    result.quarters.push(quarter);
  });

  return result;
}

export function deserializePlanner(output: PlannerDataOutput): PlannerData {
  console.log(`GOT ${JSON.stringify(output, null, 2)}`);
  const result: PlannerData = {
    years: output.years,
    quarters: [],
    courses: [],
    labels: output.labels.map((l) => {
      return {
        ...l,
        color: l.color as LabelColor,
      };
    }),
  };

  output.quarters.forEach((q) => {
    const quarter: Quarter = {
      title: q.title,
      id: q.id,
      courses: [],
    };
    q.courses.forEach((c) => {
      result.courses.push(c);
      quarter.courses.push(c.id);
    });
    result.quarters.push(quarter);
  });

  return result;
}

export const customCourse: StoredCourse = {
  id: uuidv4(),
  credits: 5,
  departmentCode: "",
  number: "",
  title: "Custom Course",
  ge: [],
  quartersOffered: ["Fall", "Winter", "Spring"],
  labels: [],
};

export function getDeptAndNumber({
  departmentCode,
  number,
  title,
}: StoredCourse): string {
  if (departmentCode !== "" && number !== "")
    return `${departmentCode} ${number}`;
  return `${title}`;
}

export function isCustomCourse({
  departmentCode,
  number,
}: StoredCourse): boolean {
  return departmentCode === "" || number === "";
}

export function getTitle({ title, departmentCode, number }: StoredCourse) {
  return title !== undefined && title.length > 0
    ? title
    : `${departmentCode} ${number}`;
}

export function createCourseFromId(id: string): Omit<StoredCourse, "id"> {
  const [title, departmentCode, number, quarters, credits, ge] = id.split(";");
  const quartersOffered = quarters.split(",");
  const ges = ge.split(",");
  return {
    title,
    departmentCode,
    number,
    quartersOffered,
    credits: parseInt(credits),
    ge: ges,
    labels: [],
  };
}

export function getUniqueCoursesForGrad(planner: PlannerData): any[] {
  const unique = new Map();

  for (const { departmentCode, number, title, credits } of planner.courses) {
    const key = `${departmentCode}|${number}|${title}|${credits}`;
    if (!unique.has(key)) unique.set(key, { credits });
  }
  return Array.from(unique.values());
}

/**
 * Computes the total credits of a student planner
 * @param planner a course planner object
 * @returns total number of credits
 */
export function getTotalCredits(planner: PlannerData): number {
  const uniqueCourses = getUniqueCoursesForGrad(planner);
  return uniqueCourses.reduce((acc, c) => {
    return acc + c.credits;
  }, 0);
}

/**
 * Returns a list of all the satisfied GE's in a planner
 * @param planner a course planner object
 * @returns list of GEs satisfied
 */
export function getGeSatisfied(planner: PlannerData): string[] {
  return planner.courses.flatMap((c) => c.ge);
}

export function isCSE(course: StoredCourse): boolean {
  return course.departmentCode === "CSE";
}

/**
 * Extracts the term from a quarter ID
 * @param qid quarter Id of the format `quarter-{year}-{term}`
 * @returns term name
 */
export function extractTermFromQuarter(
  qid: string | undefined,
): Term | undefined {
  if (qid === undefined) return undefined;

  const tokens = qid.split("-");
  return tokens[tokens.length - 1] as Term;
}

export function isOffered(
  quartersOffered: string[],
  term: Term | undefined,
): boolean {
  if (term === undefined) return true;
  return quartersOffered.find((t) => (t as Term) == term) !== undefined;
}
