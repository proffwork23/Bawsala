"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    alt: "مشهد سينمائي",
  },
  {
    src: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=80",
    alt: "ضوء وعمق",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    alt: "طبيعة ساكنة",
  },
  {
    src: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80",
    alt: "هندسة المدينة",
  },
  {
    src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
    alt: "تفاصيل رمادية",
  },
];

export function ArtCarousel({
  items = photos,
}: {
  items?: { src: string; alt: string }[];
}) {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <Swiper
        modules={[Autoplay, Pagination, Keyboard]}
        loop
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3200, disableOnInteraction: false }}
        spaceBetween={16}
        slidesPerView={1}
      >
        {items.map((p) => (
          <SwiperSlide key={p.src}>
            <div className="relative h-[320px] sm:h-[420px] lg:h-[520px]">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${p.src})` }}
                aria-label={p.alt}
                role="img"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                {p.alt}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

