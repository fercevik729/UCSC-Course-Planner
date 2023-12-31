import {
  Card,
  CardContent,
  CssVarsProvider,
  Grid,
  Link,
  Typography,
} from "@mui/joy";
import { StoredCourse } from "../types/Course";
import {
  extractTermFromQuarter,
  getDeptAndNumber,
  isCSE,
  isOffered,
} from "@/lib/plannerUtils";
import { useContext, useState } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";
import { PlannerContext } from "../contexts/PlannerProvider";
import { ModalsContext } from "../contexts/ModalsProvider";
import { WarningAmberRounded } from "@mui/icons-material";
import CloseIconButton from "./CloseIconButton";
import CourseLabel from "./CourseLabel";
import { Label } from "../types/Label";
import { truncateTitle } from "@/lib/utils";
import { MAX_VISIBLE_COURSE_TITLE } from "@/lib/consts";

export default function CourseCard({
  course,
  index,
  quarterId,
  provided,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDragging,
  isCustom,
}: {
  course: StoredCourse;
  index: number;
  quarterId?: string;
  provided: DraggableProvided;
  isDragging: boolean;
  isCustom: boolean;
}) {
  const {
    deleteCourse,
    setDisplayCourse,
    getCourseLabels,
    handleRemoveCustom,
  } = useContext(PlannerContext);
  const { onShowCourseInfoModal } = useContext(ModalsContext);
  const [highlighted, setHighlighted] = useState(false);
  const margin = 2;
  const getItemStyle = (draggableStyle: any) => ({
    userSelect: "none",
    margin: `0 0 ${margin}px 0`,
    ...draggableStyle,
  });
  const isEnrolledCourse = quarterId !== undefined;

  function handleShowCourseInfoModal(course: StoredCourse) {
    const courseTerm = [course, extractTermFromQuarter(quarterId)];
    setDisplayCourse(courseTerm);
    onShowCourseInfoModal();
  }

  return (
    <CssVarsProvider defaultMode="system">
      <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        size="sm"
        variant="soft"
        color={isEnrolledCourse ? "primary" : "neutral"}
        className="hover:opacity-50"
        style={{
          ...getItemStyle(provided.draggableProps.style),
          height: "35px",
          justifyContent: "center",
        }}
        onMouseEnter={() => setHighlighted(true)}
        onMouseLeave={() => setHighlighted(false)}
      >
        <CardContent>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <Grid xs={11} className="flex flex-row whitespace-nowrap">
              <Title
                course={course}
                onShowCourseInfoModal={handleShowCourseInfoModal}
                quarterId={quarterId}
              />
              <CourseLabelList labels={getCourseLabels(course)} />
            </Grid>
            <Grid xs={1}>
              {quarterId !== undefined && (
                <CloseIconButton
                  onClick={() => deleteCourse(quarterId)(index)}
                  sx={{
                    visibility: highlighted ? "visible" : "hidden",
                  }}
                />
              )}
              {isCustom && (
                <CloseIconButton
                  onClick={() => handleRemoveCustom(index)}
                  sx={{
                    visibility: highlighted ? "visible" : "hidden",
                  }}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </CssVarsProvider>
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
        {truncateTitle(
          course ? getDeptAndNumber(course) : "No course",
          MAX_VISIBLE_COURSE_TITLE,
        )}
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
