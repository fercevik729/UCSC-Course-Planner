import { StoredCourse } from "@/app/types/Course";
import {
  Modal,
  Sheet,
  DialogActions,
  Typography,
  ListItem,
  Button,
  List,
  ListItemContent,
} from "@mui/joy";
import { Checkbox } from "@mui/material";
import { useState } from "react";

export default function SelectCoursesModal({
  showModal,
  setShowModal,
  courses,
  onAddCourses,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  courses: StoredCourse[];
  onAddCourses: (courses: StoredCourse[]) => void;
}) {
  const [selectedCourses, setSelectedCourses] = useState<StoredCourse[]>([]);

  function handleAddCourses() {
    onAddCourses(selectedCourses);
    setShowModal(false);
  }

  function handleToggleSelectedCourse(course: StoredCourse) {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  }

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
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
          Add Degree Requirements
        </Typography>

        {/* create a list of checkbox items which have a label next to them */}
        <List>
          {courses.map((course, index) => (
            <ListItem
              key={index}
              startAction={
                <Checkbox
                  checked={selectedCourses.includes(course)}
                  onChange={() => handleToggleSelectedCourse(course)}
                />
              }
            >
              <ListItemContent>
                {course.departmentCode + " " + course.number}
              </ListItemContent>
            </ListItem>
          ))}
        </List>

        <Button variant="plain" onClick={handleAddCourses}>
          Add selected courses
        </Button>

        <DialogActions>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Sheet>
    </Modal>
  );
}
