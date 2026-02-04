import { useLayoutEffect, useRef } from "react"
import {
  Shirt,
  BedDouble,
  Square,
  Footprints,
  RectangleHorizontal,
  Sparkles,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    icon: Shirt,
    title: "Everyday Laundry",
    description: "Expert washing, drying and ironing for all fabrics",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BedDouble,
    title: "Duvets & Bedding",
    description: "Deep-cleaned for freshness, softness and hygiene",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Square,
    title: "Blankets",
    description: "Gentle care for wool, fleece and cotton blankets",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: RectangleHorizontal,
    title: "Carpets & Rugs",
    description: "Professional stain removal and deep fiber cleaning",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: RectangleHorizontal,
    title: "Mats",
    description: "Door, bath and kitchen mats cleaned thoroughly",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Footprints,
    title: "Shoe Care",
    description: "Sneaker cleaning, leather care and restoration",
    color: "from-indigo-500 to-purple-500",
  },
]

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* ---------------- HEADER ---------------- */
      gsap.from(".services-header", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      })

      /* ---------------- CARDS ---------------- */
      gsap.from(".service-card", {
        y: 100,
        opacity: 0,
        rotateX: 35,
        transformOrigin: "top center",
        stagger: 0.15,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 80%",
        },
      })

      /* ---------------- HOVER (GSAP SAFE) ---------------- */
      gsap.utils.toArray<HTMLElement>(".service-card").forEach((card) => {
        const hoverTl = gsap.timeline({ paused: true })
        hoverTl.to(card, {
          y: -14,
          scale: 1.04,
          duration: 0.35,
          ease: "power3.out",
        })

        card.addEventListener("mouseenter", () => hoverTl.play())
        card.addEventListener("mouseleave", () => hoverTl.reverse())
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-28 bg-[hsl(222_47%_6%)]"
      style={{ perspective: "1400px" }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="services-header text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Our Services</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Laundry Care,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Reinvented
            </span>
          </h2>

          <p className="text-lg text-white/60">
            Premium laundry services designed for convenience, quality and
            rewards — all handled with expert care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="service-card relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {service.title}
              </h3>

              <p className="text-white/60">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
