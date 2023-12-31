import { Card, CssVarsProvider } from "@mui/joy";
import { useState } from "react";
import CustomCourseSelection from "./CustomCourseSelection";
import SearchInputs from "./SearchInputs";
import SearchResults from "./SearchResults";

/**
 * Component for searching for courses to add.
 */
export default function Search() {
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMoreResults, setLoadingMoreResults] = useState<boolean>(false);

  return (
    <CssVarsProvider defaultMode="system">
      <CustomCourseSelection />
      <Card className="w-80" variant="plain">
        <SearchInputs
          onUpdateCourses={setCourses}
          onUpdateLoading={setLoading}
          onUpdateLoadingMoreResults={setLoadingMoreResults}
        />
        <SearchResults
          courses={courses}
          loading={loading}
          loadingUseQuery={loadingMoreResults}
        />
      </Card>
    </CssVarsProvider>
  );
}
