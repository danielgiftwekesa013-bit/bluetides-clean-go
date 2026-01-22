import React, { useLayoutEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowRight, Sparkles, Truck, Clock } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const drumRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* -------------------------------
         INTRO TIMELINE (GSAP STYLE)
      -------------------------------- */
      const intro = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1.2 },
      })

      intro
        .from(".hero-badge", { y: 40, opacity: 0, rotateX: 30 })
        .from(".hero-title", { y: 80, opacity: 0, rotateX: 45, z: -200 }, "-=0.8")
        .from(".hero-subtitle", { y: 60, opacity: 0, z: -150 }, "-=0.8")
        .from(".hero-cta", { y: 40, opacity: 0, scale: 0.9 }, "-=0.6")
        .from(".hero-trust > div", { y: 30, opacity: 0, stagger: 0.15 }, "-=0.6")

      /* --------------------------------
         SCROLL-PINNED HERO (GSAP HOMEPAGE)
      --------------------------------- */
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: true,
        },
      })
        .to(contentRef.current, {
          scale: 0.9,
          opacity: 0.85,
        })
        .to(
          drumRef.current,
          {
            rotateZ: 360,
          },
          0
        )

      /* --------------------------------
         SOAP BUBBLES — SCROLL INTERACTION
      --------------------------------- */
      gsap.utils.toArray<HTMLElement>(".bubble").forEach((bubble) => {
        gsap.fromTo(
          bubble,
          {
            y: "120%",
            opacity: 0,
            scale: gsap.utils.random(0.6, 1.2),
          },
          {
            y: "-20%",
            opacity: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Soap bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bubble absolute w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 3D Washing Machine Drum */}
      <div
        ref={drumRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="w-[420px] h-[420px] rounded-full border-[12px] border-white/10 relative">
          <div className="absolute inset-8 rounded-full border border-white/20" />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotateZ(${i * 45}deg) translateY(-180px)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="container mx-auto px-4 py-32 relative z-10 text-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">
            Free Pickup & Delivery
          </span>
        </div>

        {/* Heading */}
        <h1 className="hero-title text-5xl md:text-7xl font-extrabold text-primary-foreground mb-6">
          Fresh. Clean.
          <br />
          <span className="relative">
            Delivered Free.
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-accent"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,6 Q50,0 100,6 T200,6"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        {/* Subheading */}
        <p className="hero-subtitle text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto">
          Premium laundry services at your doorstep. We pick up, clean with care,
          and deliver fresh — all for free.
        </p>

        {/* CTA */}
        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="glass"
            size="xl"
            onClick={() =>
              navigate(isAuthenticated ? "/schedule" : "/auth?mode=signup")
            }
            className="group"
          >
            {isAuthenticated ? "Schedule a Pickup" : "Get Started Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {!isAuthenticated && (
            <Button variant="heroOutline" size="xl" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>

        {/* Trust indicators */}
        <div className="hero-trust mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck, label: "Free Pickup & Delivery", sub: "Always" },
            { icon: Clock, label: "24–48 Hour Turnaround", sub: "Fast & Reliable" },
            { icon: Sparkles, label: "Eco-Friendly Products", sub: "Gentle Care" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary-foreground">{label}</p>
                <p className="text-sm text-primary-foreground/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
