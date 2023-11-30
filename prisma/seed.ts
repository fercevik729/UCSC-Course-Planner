import { Term, PrismaClient, EnrolledCourse } from "@prisma/client";
import { getCourses, getPlanners } from "./csvreader";
import { majors, years } from "@/lib/defaultPlanners";
import { customCourse } from "@/lib/plannerUtils";
import { zip } from "@/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const courses = await getCourses();
  const ops = [];

  // load all the courses into the database
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const updatedCourse = {
      // this helps avoid bugs and makes the code more DRY
      data: {
        department: course.department,
        departmentCode: course.departmentCode,
        number: course.number,
        title: course.title,
        credits: course.credits,
        prerequisites: course.prerequisites,
        ge: course.ge,
        quartersOffered: course.quartersOffered,
      },
    };

    ops.push(
      prisma.course.upsert({
        where: {
          departmentCode_number: {
            departmentCode: course.departmentCode,
            number: course.number,
          },
        },
        update: updatedCourse.data,
        create: updatedCourse.data,
      }),
    );
  }
  console.log(`Loaded ${courses.length} courses`);

  // Load all majors
  for (const m of majors) {
    for (const y of years) {
      ops.push(
        prisma.major.create({
          data: {
            name: m,
            catalogYear: y,
          },
        }),
      );
    }
  }
  await prisma.$transaction([...ops]);
  console.log(`Loaded all majors`);

  const planners = await getPlanners();

  const terms = [Term.Fall, Term.Winter, Term.Spring, Term.Summer];
  const yearKeys = ["1", "2", "3", "4"];

  Object.keys(planners).forEach((catalogYear) => {
    planners[catalogYear].forEach(async (planner: any) => {
      // get quarters and courses
      const quarters: any[] = [];
      yearKeys.forEach((y) => {
        const qs = zip(planner[`Year ${y}`], terms).map((ct) => {
          const [cs, t] = ct;
          const plannedCourses: EnrolledCourse[] = cs.map((c: string) => {
            return {
              ...customCourse,
              title: c,
            };
          });
          return {
            year: y,
            term: t as Term,
            courses: {
              create: plannedCourses,
            },
          };
        });
        quarters.concat(qs);
      });

      // create the default planner
      const [majorName, order] = planner["planner_name"].split(" Planner ");
      const pid = (
        await prisma.planner.create({
          data: {
            title: planner["planner_name"],
            order: parseInt(order),
            quarters: {
              create: quarters,
            },
          },
        })
      ).id;

      await prisma.major.update({
        where: {
          name_catalogYear: {
            name: majorName,
            catalogYear,
          },
        },
        data: {
          defaultPlanners: {
            connect: [{ id: pid }],
          },
        },
      });
    });
  });

  /*
  Object.keys(planners).forEach((year) => {
    
  })
  */
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
