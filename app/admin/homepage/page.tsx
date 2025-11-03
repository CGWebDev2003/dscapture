"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import AdminSidebar from "../adminComponents/adminSidebar/AdminSidebar";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import { supabase } from "@/lib/supabaseClient";

type HomepageImageType = "background" | "overlay";

const bucketName = "homepage-assets";

interface HomepageImage {
  image_type: HomepageImageType;
  public_url: string;
  file_path: string;
}

export default function AdminHomepagePage() {
  const { loading: verifying } = useVerifyAdminAccess();
  const [backgroundImage, setBackgroundImage] = useState<HomepageImage | null>(
    null,
  );
  const [overlayImage, setOverlayImage] = useState<HomepageImage | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingOverlay, setUploadingOverlay] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("homepage_images")
        .select("image_type, public_url, file_path");

      if (error) {
        console.error("Fehler beim Laden der Homepage-Bilder:", error.message);
        return;
      }

      data?.forEach((item) => {
        if (item.image_type === "background") {
          setBackgroundImage(item as HomepageImage);
        }
        if (item.image_type === "overlay") {
          setOverlayImage(item as HomepageImage);
        }
      });
    };

    fetchImages();
  }, []);

  const handleUpload = async (
    event: FormEvent<HTMLFormElement>,
    type: HomepageImageType,
  ) => {
    event.preventDefault();

    const file = type === "background" ? backgroundFile : overlayFile;

    if (!file) {
      alert("Bitte wähle zuerst eine Datei aus.");
      return;
    }

    const setUploading =
      type === "background" ? setUploadingBackground : setUploadingOverlay;
    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          userError?.message ?? "Es konnte kein angemeldeter Nutzer ermittelt werden.",
        );
      }

      const fileExt = file.name.split(".").pop();
      const sanitizedType = type === "background" ? "background" : "overlay";
      const filePath = `${user.id}/${sanitizedType}-${Date.now()}.${
        fileExt ?? "png"
      }`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData?.path ?? filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Die öffentliche URL konnte nicht ermittelt werden.");
      }

      const { error: upsertError, data: upsertData } = await supabase
        .from("homepage_images")
        .upsert(
          {
            image_type: type,
            file_path: uploadData?.path ?? filePath,
            public_url: publicUrl,
          },
          { onConflict: "image_type" },
        )
        .select("image_type, public_url, file_path")
        .single();

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      if (type === "background") {
        setBackgroundImage(upsertData as HomepageImage);
        setBackgroundFile(null);
      } else {
        setOverlayImage(upsertData as HomepageImage);
        setOverlayFile(null);
      }

      event.currentTarget.reset();

      alert("Bild erfolgreich hochgeladen!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler beim Hochladen.";
      console.error(message);
      alert(`Fehler beim Hochladen: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  if (verifying) {
    return (
      <div className="admin-page">
        <AdminSidebar />
        <div className="admin-content">Überprüfung läuft...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Homepage Verwaltung</h1>
        <p>Verwalte hier die Bilder der öffentlichen Startseite.</p>

        <section className="admin-card">
          <h2>Hero Hintergrundbild</h2>
          {backgroundImage?.public_url ? (
            <div className="admin-image-preview">
              <Image
                src={backgroundImage.public_url}
                alt="Aktueller Hintergrund"
                width={400}
                height={225}
                style={{ objectFit: "cover" }}
              />
              <p className="admin-image-path">{backgroundImage.file_path}</p>
            </div>
          ) : (
            <p>Es ist noch kein Hintergrundbild hochgeladen.</p>
          )}

          <form
            onSubmit={(event) => handleUpload(event, "background")}
            className="admin-form"
          >
            <label className="admin-file-input">
              <span>Datei auswählen</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setBackgroundFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
            <button
              type="submit"
              className="adminButton"
              disabled={uploadingBackground}
            >
              {uploadingBackground ? "Lade hoch..." : "Hintergrund speichern"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2>Hero Overlay</h2>
          {overlayImage?.public_url ? (
            <div className="admin-image-preview">
              <Image
                src={overlayImage.public_url}
                alt="Aktuelles Overlay"
                width={300}
                height={400}
                style={{ objectFit: "contain" }}
              />
              <p className="admin-image-path">{overlayImage.file_path}</p>
            </div>
          ) : (
            <p>Es ist noch kein Overlay-Bild hochgeladen.</p>
          )}

          <form
            onSubmit={(event) => handleUpload(event, "overlay")}
            className="admin-form"
          >
            <label className="admin-file-input">
              <span>Datei auswählen</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setOverlayFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="submit"
              className="adminButton"
              disabled={uploadingOverlay}
            >
              {uploadingOverlay ? "Lade hoch..." : "Overlay speichern"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
