import type { Metadata } from "next";
import ServicesView, { type ServiceDefinition } from "./ServicesView";
import { supabase } from "@/lib/supabaseClient";

export const metadata: Metadata = {
  title: "Services | DS_Capture",
  description: "Überblick über die Services von DS_Capture.",
};

export const revalidate = 120;

type ServiceRecord = {
  id: string;
  slug: string;
  label: string;
  headline: string;
  subline: string;
  info_title: string;
  info_paragraphs: string[] | null;
  info_bullet_points: string[] | null;
  gradient_start: string;
  gradient_end: string;
};

async function fetchServices(): Promise<ServiceDefinition[]> {
  const { data, error } = await supabase
    .from<ServiceRecord>("services")
    .select(
      "id, slug, label, headline, subline, info_title, info_paragraphs, info_bullet_points, gradient_start, gradient_end",
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fehler beim Abrufen der Services:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((service) => ({
    id: service.slug,
    label: service.label,
    headline: service.headline,
    subline: service.subline,
    info: {
      title: service.info_title,
      paragraphs: service.info_paragraphs ?? [],
      bulletPoints: service.info_bullet_points ?? [],
    },
    gradient: [service.gradient_start, service.gradient_end] as [string, string],
  }));
}

export default async function ServicesPage() {
  const services = await fetchServices();

  return <ServicesView services={services} />;
}
