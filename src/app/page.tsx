"use client";
import Image from "next/image";
import MajorSelection from "./components/MajorSelection";
import LoginButton from "./components/LoginButton";
import Footer from "./components/Footer";
import { useSession } from "next-auth/react";
import { WarningAmberRounded } from "@mui/icons-material";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@/lib/apolloClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  return (
    <div className="bg-bg-light dark:bg-bg-dark h-full min-h-screen">
      <div className="bg-blue text-light-text dark:text-light-secondary-text h-auto flex flex-row md:grid md:grid-cols-5 px-5 py-4">
        <div className="col-span-1" />
        <div className="col-span-3 flex flex-row place-items-center gap-2 md:gap-6 text-center text-4xl place-self-center">
          <Image
            src="/images/slug-icon.png"
            width={45}
            height={45}
            alt="Slug Icon"
          />
          <div>Welcome to the UCSC Course Planner!</div>
        </div>
        <div className="col-span-1 self-center justify-self-end">
          <LoginButton />
        </div>
      </div>

      {status !== "authenticated" ? (
        <div className="flex flex-row bg-warning-light justify-center items-center gap-2 p-2">
          <WarningAmberRounded color="warning" />
          <div>
            We recommend logging in with your UCSC email for a better
            experience.
          </div>
        </div>
      ) : null}
      <div className="flex flex-col items-center md:py-6 justify-center h-[80vh] w-[33vw] mx-auto">
        <ApolloProvider client={apolloClient}>
          <MajorSelection
            saveButtonName="Next"
            handleSave={() => router.push("/Planner")}
          />
        </ApolloProvider>
      </div>

      <div className="sm:absolute sm:inset-x-0 sm:bottom-0">
        <Footer />
      </div>
    </div>
  );
}
