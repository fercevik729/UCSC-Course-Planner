import {
  Card,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  Option,
  Select,
} from "@mui/joy";
import { StoredCourse } from "../types/Course";
import DraggableCourseCard from "./DraggableCourseCard";
import CourseCard from "./CourseCard";
import { Droppable, DroppableStateSnapshot } from "@hello-pangea/dnd";
import { List, AutoSizer } from "react-virtualized";
import useSearch from "../hooks/useSearch";
import { customCourse } from "@/lib/plannerUtils";
import { InfoOutlined } from "@mui/icons-material";

/**
 * Component for searching for courses to add. `coursesAlreadyAdded` is a list of courses that have
 * already been added to the planner and should be disabled for dragging in search results.
 */
export default function Search() {
  const {
    data,
    loading,
    loadingUseQuery,
    departments,
    handleChangeDepartment,
    handleChangeNumber,
    handleChangeGE,
    handleSearch,
    departmentCode,
    number,
    ge,
    error,
    geOptions,
  } = useSearch();

  function hasResults(data: any): boolean {
    return data && data.coursesBy.length > 0;
  }

  function noResults(data: any): boolean {
    return (!loading && !data) || (data && data.coursesBy.length == 0);
  }

  function createSearchId({
    title,
    departmentCode,
    number,
    quartersOffered,
    credits,
    ge,
  }: StoredCourse) {
    return `${title};${departmentCode};${number};${quartersOffered.join(
      ",",
    )};${credits};${ge.join(",")};search`;
  }

  function getCourseByIndex(index: number) {
    return data.coursesBy[index];
  }

  function getItemCount(data: any, snapshot?: DroppableStateSnapshot): number {
    if (data) {
      return snapshot && snapshot.isUsingPlaceholder
        ? data.coursesBy.length + 1
        : data.coursesBy.length;
    } else {
      return 0;
    }
  }

  function getCoursesList(data: any) {
    if (data) {
      return data.coursesBy.map((course: StoredCourse) => course);
    } else {
      return [];
    }
  }

  function getResultsString(data: any) {
    const itemCount = getItemCount(data);
    const loadingMoreResultsString = loadingUseQuery
      ? "     Loading more results"
      : "";
    return itemCount.toString() + " results" + loadingMoreResultsString;
  }

  function getRowRender({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    parent: any;
    style: any;
  }) {
    const courses = getCoursesList(data);
    // We are rendering an extra item for the placeholder
    // To do this we increased our data set size to include one 'fake' item
    if (!courses[index]) {
      return null;
    }

    const course = courses[index];

    return (
      <div key={key} style={style}>
        <DraggableCourseCard
          key={index}
          course={course}
          index={index}
          draggableId={createSearchId(course)}
        />
      </div>
    );
  }

  return (
    <Card className="w-80" variant="plain">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch(departmentCode ?? "", number, ge ?? "");
        }}
      >
        <div className="grid grid-cols-4 gap-2 p-2">
          <Select
            placeholder="Department"
            name="department"
            aria-label="department"
            className="col-span-4"
            variant="soft"
            onChange={handleChangeDepartment}
            value={departmentCode ?? ""}
          >
            {departments.map((dep) => (
              <Option key={dep.value} value={dep.value}>
                {dep.label}
              </Option>
            ))}
          </Select>
          <FormControl error={error} className="col-span-2">
            <Input
              className="w-full"
              color="neutral"
              placeholder="Number"
              variant="soft"
              name="number"
              aria-label="number"
              onChange={(event) => handleChangeNumber(event.target.value)}
              size="sm"
            />
            {error && (
              <FormHelperText>
                <InfoOutlined />
                Invalid course number
              </FormHelperText>
            )}
          </FormControl>
          <Select
            placeholder="GE"
            name="ge"
            aria-label="ge"
            className="col-span-2 bg-slate-100"
            variant="soft"
            onChange={handleChangeGE}
            value={ge ?? ""}
            size="sm"
          >
            {geOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </form>

      <Droppable
        droppableId={"search-droppable"}
        isDropDisabled={true}
        mode="virtual"
        renderClone={(provided, snapshot, rubric) => {
          const index = rubric.source.index;
          // Null coalesce to custom course since the custom course
          // has an index of -1
          const course = getCourseByIndex(index) ?? customCourse;
          return (
            <CourseCard
              course={course}
              index={index}
              provided={provided}
              isDragging={snapshot.isDragging}
            />
          );
        }}
      >
        {(provided, snapshot) => {
          return (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <div className="mb-4">
                <DraggableCourseCard
                  index={-1}
                  draggableId={createSearchId(customCourse)}
                  course={customCourse}
                />
              </div>
              {hasResults(data) ? (
                <div>
                  <div className="mb-1">{getResultsString(data)}</div>
                  <div className="overflow-y-auto h-[62vh]">
                    <AutoSizer>
                      {({ height, width }) => (
                        <List
                          height={height}
                          rowCount={getItemCount(data, snapshot)}
                          rowHeight={40}
                          width={width}
                          rowRenderer={(props) => getRowRender(props)}
                        />
                      )}
                    </AutoSizer>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-96">
                  {noResults(data) ? (
                    <p className="text-gray-400">No results</p>
                  ) : null}
                  {loading ? (
                    <CircularProgress variant="plain" color="primary" />
                  ) : null}
                </div>
              )}
            </div>
          );
        }}
      </Droppable>
    </Card>
  );
}
