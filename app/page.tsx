"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const { scrollY } = useScroll();
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null,
  );
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);

  // Bewegung des Hintergrunds (langsamer)
  const bgY = useTransform(scrollY, [0, 600], [0, 200]);

  // Bewegung des Overlays (schneller)
  // const overlayY = useTransform(scrollY, [0, 600], [0, 500]);

  useEffect(() => {
    const fetchHomepageImages = async () => {
      const { data, error } = await supabase
        .from("homepage_images")
        .select("image_type, public_url");

      if (error) {
        console.error("Fehler beim Laden der Homepage-Bilder:", error.message);
        return;
      }

      data?.forEach((item) => {
        if (item.image_type === "background") {
          setBackgroundImageUrl(item.public_url);
        }
        if (item.image_type === "overlay") {
          setOverlayImageUrl(item.public_url);
        }
      });
    };

    fetchHomepageImages();
  }, []);

  const backgroundSrc = backgroundImageUrl ?? "/DJI_0727.jpg";
  const overlaySrc = overlayImageUrl ?? "/dawid3Mask.png";

  return (
    <>
        <section className={styles.heroSection}>
          <div className={styles.wrapper}>
            {/* Hintergrund (langsamer Parallax) */}
            <motion.div style={{ y: bgY }} className={styles.backgroundWrapper}>
              <Image
                src={backgroundSrc}
                alt="Hintergrund"
                fill
                className={styles.background}
              />
            </motion.div>

            {/* Inhalt */}
            <div className={styles.heroContent}>
              {/* Text links daneben */}
              <div className={styles.textContainer}>
                <h1>Visuelle Exzellenz. Digitale Präzision.</h1>
                <p>DS_Capture vereint Design, Strategie und Technologie zu einem klaren Markenauftritt.</p>
                <button className={styles.ctaButton}>Mehr erfahren</button>
              </div>

              {/* Overlay mit schnellerer Parallaxbewegung */}
              {/* <motion.div style={{ y: overlayY }} className={styles.overlayContainer}> */}
                <Image
                  src={overlaySrc}
                  alt="Overlay"
                  width={425}
                  height={550}
                  className={styles.overlay}
                />
              {/* </motion.div> */}
            </div>
          </div>
        </section>
        <section className={styles.secondSection}></section>
    </>
  );
}
