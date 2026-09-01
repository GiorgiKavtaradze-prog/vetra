import Carousel from "@/components/bits/Carousel";

export default function UsageCarousel() {
  return (
    <div style={{ height: "600px", position: "relative" }}>
      <Carousel
        baseWidth={300}
        autoplay={false}
        autoplayDelay={3000}
        pauseOnHover={false}
        loop
        round
      />
    </div>
  );
}
