import { CourseService } from "./service";
import { Args, Arg, Mutation, Query, Resolver } from "type-graphql";
import {
  AboveOrBelowInput,
  Course,
  DeleteInput,
  OrderedInput,
  QueryInput,
  UpsertInput,
} from "./schema";

/**
 * CourseResolver is a Resolver class that provides custom functionality for
 * courses, which cannot be generated by Prisma
 */
@Resolver()
export class CourseResolver {
  /**
   * Returns all courses with limit 200
   * @returns a list of `Course` instances
   */
  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return await new CourseService().allCourses();
  }

  /**
   * Returns a user-defined number of courses in ascending order
   * of course number for a user specified department.
   * @param input OrderedInput containing department and number of `Course` instances
   * @returns a list of `Course` instances
   */
  @Query(() => [Course])
  async coursesInOrder(@Args() input: OrderedInput): Promise<Course[]> {
    return await new CourseService().coursesInOrder(input);
  }

  /**
   * Returns a list of `Course` that satisfy the conditions in `input`
   * @param input a QueryInput instance
   * @returns a list of `Course` instances
   */
  @Query(() => [Course])
  async coursesBy(@Args() input: QueryInput): Promise<Course[]> {
    return await new CourseService().coursesBy(input);
  }

  /**
   * Return a `Course` instance that matches the `department` and `number` in `input`
   * @param input a QueryInput instance
   * @returns a `Course` instance
   */
  @Query(() => Course)
  async courseBy(@Args() input: QueryInput): Promise<Course | null> {
    return await new CourseService().courseBy(input);
  }

  /**
   * Custom query that asynchronously returns a list of `Course` instances
   * that have a course number less than `input.courseNum`.
   * @param input an `AboveOrBelowInput` instance containing department name and a valid `courseNum`.
   * @returns a list of `Course` instances
   */
  @Query(() => [Course])
  async coursesBelow(@Args() input: AboveOrBelowInput): Promise<Course[]> {
    return await new CourseService().coursesAboveOrBelow(input);
  }

  /**
   * A custom query that asynchronously returns a
   * list of `Course` instances that have a course number strictly greater than `input.courseNum`.
   * @param input an `AboveOrBelowInput` instance containing department name and a valid `courseNum`.
   * @returns a list of `Course` instances
   */
  @Query(() => [Course])
  async coursesAbove(@Args() input: AboveOrBelowInput): Promise<Course[]> {
    return await new CourseService().coursesAboveOrBelow(input, true);
  }

  /**
   * A custom query that asynchronously retrieves a list of unique `Department` names.
   * @returns a list of `Department` instances with unique department names
   */
  @Query(() => [Department])
  async departments(): Promise<Department[]> {
    return await new CourseService().getAllDepartments();
  }

  /**
   * A mutation function that creates a course if one with the same `department`
   * and course `number` does not exist already
   * @param input an `CreateInput` instance
   * @returns the created `Course` instance upon success
   */
  @Mutation(() => Course)
  async createCourse(@Arg("input") input: UpsertInput): Promise<Course> {
    return await new CourseService().createCourse(input);
  }

  /**
   * A mutating function that updates a course provided a valid `department`
   * and course `number` in the input
   * @param input an `CreateInput` instance
   * @returns the created `Course` instance upon success
   */
  @Mutation(() => Course)
  async updateCourse(@Arg("input") input: UpsertInput): Promise<Course> {
    return await new CourseService().updateCourse(input);
  }

  /**
   * A mutation function that deletes a course from a database,
   * provided it exists
   * @param input
   * @returns
   */
  @Mutation(() => Course)
  async deleteCourse(@Arg("input") input: DeleteInput): Promise<Course> {
    return await new CourseService().deleteCourse(input);
  }
}
