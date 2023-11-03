import { Button } from "@mui/joy";
import { signIn } from "next-auth/react";

export default function Navbar({
  setShowExportModal,
  setShowMajorCompletionModal,
}: {
  setShowExportModal: any;
  setShowMajorCompletionModal: any;
}) {
  return (
    <header className="bg-white fixed top-0 w-full shadow-md z-50">
      <nav className="container mx-auto py-3">
        <div className="flex justify-between items-center">
          <a href="#" className="text-2xl font-bold text-gray-800">
            UCSC Course Planner
          </a>
          <div className="flex space-x-4">
            <Button onClick={setShowExportModal} variant="plain">
              Export Planner
            </Button>
            <Button onClick={setShowMajorCompletionModal} variant="plain">
              Major Progress
            </Button>
            {/* <Avatar /> */}
            <Button
              variant="plain"
              onClick={() =>
                signIn(
                  "google",
                  // FIXME: link for prod
                  { callbackUrl: "/api/auth/callback/google" },
                  // { callbackUrl: "http://localhost:3000/api/auth/callback/google" }
                )
              }
              // onClick={() => signIn("google")}
            >
              Login with UCSC account
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
