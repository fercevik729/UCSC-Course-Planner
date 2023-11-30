import { List, ListItem } from "@mui/joy";
import Planner from "./Planner";
import PlannerTabs from "./PlannerTabs";
import Navbar from "./Navbar";
import ScreenSizeWarning from "./ScreenSizeWarning";
import Footer from "./Footer";
import { useContext } from "react";
import {
  PlannersContext,
  PlannersProvider,
} from "../contexts/PlannersProvider";
import { PlannerProvider } from "../contexts/PlannerProvider";
import { ModalsProvider } from "../contexts/ModalsProvider";

export default function App() {
  return (
    <PlannersProvider>
      <div className="h-full min-h-screen w-full bg-slate-200 flex flex-col justify-between">
        <ScreenSizeWarning />
        <ModalsProvider>
          <Navbar />
          <div className="pt-4 mb-auto">
            <div className="flex justify-left px-7">
              <PlannerTabs />
            </div>
            <div className="px-5">
              <PlannerList />
            </div>
          </div>
        </ModalsProvider>
        <Footer />
      </div>
    </PlannersProvider>
  );
}

function PlannerList() {
  const { planners } = useContext(PlannersContext);
  return (
    <>
      {/* Start helpful tips for user */}
      {Object.keys(planners).length == 0 && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="text-2xl font-semibold">
            Welcome to UCSC Course Planner!
          </div>
          <div className="text-lg text-center">
            To get started, click the <b>+</b> button above to create a new
            planner.
          </div>
          <div className="text-sm text-slate-600 flex flex-row items-end gap-2 text-center pt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="red"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>
              (Login to save your progress - Your progress will not be saved if
              you login after creating a planner)
            </span>
          </div>
        </div>
      )}
      {/* End helpful tips */}
      <List>
        {Object.keys(planners).map((id, index) => (
          <ListItem
            sx={{ display: planners[id][1] ? "block" : "none" }}
            key={id}
          >
            <PlannerProvider
              plannerId={id}
              title={planners[id][0]}
              order={index}
            >
              <Planner isActive={planners[id][1]} />
            </PlannerProvider>
          </ListItem>
        ))}
      </List>
    </>
  );
}
