import { PlannerData } from "@/app/types/PlannerData";
import { CourseService } from "@/graphql/course/service";
import { MajorService } from "@/graphql/major/service";
import { PlannerService } from "@/graphql/planner/service";
import { initialPlanner, serializePlanner } from "@/lib/plannerUtils";
import prisma from "@/lib/prisma";
import { expect } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";

beforeAll(async () => {
  await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "sammyslug@ucsc.edu",
      name: "Sammy Slug",
    },
  });

  console.log("✨ 1 user successfully created!");

  await prisma.course.createMany({
    data: [
      {
        department: "Computer Science and Engineering",
        departmentCode: "CSE",
        title: "Computer Systems and Assembly Language and Lab",
        number: "12",
        credits: 7,
        prerequisites: "CSE 20",
        ge: ["mf"],
        quartersOffered: ["Fall", "Winter", "Spring"],
      },
      {
        department: "Computer Science and Engineering",
        departmentCode: "CSE",
        title: "Computer Systems and C Programming",
        number: "13S",
        credits: 7,
        prerequisites: "None",
        ge: ["si", "peT"],
        quartersOffered: ["Fall", "Winter"],
      },
      {
        department: "Computer Science and Engineering",
        departmentCode: "CSE",
        title: "Introduction to Data Structures and Algorithms",
        number: "101",
        credits: 5,
        prerequisites: "None",
        ge: ["None"],
        quartersOffered: ["Fall", "Winter"],
      },
      {
        department: "Computer Science and Engineering",
        departmentCode: "CSE",
        title: "Introduction to Algorithm Analysis",
        number: "102",
        credits: 5,
        prerequisites: "None",
        ge: ["None"],
        quartersOffered: ["Fall", "Winter", "Spring"],
      },
      {
        department: "Mathematics",
        departmentCode: "Math",
        title: "Calculus",
        number: "19A",
        credits: 5,
        prerequisites: "None",
        ge: ["None"],
        quartersOffered: ["Fall", "Winter", "Spring"],
      },
    ],
  });

  console.log("✨ 4 courses successfully created!");
});

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteQuarters = prisma.quarter.deleteMany();
  const deleteCourses = prisma.course.deleteMany();
  const deleteLabels = prisma.label.deleteMany();
  const deleteMajors = prisma.major.deleteMany();

  await prisma.$transaction([
    deleteUsers,
    deleteQuarters,
    deleteCourses,
    deleteLabels,
    deleteMajors,
  ]);

  await prisma.$disconnect();
});

it("should create 1 empty planner for 1 user", async () => {
  const user = await createUser();
  const service = new PlannerService();
  const planners = await service.allPlanners(user.id);
  expect(planners).toHaveLength(0);

  const plannerId = await createPlanner(initialPlanner(), service, user);

  // Cleanup
  const deleted = await service.deletePlanner({ userId: user.id, plannerId });
  expect(deleted).toBeTruthy();
  const deleteCheck = await service.getPlanner({ userId: user.id, plannerId });
  expect(deleteCheck).toBeNull();
});

it("should update 1 planner for 1 user", async () => {
  const user = await createUser();
  const service = new PlannerService();
  const planners = await service.allPlanners(user.id);
  expect(planners).toHaveLength(0);

  const plannerId = await createPlanner(initialPlanner(), service, user);

  // Update planner with some courses
  const cseCourses = [
    {
      id: uuidv4(),
      departmentCode: "CSE",
      number: "12",
      title: "CSE 12",
      credits: 7,
      ge: ["None"],
      quartersOffered: ["Fall", "Winter"],
      labels: [],
    },
    {
      id: uuidv4(),
      departmentCode: "CSE",
      number: "16",
      title: "CSE 16",
      credits: 5,
      ge: ["mf", "si"],
      quartersOffered: ["Fall", "Winter", "Spring"],
      labels: [],
    },
    {
      id: uuidv4(),
      departmentCode: "CSE",
      title: "CSE 30",
      number: "30",
      credits: 5,
      ge: ["None"],
      quartersOffered: ["Fall", "Winter", "Spring"],
      labels: [],
    },
    {
      id: uuidv4(),
      departmentCode: "SGI",
      title: "Custom class",
      number: "40N",
      credits: 5,
      ge: [],
      quartersOffered: ["Summer"],
      labels: [],
    },
  ];
  const plannerData = initialPlanner();
  cseCourses.forEach((c) => {
    plannerData.quarters[0].courses.push(c.id);
    plannerData.courses.push(c);
  });

  const res2 = await service.upsertPlanner({
    userId: user.id,
    plannerId: plannerId,
    title: "Planner 1",
    order: 0,
    plannerData: serializePlanner(plannerData),
  });
  expect(res2.plannerId).toBe(plannerId);

  // Ensure there is only 1 planner for that user
  const allPlanners = await service.allPlanners(user.id);
  expect(allPlanners).toHaveLength(1);
  // Ensure the content of that planner is updated
  const check2 = await service.getPlanner({ userId: user.id, plannerId });
  expect(check2).not.toBeNull();
  const courses = check2?.quarters[0].courses;
  expect(courses).toBeDefined();
  expect(courses).toHaveLength(cseCourses.length);
  courses?.forEach((c, idx) => {
    expect(c).toStrictEqual(cseCourses[idx]);
  });
  // Cleanup
  const deleted = await service.deletePlanner({ userId: user.id, plannerId });
  expect(deleted).toBeTruthy();
  const deleteCheck = await service.getPlanner({ userId: user.id, plannerId });
  expect(deleteCheck).toBeNull();
});

it("should return null to delete missing planner", async () => {
  const user = await createUser();
  const service = new PlannerService();
  const res = await service.deletePlanner({
    plannerId: uuidv4(),
    userId: user.id,
  });

  expect(res).toBeNull();
});

it("should handle department retrieval correctly", async () => {
  const service = new CourseService();

  const departments = await service.getAllDepartments();

  expect(departments).toBeDefined();
  expect(Array.isArray(departments)).toBe(true);
  expect(departments).toContainEqual(
    expect.objectContaining({ name: "Computer Science and Engineering" }),
  );
  expect(departments).toContainEqual(
    expect.objectContaining({ name: "Mathematics" }),
  );
});

it("should filter courses by GE requirement", async () => {
  const service = new CourseService();

  // Test filtering by a specific GE requirement
  const geFilter = "mf";
  const filteredCourses = await service.coursesBy({
    departmentCode: "CSE",
    ge: geFilter,
  });

  // Assert that all returned courses have the specified GE requirement
  expect(filteredCourses).toBeDefined();
  expect(Array.isArray(filteredCourses)).toBe(true);
  filteredCourses.forEach((course) => {
    expect(course.ge).toContain(geFilter);
  });

  // Assert that at least one course is returned
  expect(filteredCourses.length).toBeGreaterThan(0);
});

it("should return the correct labels for each course", async () => {
  const user = await createUser();
  const service = new PlannerService();
  const planners = await service.allPlanners(user.id);
  expect(planners).toHaveLength(0);

  const plannerId = uuidv4();
  const plannerData = initialPlanner();
  plannerData.labels[0].name = "Elective";
  plannerData.labels[1].name = "Capstone";
  plannerData.labels[2].name = "DC";
  const cseCourses = [
    {
      id: uuidv4(),
      departmentCode: "CSE",
      number: "12",
      title: "CSE 12",
      credits: 7,
      ge: ["None"],
      quartersOffered: ["Fall", "Winter"],
      labels: [],
    },
    {
      id: uuidv4(),
      departmentCode: "CSE",
      number: "16",
      title: "CSE 16",
      credits: 5,
      ge: ["mf", "si"],
      quartersOffered: ["Fall", "Winter", "Spring"],
      labels: [plannerData.labels[0].id, plannerData.labels[2].id],
    },
    {
      id: uuidv4(),
      departmentCode: "CSE",
      title: "CSE 30",
      number: "30",
      credits: 5,
      ge: ["None"],
      quartersOffered: ["Fall", "Winter", "Spring"],
      labels: [plannerData.labels[0].id, plannerData.labels[1].id],
    },
    {
      id: uuidv4(),
      departmentCode: "SGI",
      title: "Custom class",
      number: "40N",
      credits: 5,
      ge: [],
      quartersOffered: ["Summer"],
      labels: [plannerData.labels[0].id],
    },
  ];
  plannerData.courses = cseCourses;
  plannerData.quarters[0].courses = plannerData.courses.map((c) => c.id);

  const res = await service.upsertPlanner({
    userId: user.id,
    plannerId,
    title: "Planner 1",
    order: 0,
    plannerData: serializePlanner(plannerData),
  });
  expect(res.plannerId).toBe(plannerId);

  // Ensure there is only 1 planner for that user
  const allPlanners = await service.allPlanners(user.id);
  expect(allPlanners).toHaveLength(1);
  // Ensure the content of that planner is updated
  const check2 = await service.getPlanner({ userId: user.id, plannerId });
  expect(check2).not.toBeNull();
  const courses = check2?.quarters[0].courses;
  expect(courses).toBeDefined();
  expect(courses).toHaveLength(cseCourses.length);
  courses?.forEach((c, idx) => {
    expect(c).toStrictEqual(cseCourses[idx]);
  });
});

it("should add major information for 1 user", async () => {
  const user = await createUser();

  // create major
  const name = "Computer Science B.S";
  const catalogYear = "2020-2021";
  const majorData = {
    name,
    catalogYear,
  };
  await prisma.major.create({
    data: {
      ...majorData,
    },
  });

  if (user === null) fail("User was null (this should not happen)");

  const service = new MajorService();
  const userMajor = await service.getUserMajor(user.id);
  expect(userMajor).toBeNull();

  const defaultPlannerId = uuidv4();
  const res = await service.updateUserMajor({
    userId: user.id,
    ...majorData,
    defaultPlannerId,
  });
  expect(res.name).toBe(name);
  expect(res.catalogYear).toBe(catalogYear);

  const check = await service.getUserMajor(user.id);
  expect(check).not.toBeNull();
  expect(check?.catalogYear).toBe(catalogYear);
  expect(check?.name).toBe(name);
  expect(check?.defaultPlannerId).toBe(defaultPlannerId);

  // Clean up
  await prisma.major.deleteMany();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      major: undefined,
    },
  });
});

it("should fail since major doesn't exist", async () => {
  const user = await createUser();
  const service = new MajorService();
  const userMajor = await service.getUserMajor(user.id);
  expect(userMajor).toBeNull();

  const defaultPlannerId = uuidv4();
  const name = "Unknown major";
  const catalogYear = "2020-2021";

  await expect(
    service.updateUserMajor({
      userId: user.id,
      name,
      catalogYear,
      defaultPlannerId,
    }),
  ).rejects.toThrow(
    `could not find major with name ${name} and catalog year ${catalogYear}`,
  );
});

it("should return an empty list", async () => {
  const name = "Brand New Major B.S";
  const catalogYear = "2020-2021";

  await prisma.major.create({
    data: {
      name,
      catalogYear,
    },
  });

  const res = await new MajorService().getMajorDefaultPlanners({
    name,
    catalogYear,
  });

  await prisma.major.delete({
    where: {
      name_catalogYear: {
        name,
        catalogYear,
      },
    },
  });

  expect(res).toHaveLength(0);
});

it("should return correct number of majors", async () => {
  const res = await new MajorService().getAllMajors("2020-2021");
  expect(res).toHaveLength(0);

  await prisma.major.create({
    data: {
      catalogYear: "2020-2021",
      name: "Computer Engineering B.S.",
    },
  });

  const res2 = await new MajorService().getAllMajors("2020-2021");
  expect(res2).toHaveLength(1);
});

async function createUser() {
  const user = await prisma.user.findFirst({
    where: {
      name: "Sammy Slug",
    },
  });
  expect(user).not.toBeNull();

  if (user === null) fail("User was null (this should not happen)");

  return user;
}

async function createPlanner(
  planner: PlannerData,
  service: PlannerService,
  user: any,
): Promise<string> {
  const plannerId = uuidv4();
  const res = await service.upsertPlanner({
    userId: user.id,
    plannerId: plannerId,
    title: "Planner 1",
    order: 0,
    plannerData: serializePlanner(planner),
  });
  expect(res.plannerId).toBe(plannerId);

  const check = await service.getPlanner({ userId: user.id, plannerId });
  expect(check).not.toBeNull();

  return plannerId;
}
