import { useLayoutEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

const FinalCTA = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 80,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-40 bg-[hsl(var(--deep-navy,222_47%_6%))] text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          Ready for stress-free laundry?
        </h2>

        <p className="text-xl text-blue-200 mb-12 max-w-xl mx-auto">
          Join BlueTides today. We pick up, clean, and deliver — effortlessly.
        </p>

        <Button
          size="xl"
          className="group"
          onClick={() => navigate("/auth?mode=signup")}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}

export default FinalCTA
