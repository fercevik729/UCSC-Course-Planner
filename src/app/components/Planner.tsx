import QuarterCard from "./QuarterCard";
import { quartersPerYear } from "../../lib/plannerUtils";
import { PlannerData, findCoursesInQuarter } from "../types/PlannerData";
import Search from "./Search";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState } from "react";
import SaveSnackbars from "./SaveSnackbars";
import { Card, CircularProgress } from "@mui/joy";
import useDebounce from "../hooks/useDebounce";
import { GradProgress } from "./GradProgress";
import { GEProgress } from "./GEProgress";
import { PlannerContext } from "../contexts/PlannerProvider";
import { useContext } from "react";
import PlannerActions from "./PlannerActions";
import { ModalsProvider } from "../contexts/ModalsProvider";
import ExportModal from "./ExportModal";
import CourseInfoModal from "./CourseInfoModal";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from "@mui/joy";
import { Quarter } from "../types/Quarter";
import MajorSelectionModal from "./modals/MajorSelectionModal";

export default function Planner({ isActive }: { isActive: boolean }) {
  const {
    handleDragEnd,
    totalCredits,
    geSatisfied,
    courseState,
    saveStatus,
    saveError,
  } = useContext(PlannerContext);
  const [loading, setLoading] = useState(true);

  useDebounce({
    callback: () => setLoading(status === "loading"),
    delay: 1000,
    dependencies: [status],
  });

  if (!isActive) {
    return <></>;
  }

  return (
    <>
      <SaveSnackbars saving={saveStatus} saveError={saveError} />
      <div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <ModalsProvider>
            <div className="flex justify-between space-x-4">
              <div className="flex-initial pr-2">
                <Search />
              </div>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <div className="overflow-auto h-[92vh] w-full">
                    <Years courseState={courseState} />
                  </div>

                  {/* Modals and Grad Progress */}
                  <div className="self-start">
                    <Card variant="plain">
                      <div>
                        <PlannerActions />
                        <Modals />
                      </div>

                      <hr className="rounded border-t border-slate-300" />

                      <div className="flex justify-items-center">
                        <GradProgress credits={totalCredits} />
                      </div>

                      <hr className="rounded border-t border-slate-300" />

                      <div className="flex place-items-center">
                        <GEProgress ge={geSatisfied} />
                      </div>
                    </Card>
                  </div>
                  {/* End Modals */}
                </>
              )}
            </div>
          </ModalsProvider>
        </DragDropContext>
      </div>
    </>
  );
}

function Modals() {
  return (
    <>
      <CourseInfoModal />
      <ExportModal />
      <MajorSelectionModal />
    </>
  );
}

function Years({ courseState }: { courseState: PlannerData }) {
  return (
    <AccordionGroup>
      <div className="space-y-2">
        {Array.from({ length: quartersPerYear }, (_, index) => index).map(
          (i) => {
            const slice_val = quartersPerYear * i;
            const quarters = courseState.quarters.slice(
              slice_val,
              slice_val + quartersPerYear,
            );

            return (
              <Quarters
                key={i}
                year={i + 1}
                quarters={quarters}
                courseState={courseState}
              />
            );
          },
        )}
      </div>
    </AccordionGroup>
  );
}

function Quarters({
  year,
  quarters,
  courseState,
}: {
  year: number;
  quarters: Quarter[];
  courseState: PlannerData;
}) {
  return (
    <Accordion
      sx={{
        backgroundColor: "white",
        borderRadius: "0.5rem",
        "&.MuiAccordion-root": {
          "& .MuiAccordionSummary-root": {
            padding: "0.5rem 0",
            paddingX: "0.5rem",
          },
        },
      }}
      defaultExpanded={true}
    >
      <AccordionSummary>Year {year}</AccordionSummary>
      <AccordionDetails>
        <div className="flex flex-row space-x-2">
          {quarters.map((quarter) => {
            const courses = findCoursesInQuarter(courseState, quarter.id);
            return (
              <QuarterCard
                id={quarter.id}
                key={quarter.id}
                title={quarter.title}
                courses={courses}
              />
            );
          })}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}
