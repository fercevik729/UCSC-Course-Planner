import { PlannerData } from "@/app/types/PlannerData";
import { StoredCourse } from "../app/types/Course";

export function getTitle(department: string, number: string) {
  return `${department} ${number}`;
}

/**
 * Creates a `StoredCourse` from an id
 * @param id course id
 * @returns a `StoredCourse` object
 */
export function createCourseFromId(id: string): StoredCourse {
  const [departmentCode, number, quarters, ge, credits] = id.split("-");
  const quartersOffered = quarters.split(",");
  const ges = ge.split(",");
  return {
    departmentCode,
    number,
    ge: ges,
    quartersOffered,
    credits: parseInt(credits),
  };
}

/**
 * Creates an id from a `StoredCourse` object
 * @param course `StoredCourse` object
 * @returns an id
 */
export function createIdFromCourse(course: StoredCourse): string {
  const { departmentCode, number, quartersOffered, ge, credits } = course;
  return `${departmentCode}-${number}-${quartersOffered.join(",")}-${ge.join(
    ",",
  )}-${credits}`;
}

/**
 * Computes the total credits of a student planner
 * @param planner a course planner object
 * @returns total number of credits
 */
export function getTotalCredits(planner: PlannerData): number {
  let totalCredits = 0;
  planner.quarters.forEach((q) => {
    totalCredits += q.courses.reduce((acc, c) => {
      return acc + c.credits;
    }, 0);
  }, 0);
  return totalCredits;
}

/**
 * Creates a string of the quarters offered for a course
 */
export function createQuartersOfferedString(course: StoredCourse) {
  if (course.quartersOffered.length === 0) {
    return "None";
  } else {
    return course.quartersOffered.reduce((acc: any, curr: any) => {
      return acc + ", " + curr;
    });
  }
}
