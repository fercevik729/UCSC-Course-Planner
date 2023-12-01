import { Label, LabelInput } from "../label/schema";
import { IsInt, IsUUID, Length, Matches, Max, Min } from "class-validator";
import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";

/**
 * An input type that stores data within a course
 */
@InputType()
export class StoredCourseInput {
  @Field()
  @IsUUID("4")
  id!: string;

  @Field()
  @Matches(/[A-Z]{2,6}/g)
  departmentCode!: string;

  @Field()
  @Matches(/[0-9]{1,3}[A-Z]?/g)
  number!: string;

  @Field()
  @Length(1, 255)
  title!: string;

  @Field()
  @IsInt()
  @Max(10)
  @Min(1)
  credits!: number;

  @Field(() => [String])
  labels!: string[];

  @Field(() => [String])
  ge!: string[];

  @Field(() => [String])
  @Length(0, 4)
  quartersOffered!: string[];
}

/**
 * An input type that stores data within a quarter
 */
@InputType()
export class QuarterInput {
  @Field()
  id!: string;

  @Field()
  @Length(1, 16)
  title!: string;

  @Field(() => [StoredCourseInput])
  courses!: StoredCourseInput[];
}

/**
 * An input type that stores data within a planner
 */
@InputType()
export class PlannerDataInput {
  @Field(() => [QuarterInput])
  quarters!: QuarterInput[];

  @Field(() => Int)
  @Min(1)
  @Max(10)
  years!: number;

  @Field(() => [LabelInput])
  labels!: LabelInput[];
}

/**
 * An object type that stores data within a course
 */
@ObjectType()
export class StoredCourse {
  @Field()
  @IsUUID("4")
  id!: string;

  @Field()
  @Matches(/[A-Z]{2,6}/g)
  departmentCode!: string;

  @Field()
  @Matches(/[0-9]{1,3}[A-Z]?/g)
  number!: string;

  @Field()
  @Length(1, 255)
  title!: string;

  @Field()
  @IsInt()
  @Max(10)
  @Min(1)
  credits!: number;

  @Field(() => [String])
  labels!: string[];

  @Field(() => [String])
  ge!: string[];

  @Field(() => [String])
  @Length(0, 4)
  quartersOffered!: string[];
}

/**
 * An object type that stores data within a quarter
 */
@ObjectType()
export class Quarter {
  @Field()
  id!: string;

  @Field()
  @Length(1, 16)
  title!: string;

  @Field(() => [StoredCourse])
  courses!: StoredCourse[];
}

@ObjectType()
export class PlannerTitle {
  @Field()
  title!: string;

  @Field()
  @IsUUID("4")
  id!: string;
}

/**
 * An object type that stores data within a planner
 */
@ObjectType()
export class PlannerData {
  @Field(() => [Quarter])
  quarters!: Quarter[];

  @Field(() => Int)
  @Min(1)
  @Max(10)
  years!: number;

  @Field(() => [Label])
  labels!: Label[];
}

/**
 * An object type that stores a planner's id
 */
@ObjectType()
export class PlannerId {
  @Field()
  @IsUUID("4")
  plannerId!: string;
}

/**
 * An argument/input type for creating or updating a planner
 */
@InputType()
export class PlannerCreateInput {
  @Field()
  userId!: string;

  @Field()
  @IsUUID("4")
  plannerId!: string;

  @Field(() => PlannerDataInput, { name: "plannerData" })
  plannerData!: PlannerDataInput;

  @Field()
  @Length(1, 32)
  title!: string;

  @Field()
  @IsInt()
  @Min(0)
  order!: number;
}

/**
 * An argument/input type for retrieving or deleting a planner
 */
@ArgsType()
export class PlannerRetrieveInput {
  @Field()
  userId!: string;

  @Field()
  @IsUUID("4")
  plannerId!: string;
}
