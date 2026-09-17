import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetail } from "@/components/work/WorkDetail";
import { getProjectById, PROJECTS } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/project/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return { title: "Progetto — Panna" };
  }

  return {
    title: `${project.title} — Panna`,
    description: project.description,
  };
}

export default async function Page({ params }: PageProps<"/project/[id]">) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <WorkDetail project={project} />;
}
