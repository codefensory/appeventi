import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ImageCard } from "./ImageCard";

export const ImageCarousel = ({ className }: { className?: string }) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
    },
    [
      AutoScroll({
        playOnInit: true,
        stopOnFocusIn: false,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ],
  );

  return (
    <div className={"embla w-full " + className} ref={emblaRef}>
      <div className="embla__container">
        {Array.from({ length: 6 }).map((_, index) => (
          <img
            className="embla__slide"
            src={`examples/slider-${index + 1}.png`}
            alt={`menu-${index}`}
          />
        ))}
      </div>
    </div>
  );
};
