import Image from "next/image";
import LoginButton from "./LoginButton";
import { useSession } from "next-auth/react";
import { Button } from "@mui/joy";
import { ModalsContext } from "../contexts/ModalsProvider";
import { useContext } from "react";

export default function Navbar() {
  const { status } = useSession();
  const { setShowDegreeRequirementsModal } = useContext(ModalsContext);

  return (
    <header className="bg-blue-500 w-full">
      <nav className={`${status !== "authenticated" ? "py-1.5" : "py-0"} px-5`}>
        <div className="flex flex-row">
          {/* Logo and title start */}
          <div className="flex flex-row gap-4 place-items-center pr-2">
            <Image
              src="/images/slug-icon.png"
              width={30}
              height={30}
              alt="Slug Icon"
            />
            {/* <a href="#" className="text-xl font-semibold text-gray-800"> */}
            <a href="#" className="text-xl font-semibold text-white">
              UCSC Course Planner
            </a>
          </div>
          {/* Logo and title end */}

          <div className="flex flex-1 justify-end space-x-2">
            <Button onClick={() => setShowDegreeRequirementsModal(true)}>
              Degree Requirements
            </Button>
            <LoginButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
