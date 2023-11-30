import { Card, CardContent, Grid, Link, Typography } from "@mui/joy";
import { StoredCourse } from "../types/Course";
import {
  extractTermFromQuarter,
  getDeptAndNumber,
  isCSE,
  isOffered,
} from "../../lib/plannerUtils";
import { useContext, useState } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";
import { PlannerContext } from "../contexts/PlannerProvider";
import { ModalsContext } from "../contexts/ModalsProvider";
import { WarningAmberRounded } from "@mui/icons-material";
import CloseIconButton from "./CloseIconButton";
import CourseLabel from "./CourseLabel";
import { Label } from "../types/Label";
import { COURSE_BG } from "@/lib/colorConstants";

export default function CourseCard({
  course,
  index,
  quarterId,
  provided,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDragging,
}: {
  course: StoredCourse;
  index: number;
  quarterId?: string;
  provided: DraggableProvided;
  isDragging: boolean;
}) {
  const { deleteCourse, setDisplayCourse, getCourseLabels } =
    useContext(PlannerContext);
  const { onShowCourseInfoModal } = useContext(ModalsContext);
  const [highlighted, setHighlighted] = useState(false);
  const margin = 2;
  const getItemStyle = (draggableStyle: any) => ({
    userSelect: "none",
    margin: `0 0 ${margin}px 0`,
    ...draggableStyle,
  });

  function handleShowCourseInfoModal(course: StoredCourse) {
    const courseTerm = [course, extractTermFromQuarter(quarterId)];
    setDisplayCourse(courseTerm);
    onShowCourseInfoModal();
  }

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      size="sm"
      sx={{
        "&:hover": {
          opacity: 0.5,
        },
      }}
      variant="outlined"
      style={{
        ...getItemStyle(provided.draggableProps.style),
        height: "35px",
        justifyContent: "center",
        backgroundColor: COURSE_BG,
      }}
      onMouseEnter={() => setHighlighted(true)}
      onMouseLeave={() => setHighlighted(false)}
    >
      <CardContent>
        <Grid container alignItems="center" justifyContent="center" spacing={1}>
          <Grid xs={10} className="flex flex-row whitespace-nowrap">
            <Title
              course={course}
              onShowCourseInfoModal={handleShowCourseInfoModal}
              quarterId={quarterId}
            />
            <CourseLabelList labels={getCourseLabels(course)} />
          </Grid>
          <Grid xs={2}>
            {quarterId !== undefined && (
              <CloseIconButton
                onClick={() => deleteCourse(quarterId)(index)}
                sx={{
                  visibility: highlighted ? "visible" : "hidden",
                }}
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

const Title = ({
  course,
  onShowCourseInfoModal,
  quarterId,
}: {
  course: StoredCourse;
  onShowCourseInfoModal: (course: StoredCourse) => void;
  quarterId?: string;
}) => {
  return (
    <Typography
      endDecorator={
        course &&
        isCSE(course) &&
        !isOffered(
          course.quartersOffered,
          extractTermFromQuarter(quarterId),
        ) && <WarningAmberRounded color="warning" />
      }
    >
      <Link
        overlay
        underline="none"
        href="#interactive-card"
        sx={{ color: "text.tertiary" }}
        onClick={() => onShowCourseInfoModal(course)}
      >
        {course ? getDeptAndNumber(course) : "No course"}
      </Link>
    </Typography>
  );
};

const CourseLabelList = ({ labels }: { labels: Label[] }) => {
  return (
    <div className="flex truncate">
      {labels
        ? labels.map((label, index) => (
            <CourseLabel key={index} label={label} displayText={false} />
          ))
        : null}
    </div>
  );
};
