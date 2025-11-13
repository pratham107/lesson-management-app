import Link from "next/link";
import AddLessonForm from "@/components/form/AddLessonForm";
import LessonTable from "@/components/table/LessonTable";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-center items-center p-3 px-5 text-sm">
            <div className="flex gap-5 justify-center items-center font-semibold">
              <Link href={"/"}>Lesson management platform</Link>
            </div>
          </div>
        </nav>
        <div>
          <AddLessonForm />
        </div>
        <div>
         <LessonTable />
        </div>
      </div>
    </main>
  );
}
