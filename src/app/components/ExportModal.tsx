import { Modal, Sheet, Typography } from "@mui/joy";
import { DummyData } from "../ts-types/DummyData";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { DummyCourse } from "../ts-types/Course";
import { Quarter } from "../ts-types/Quarter";

// Create styles
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  quarterTitle: {
    fontSize: 10,
    textAlign: "left",
  },
  page: {
    marginTop: 16,
    alignContent: "center",
  },
  yearView: {
    flexDirection: "row",
    marginHorizontal: 16,
    flexGrow: 1,
  },
  quarterCard: {
    fontSize: 8,
    padding: 10,
    margin: 3,
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderColor: "#D1D5DB",
    borderWidth: 1,
  },
  course: {
    marginTop: 4,
  },
});

function getTitle(course: DummyCourse) {
  return `${course.department} ${course.number}`;
}

export default function CourseSelectionModal({
  courseState,
  setShowModal,
  showModal,
}: {
  courseState: DummyData;
  setShowModal: any;
  showModal: boolean;
}) {
  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          margin: 10,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          height: "80%",
          width: "100%",
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
          Export Planner to PDF
        </Typography>
        <PDFViewer width="100%" height="90%">
          <Document>
            <Page size="A4" style={styles.page}>
              <View>
                <Years courseState={courseState} />
              </View>
            </Page>
          </Document>
        </PDFViewer>
      </Sheet>
    </Modal>
  );
}

function Years({ courseState }: { courseState: DummyData }) {
  return (
    <View>
      {Array.from(
        { length: courseState.quartersPerYear },
        (_, index) => index,
      ).map((i) => {
        const slice_val = courseState.quartersPerYear * i;
        const quarters = courseState.quarterOrder.slice(
          slice_val,
          slice_val + courseState.quartersPerYear,
        );

        return (
          <Quarters key={i} quarters={quarters} courseState={courseState} />
        );
      })}
    </View>
  );
}

function Quarters({
  quarters,
  courseState,
  key,
}: {
  quarters: string[];
  courseState: DummyData;
  key: number;
}) {
  return (
    <View key={key} style={styles.yearView}>
      {quarters.map((quarterId) => {
        const quarter = courseState.quarters[quarterId];
        const courses = quarter.courseIds.map(
          (courseId) => courseState.courses[courseId],
        );

        return <Quarter key={quarter.id} quarter={quarter} courses={courses} />;
      })}
    </View>
  );
}

function Quarter({
  quarter,
  courses,
}: {
  quarter: Quarter;
  courses: DummyCourse[];
}) {
  return (
    <View key={quarter.id} style={styles.quarterCard}>
      <Text style={styles.quarterTitle}>{quarter.title}</Text>
      <View>
        {courses.map((course) => {
          return (
            <View key={course.id} style={styles.course}>
              <Text>{getTitle(course)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}