import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Truck, Clock, Sparkles } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_FRAMES = 192
const MOBILE_FRAMES = 72

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    const FRAME_COUNT = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES

    const images: HTMLImageElement[] = []
    const frame = { current: 0 }
    let ready = false

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }

    const draw = () => {
      const img = images[frame.current]
      if (!img || !img.complete || img.naturalWidth === 0) return

      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      )

      const x = canvas.width / 2 - (img.width * scale) / 2
      const y = canvas.height / 2 - (img.height * scale) / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
    }

    resize()
    window.addEventListener("resize", resize)

    /* ================= PRELOAD ================= */
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.src = `/videos/herosection/ezgif-frame-${String(i).padStart(3, "0")}.jpg`

      img.onload = () => {
        if (!ready && i === 1) {
          ready = true
          draw()
          startAnimation()
        }
      }

      images.push(img)
    }

    /* ================= ANIMATION ================= */
    const startAnimation = () => {
      const gsapCtx = gsap.context(() => {
        /* AUTOPLAY SEQUENCE */
        gsap.timeline()
          .to(frame, {
            current: FRAME_COUNT - 1,
            duration: isMobile ? 2.8 : 4,
            ease: "none",
            onUpdate: draw,
          })
          .fromTo(
            contentRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1 },
            0.4
          )

        /* SCROLL CONTROL */
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: isMobile ? "+=90%" : "+=120%",
          scrub: 1,
          onUpdate: (self) => {
            frame.current = Math.floor(
              self.progress * (FRAME_COUNT - 1)
            )
            draw()
          },
        })
      }, section)

      return () => gsapCtx.revert()
    }

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 text-white"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          Fresh. Clean.
          <br />
          Delivered Free.
        </h1>

        <p className="text-lg md:text-2xl text-white/80 max-w-2xl mb-14">
          Premium laundry services — picked up, cleaned with care,
          and delivered back to you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
          {[
            {
              icon: Truck,
              title: "Free Pickup & Delivery",
              sub: "No hidden fees",
            },
            {
              icon: Clock,
              title: "24–48 Hour Turnaround",
              sub: "Fast & reliable",
            },
            {
              icon: Sparkles,
              title: "Premium Care",
              sub: "Eco-friendly detergents",
            },
          ].map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10"
            >
              <Icon className="w-7 h-7 text-blue-400 mx-auto mb-3" />
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-white/60">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
