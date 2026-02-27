import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Droplet } from "lucide-react"
import Header from "@/components/layout/Header"
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger)

const FRAMES_PER_SECTION = 192
const TOTAL_FRAMES = FRAMES_PER_SECTION * 2

export default function IntroSplash() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const images = useRef<HTMLImageElement[]>([])
  const frame = useRef(0)

  const logoRef = useRef<HTMLDivElement>(null)
  const introTextRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const section = sectionRef.current!
    const stage = stageRef.current!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }

    const draw = () => {
      const img = images.current[Math.floor(frame.current)]
      if (!img) return

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

    /* preload frames */
    let loaded = 0
    ;["/videos/introsplash", "/videos/Cta section"].forEach(path => {
      for (let i = 1; i <= FRAMES_PER_SECTION; i++) {
        const img = new Image()
        img.src = `${path}/ezgif-frame-${String(i).padStart(3, "0")}.jpg`
        img.onload = () => {
          loaded++
          if (loaded === TOTAL_FRAMES) init()
        }
        images.current.push(img)
      }
    })

    const init = () => {
      /* 🎥 nonstop autoplay */
      gsap.ticker.add(() => {
        frame.current += 0.35
        if (frame.current >= TOTAL_FRAMES) frame.current = 0
        draw()
      })

      /* scroll influence */
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=300%",
        scrub: 1,
        pin: stage,
        onUpdate: self => {
          frame.current += self.direction * 1.2
        },
      })

      /* CINEMATIC TEXT TIMELINE */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          scrub: true,
        },
      })

      tl.fromTo(
        [logoRef.current, introTextRef.current],
        { opacity: 0, y: 60, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }
      )
        .to(
          [logoRef.current, introTextRef.current],
          { opacity: 0, y: -60, filter: "blur(6px)", duration: 1 },
          "+=1"
        )
        .fromTo(
          servicesRef.current,
          { opacity: 0, y: 80, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }
        )
        .to(
          servicesRef.current,
          { opacity: 0, y: -80, filter: "blur(6px)", duration: 1 },
          "+=1"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1 }
        )
    }

    return () => {
      window.removeEventListener("resize", resize)
      ScrollTrigger.getAll().forEach(t => t.kill())
      gsap.ticker.remove(draw)
    }
  }, [])

  return (
    <>
      <Header />

      <section
        ref={sectionRef}
        className="relative h-[400vh] bg-[hsl(222_47%_6%)]"
      >
        <div ref={stageRef} className="relative h-screen overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />

          {/* INTRO */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-6 text-center">
            <div
              ref={logoRef}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center"
            >
              <Droplet className="w-12 h-12 md:w-14 md:h-14 text-blue-400" />
            </div>

            <div ref={introTextRef} className="mt-6">
              <h1 className="text-4xl md:text-6xl font-extrabold">
                BlueTides
              </h1>
              <p className="mt-2 text-blue-200 uppercase tracking-widest text-sm md:text-base">
                Premium Laundry Services
              </p>
            </div>
          </div>

          {/* SERVICES */}
          <div
            ref={servicesRef}
            className="absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 px-6 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold max-w-4xl leading-tight">
              Laundry · Dry Cleaning · Free Pickup <br />
              Loyalty Rewards · Smart Subscriptions
            </h2>
          </div>

          {/* CTA */}
          <div
            ref={ctaRef}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white opacity-0 px-6 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Experience Clean?
            </h2>
           <div className="flex flex-col sm:flex-row gap-4">
  <Link
    to="/auth?mode=signup"
    className="px-8 py-3 rounded-full bg-blue-500 text-center"
  >
    Create Account
  </Link>

  <Link
    to="/auth"
    className="px-8 py-3 rounded-full border border-white text-center"
  >
    Sign In
  </Link>
</div>
          </div>
        </div>
      </section>
    </>
  )
}