"use client";

import { Navigation, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./ServicesCarousel.module.css";

export type ServiceDefinition = {
  id: string;
  label: string;
  headline: string;
  subline: string;
  paragraphs: readonly string[];
  imageUrl: string;
};

type ServicesViewProps = {
  services: readonly ServiceDefinition[];
};

export default function ServicesView({ services }: ServicesViewProps) {
  if (services.length === 0) {
    return (
      <section className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <h1>Services</h1>
          <p>Aktuell stehen keine Services zur Verfügung.</p>
        </div>
      </section>
    );
  }

  return (
    <div className={`section ${styles.serviceSection}`}>
      <div className="sectionContent">
        <h1 className="sectionHeadline">Dein Moment verdient mehr als Zufall!</h1>
        <Swiper
          className={styles.serviceSwiper}
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
        >
          {services.map((service) => (
            <SwiperSlide key={service.id} className={styles.serviceSwiperSlide}>
              <div className={styles.serviceSlideImageBox}>
                <div
                  className={styles.octagon}
                  style={{ backgroundImage: `url("${service.imageUrl}")` }}
                  role="img"
                  aria-label={service.label}
                />
              </div>
              <div className={styles.serviceSlideTextBox}>
                <span className={styles.serviceSlidePill}>{service.label}</span>
                <h2 className={styles.serviceSlideHeadline}>{service.headline}</h2>
                <p className={styles.serviceSlideText}>{service.subline}</p>
                {service.paragraphs.map((paragraph, index) => (
                  <p
                    key={`${service.id}-paragraph-${index}`}
                    className={styles.serviceSlideText}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
