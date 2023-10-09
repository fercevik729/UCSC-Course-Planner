import { Member } from "../graphql/member/schema";
import { APP_URL } from "../config";
import CoursePlanner from "./components/CoursePlanner";

export const dynamic = 'force-dynamic';

async function fetchMembers(): Promise<Member[]>{
  // Retrieving information about team members
  const query = "query member {member { name, email }}";

  const url =  `${APP_URL}/api/graphql`;
  console.log(`url is ${url}`);

  const resMembers = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  try {
    const jsonMembers = await resMembers.json();
    return jsonMembers.data.member;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function Home() {
  const members = await fetchMembers();
  return (
    <main>
      <div className="grid place-items-center py-10 gap-2">
      <div id="members" className="text-3xl pb-3">Meet the team members!</div>
      {members.map((member) => (
        <div
          key={member.name}
          className="grid grid-cols-2 place-items-center"
        >
          <div className="col-span-1">{member.name}</div>
          <div className="col-span-1">{member.email}</div>
        </div>
      ))}
      </div>
      <CoursePlanner />
    </main>
  );
}
