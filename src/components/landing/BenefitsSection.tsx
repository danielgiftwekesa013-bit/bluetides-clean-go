import React, { useLayoutEffect, useRef } from "react"
import { Truck, Clock, Shield, Leaf, Heart, Award } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  {
    icon: Truck,
    title: "Free Pickup & Delivery",
    description:
      "We come to your doorstep at no extra cost. Schedule at your convenience.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description:
      "24–48 hour standard service. Same-day express available for urgent needs.",
  },
  {
    icon: Shield,
    title: "Garment Protection",
    description:
      "Your items are insured. We handle everything with professional care.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Products",
    description:
      "Gentle on fabrics, kind to the environment. Biodegradable detergents.",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description:
      "Special instructions? No problem. We treat your items your way.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description:
      "Not satisfied? We’ll re-clean for free. Your happiness comes first.",
  },
]

const BenefitsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* --------------------------------
         HEADER – DRAMATIC DROP-IN
      -------------------------------- */
      gsap.from(".benefits-header", {
        y: 100,
        opacity: 0,
        rotateX: 45,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      })

      /* --------------------------------
         BENEFIT CARDS – CINEMATIC 3D BLAST
      -------------------------------- */
      gsap.from(".benefit-card", {
        opacity: 0,
        y: 120,
        rotateX: 55,
        rotateY: (i) => (i % 2 === 0 ? -25 : 25),
        z: -400,
        stagger: {
          each: 0.15,
          from: "center",
        },
        duration: 1.6,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".benefits-grid",
          start: "top 75%",
        },
      })

      /* --------------------------------
         SCROLL DEPTH – CARDS MOVE IN SPACE
      -------------------------------- */
      gsap.to(".benefit-card", {
        z: 120,
        rotateX: 0,
        rotateY: 0,
        scrollTrigger: {
          trigger: ".benefits-grid",
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      })

      /* --------------------------------
         MAGNETIC HOVER (GSAP > CSS)
      -------------------------------- */
      gsap.utils.toArray<HTMLElement>(".benefit-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -18,
            scale: 1.06,
            rotateX: 0,
            rotateY: 0,
            duration: 0.4,
            ease: "power3.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power3.out",
          })
        })
      })

      /* --------------------------------
         CTA BANNER – HERO MOMENT
      -------------------------------- */
      gsap.from(".benefits-cta", {
        y: 120,
        opacity: 0,
        scale: 0.9,
        rotateX: 35,
        duration: 1.3,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".benefits-cta",
          start: "top 80%",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="py-24 bg-background"
      style={{ perspective: "1400px" }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="benefits-header text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose <span className="text-gradient">Bluetides?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We go above and beyond to make laundry day your best day.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="benefit-card p-8 rounded-2xl bg-card border border-border shadow-soft"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-14 h-14 rounded-xl gradient-ocean flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="benefits-cta mt-16 p-8 md:p-12 rounded-2xl gradient-ocean text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Experience the Bluetides Difference?
          </h3>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who have made laundry day
            stress-free.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { value: "5,000+", label: "Happy Customers" },
              { value: "20,000+", label: "Orders Completed" },
              { value: "4.9★", label: "Customer Rating" },
            ].map((item) => (
              <div
                key={item.label}
                className="px-6 py-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
              >
                <span className="text-2xl font-bold text-primary-foreground">
                  {item.value}
                </span>
                <p className="text-sm text-primary-foreground/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
