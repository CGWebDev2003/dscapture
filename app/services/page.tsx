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
  info_paragraphs: string[] | null;
  image_path: string | null;
};

async function fetchServices(): Promise<ServiceDefinition[]> {
  const { data, error } = await supabase
    .from<ServiceRecord>("services")
    .select(
      "id, slug, label, headline, subline, info_paragraphs, image_path",
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fehler beim Abrufen der Services:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName =
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_BUCKET ?? "service-carousel";

  return data.map((service) => {
    const imagePath = service.image_path ?? "";
    const normalizedPath = imagePath.replace(/^\/+/, "");
    const imageUrl = imagePath.startsWith("http")
      ? imagePath
      : supabaseUrl
        ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${normalizedPath}`
        : normalizedPath;

    return {
      id: service.slug,
      label: service.label,
      headline: service.headline,
      subline: service.subline,
      paragraphs: service.info_paragraphs ?? [],
      imageUrl,
    } satisfies ServiceDefinition;
  });
}

export default async function ServicesPage() {
  const services = await fetchServices();

  return <ServicesView services={services} />;
}
