"use client";

import React, { useEffect, useState, useRef } from "react";

const carouselItems = [
  {
    id: "52920",
    name: "Chicken Marengo",
    category: "Chicken",
    description:
      "Perfectly seasoned and cooked to golden perfection. These flavorful morsels are often pan-fried or baked, making them a quick and delicious option for appetizers, snacks, or main dishes.",
    image:
      "https://static.vecteezy.com/system/resources/previews/027/572/366/non_2x/restaurant-food-restaurant-food-top-view-ai-generative-free-png.png",
  },
  {
    id: "52770",
    name: "Spaghetti Bolognese",
    category: "Italian",
    description:
      "Often baked to perfection, this dish features a rich blend of ingredients like garlic, bell peppers, tomatoes, and herbs.",
    image:
      "https://static.vecteezy.com/system/resources/previews/027/536/079/original/restaurant-food-restaurant-food-top-view-ai-generative-free-png.png",
  },
  {
    id: "52852",
    name: "Tuna Nicoise",
    category: "Seafood",
    description:
      "This medley typically includes a variety of veggies such as bell peppers, zucchini, carrots, broccoli, and cherry tomatoes, seasoned with herbs, garlic, and olive oil for a burst of natural flavors.",
    image:
      "https://static.vecteezy.com/system/resources/previews/027/572/412/non_2x/restaurant-food-restaurant-food-top-view-ai-generative-free-png.png",
  },
];

const Carousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActive((prev) => (prev + 1 >= carouselItems.length ? 0 : prev + 1));
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const handleNext = () => {
    setActive((prev) => (prev + 1 >= carouselItems.length ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 < 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleDotClick = (index: number) => {
    setActive(index);
  };

  const handleViewRecipe = (id: string) => {
    window.location.href = `meal-details.html?id=${id}`;
  };

  return (
    <section
      className="carousel w-[100vw] relative left-1/2 right-1/2 -mx-[50vw] h-[100vh] overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(#7fa154, #537b3f)",
      }}
    >
      <div className="list w-[min(1200px,90vw)] mx-auto h-full relative">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`item absolute inset-0 transition-all duration-500 ${
              index === active ? "active opacity-100" : "opacity-0"
            }`}
            style={{
              transform:
                index === active
                  ? "translateX(0)"
                  : `translateX(${index > active ? "100vw" : "-100vw"})`,
            }}
          >
            <figure className="absolute w-[70%] top-1/2 -translate-y-1/2">
              <img
                src={item.image}
                alt={item.name}
                className="w-full transition-transform duration-500 delay-300"
                style={{
                  transform: index === active ? "rotate(0deg)" : "rotate(-60deg)",
                }}
              />
              <div
                className="absolute bg-[#0b0b1b] w-full h-[100px] top-[150%] left-[50px] rounded-full blur-[50px]"
                aria-hidden="true"
              />
            </figure>
            <div className="content absolute z-20 w-[70%] h-full right-[200px] flex flex-col justify-center items-end gap-5">
              <p className="category font-['League_Gothic'] text-2xl font-medium text-white">
                {item.category}
              </p>
              <h2 className="font-['League_Gothic'] text-8xl leading-tight text-right text-white">
                {item.name.split(" ").map((word, i) => (
                  <span key={i}>
                    {word}
                    <br />
                  </span>
                ))}
              </h2>
              <p className="description max-w-[400px] text-sm text-right text-white/50">
                {item.description}
              </p>
              <div className="more grid grid-cols-2 gap-5">
                {/* <button
                  onClick={() => handleViewRecipe(item.id)}
                  className="rounded-full bg-gradient-to-r from-[#81baa0] to-[#46a39c] text-white uppercase font-['League_Gothic'] py-2 px-4"
                >
                  View Recipe
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="arrows w-[min(1200px,90vw)] flex justify-between absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[25px] z-[100] pointer-events-none">
        <button
          onClick={handlePrev}
          className="w-[50px] h-[50px] rounded-full  text-white text-2xl hover:border-[#7fa154] hover:scale-110 transition-all pointer-events-auto"
        >
          {"<"}
        </button>
        <button
          onClick={handleNext}
          className="w-[50px] h-[50px] rounded-full  text-white text-2xl hover:border-[#7fa154] hover:scale-110 transition-all pointer-events-auto"
        >
          {">"}
        </button>
      </div>

      <div className="indicators absolute top-1/2 w-[min(1200px,90vw)] left-1/2 -translate-x-1/2 flex flex-col justify-end gap-2 pointer-events-none">
        <div className="number font-['League_Gothic'] text-[7vw] text-white">
          {String(active + 1).padStart(2, "0")}
        </div>
        <ul className="flex gap-2">
          {carouselItems.map((_, index) => (
            <li
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-[50px] h-[5px] rounded-lg cursor-pointer transition-all pointer-events-auto ${
                index === active ? "bg-white" : "bg-[#7fa154]"
              }`}
            />
          ))}
        </ul>
      </div>

      <style jsx>{`
        .carousel .item.active .content .category,
        .carousel .item.active .content h2,
        .carousel .item.active .content .description,
        .carousel .item.active .content .more {
          transform: translateX(0);
          opacity: 1;
          transition: all 0.7s;
        }
        .carousel .item .content .category,
        .carousel .item .content h2,
        .carousel .item .content .description,
        .carousel .item .content .more {
          transform: translateX(200px);
          opacity: 0;
        }
        .carousel .item .content .category {
          transition-delay: 0.3s;
        }
        .carousel .item .content h2 {
          transition-delay: 0.5s;
        }
        .carousel .item .content .description {
          transition-delay: 0.7s;
        }
        .carousel .item .content .more {
          transition-delay: 0.9s;
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .carousel {
            height: 60vh;
          }
          .carousel .item .content h2 {
            font-size: 5rem;
          }
          .carousel .indicators .number {
            font-size: 10rem;
            transform: translateX(50px);
            opacity: 0.5;
          }
        }
        @media (max-width: 767px) {
          .carousel .item .content {
            justify-content: flex-end;
            padding-bottom: 100px;
            right: 50px;
          }
          .carousel .item .content h2 {
            font-size: 5rem;
          }
          .carousel .item figure {
            width: 110%;
            transform: translateY(0);
            top: 200px;
            left: -30px;
          }
          .carousel .indicators .number {
            font-size: 10rem;
            transform: translateX(50px);
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
};

export default Carousel;