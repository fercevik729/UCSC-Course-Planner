import { Card } from "@mui/joy";
import DraggableCourseCard from "./DraggableCourseCard";
import { StoredCourse } from "../types/Course";
import { Droppable } from "@hello-pangea/dnd";

export default function QuarterCard({
  title,
  id,
  courses,
}: {
  title: string;
  id: string;
  courses: StoredCourse[];
}) {
  return (
    <Card size="md" className="min-w-[130px] w-full" variant="outlined">
      {title}
      <Droppable droppableId={id}>
        {(provided) => {
          return (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ height: "100%", minHeight: "112px" }}
            >
              {courses.map((course, index) => (
                <DraggableCourseCard
                  key={index}
                  course={course}
                  index={index}
                  draggableId={course.id}
                  quarterId={id}
                />
              ))}
            </div>
          );
        }}
      </Droppable>
    </Card>
  );
}
