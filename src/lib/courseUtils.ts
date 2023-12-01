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
  const [department, number, quarters, credits] = id.split("-");
  const quartersOffered = quarters.split(",");
  return {
    number,
    department,
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
  const { department, number, quartersOffered, credits } = course;
  return `${department}-${number}-${quartersOffered.join(",")}-${credits}`;
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
