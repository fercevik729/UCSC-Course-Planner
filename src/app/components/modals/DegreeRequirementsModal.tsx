import {
  Modal,
  Sheet,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
} from "@mui/joy";
import { ModalsContext } from "@/app/contexts/ModalsProvider";
import { useContext, useState } from "react";
import { StoredCourse } from "@/app/types/Course";
import { PlannerContext } from "@/app/contexts/PlannerProvider";
import { Quarter } from "@/app/types/Quarter";
import { findCoursesInQuarter } from "@/app/types/PlannerData";
import SelectCoursesModal from "./SelectCoursesModal";
import { Add } from "@mui/icons-material";

export default function DegreeRequirementsModal() {
  const { showDegreeRequirementsModal, setShowDegreeRequirementsModal } =
    useContext(ModalsContext);
  const { courseState } = useContext(PlannerContext);
  const [showSelectCoursesModal, setShowSelectCoursesModal] = useState(false);
  const [requirements, setRequirements] = useState<StoredCourse[]>([]);

  function getCoursesFromCourseState() {
    const allCourses: StoredCourse[] = [];

    for (const index in courseState.quarters) {
      const quarter: Quarter = courseState.quarters[index];
      const courses = findCoursesInQuarter(courseState, quarter.id);
      allCourses.push(...courses);
    }

    return allCourses;
  }

  function handleAddCoursesToDegreeRequirements(courses: StoredCourse[]) {
    const coursesToAdd: StoredCourse[] = [];
    courses.forEach((course) => {
      if (!requirements.includes(course)) {
        coursesToAdd.push(course);
      }
    });
    setRequirements([...requirements, ...coursesToAdd]);
  }

  return (
    <>
      <SelectCoursesModal
        showModal={showSelectCoursesModal}
        setShowModal={setShowSelectCoursesModal}
        courses={getCoursesFromCourseState()}
        onAddCourses={handleAddCoursesToDegreeRequirements}
      />
      <Modal
        open={showDegreeRequirementsModal}
        onClose={() => setShowDegreeRequirementsModal(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "30%",
            margin: 10,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            Edit Degree Requirements
          </Typography>
          <List component="ol" marker="decimal">
            {requirements.map((course, index) => (
              <ListItem key={index}>
                {course.departmentCode + " " + course.number}
              </ListItem>
            ))}
          </List>

          <Button
            variant="plain"
            onClick={() => setShowSelectCoursesModal(true)}
            startDecorator={<Add />}
          >
            Add requirements
          </Button>

          <DialogActions>
            <Button variant="solid" color="primary">
              Save
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setShowDegreeRequirementsModal(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </Sheet>
      </Modal>
    </>
  );
}
