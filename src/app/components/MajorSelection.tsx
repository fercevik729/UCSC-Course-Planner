import {
  Select,
  Option,
  Typography,
  Tab,
  Tabs,
  TabList,
  Card,
  Tooltip,
  Button,
} from "@mui/joy";
import Info from "@mui/icons-material/Info";
import { useEffect, useState } from "react";
import useMajorSelection from "../hooks/useMajorSelection";
import { useSession } from "next-auth/react";
import { getInitialPlanner, quartersPerYear } from "@/lib/plannerUtils";

const majors = [
  "CSE BS",
  "CSE BA",
  "AMS BS",
  "AMS BA",
  "BIO BS",
  "BIO BA",
  "CHEM BS",
  "CHEM BA",
  "ECON BS",
  "ECON BA",
  "MATH BS",
  "MATH BA",
  "PHYS BS",
  "PHYS BA",
  "PSY BS",
  "PSY BA",
  "STA BS",
  "STA BA",
];

const years = [
  "2016-2017",
  "2018-2019",
  "2019-2020",
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025",
];

export default function MajorSelection({
  saveButtonName,
  handleSave,
}: {
  handleSave: any;
  saveButtonName: string;
}) {
  const [major, setMajor] = useState("");
  const [catalogYear, setCatalogYear] = useState("");
  const [defaultPlanner, setDefaultPlanner] = useState(0);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const { data: session } = useSession();
  const { onSaveMajor, majorData, loadingSaveMajor } = useMajorSelection(
    session?.user.id,
    handleSaveCompleted,
  );

  useEffect(() => {
    if (majorData) {
      const major = majorData.getMajor;
      updateMajorUseState(
        major.name,
        major.catalog_year,
        major.default_planner_id,
      );
    }
  }, [majorData]);

  function handleChangeMajor(
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) {
    if (newValue != null) {
      setMajor(newValue);
    }
  }

  function handleChangeCatalogYear(
    event: React.SyntheticEvent | null,
    newValue: string | null,
  ) {
    if (newValue != null) {
      setCatalogYear(newValue);
    }
  }

  function handleChangeDefaultPlanner(
    event: any,
    index: number | string | null,
  ) {
    if (typeof index === "number") {
      setDefaultPlanner(index);
    }
  }

  function updateMajorUseState(
    name: string,
    catalog_year: string,
    default_planner_id: number,
  ) {
    setMajor(name);
    setCatalogYear(catalog_year);
    setDefaultPlanner(default_planner_id);
  }

  function handleSaveCompleted(data: any) {
    const major = data.upsertMajor;
    updateMajorUseState(
      major.name,
      major.catalog_year,
      major.default_planner_id,
    );
    handleSave();
  }

  function handleClickSave() {
    setSaveButtonDisabled(true);
    onSaveMajor(major, catalogYear, defaultPlanner);
  }

  return (
    <div className="space-y-4">
      <div>
        <SelectMajorName
          major={major}
          majors={majors}
          onChange={handleChangeMajor}
        />
      </div>
      <div>
        <SelectCatalogYear
          catalogYear={catalogYear}
          years={years}
          onChange={handleChangeCatalogYear}
        />
      </div>
      <div>
        <SelectDefaultPlanner
          defaultPlanner={defaultPlanner}
          onChange={handleChangeDefaultPlanner}
        />
      </div>
      <div className="flex justify-end w-full">
        <Button
          disabled={saveButtonDisabled || loadingSaveMajor}
          variant="plain"
          color="primary"
          onClick={handleClickSave}
        >
          {saveButtonName}
        </Button>
      </div>
    </div>
  );
}

function SelectMajorName({
  major,
  majors,
  onChange,
}: {
  major: string;
  majors: string[];
  onChange: any;
}) {
  return (
    <>
      <Typography level="body-lg">Select your major</Typography>
      <Select
        value={major}
        placeholder="Choose one…"
        variant="soft"
        onChange={onChange}
      >
        {majors.map((major, index) => (
          <Option key={index} value={major}>
            {major}
          </Option>
        ))}
      </Select>
    </>
  );
}

function SelectCatalogYear({
  catalogYear,
  years,
  onChange,
}: {
  catalogYear: string;
  years: string[];
  onChange: any;
}) {
  return (
    <>
      <Typography level="body-lg">Select your catalog year</Typography>
      <Select
        value={catalogYear}
        placeholder="Choose one…"
        variant="soft"
        onChange={onChange}
      >
        {years.map((year, index) => (
          <Option key={index} value={year}>
            {year}
          </Option>
        ))}
      </Select>
    </>
  );
}

function SelectDefaultPlanner({
  defaultPlanner,
  onChange,
}: {
  defaultPlanner: number;
  onChange: any;
}) {
  return (
    <>
      <div className="flex flex-row space-x-2">
        <Typography level="body-lg">Select a default planner</Typography>
        <Tooltip title="The default planner you select will be auto filled into any new planners you create">
          <Info sx={{ color: "gray" }} />
        </Tooltip>
      </div>
      <div className="space-y-2">
        <Tabs value={defaultPlanner} variant="soft" onChange={onChange}>
          <TabList>
            <Tab>4 Year Plan</Tab>
            <Tab>4 Year Plan</Tab>
            <Tab>2 Year Plan</Tab>
            <Tab>None</Tab>
          </TabList>
        </Tabs>
        <MiniPlanner />
      </div>
    </>
  );
}

function MiniPlanner() {
  const planner = getInitialPlanner(0);

  return (
    <Card>
      {Array.from({ length: quartersPerYear }, (_, index) => index).map((i) => {
        const slice_val = quartersPerYear * i;
        const quarters = planner.quarters.slice(
          slice_val,
          slice_val + quartersPerYear,
        );
        return (
          <div key={i} className="flex flex-row space-x-2">
            {quarters.map((quarter, index) => {
              // const courses = findCoursesInQuarter(planner, quarter.id);
              return (
                <div key={index}>
                  <Card>{quarter.title}</Card>
                </div>
              );
            })}
          </div>
        );
      })}
    </Card>
  );
}
