import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const VideoScroll = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const textRefs = useRef<HTMLDivElement[]>([])

  useLayoutEffect(() => {
    const video = videoRef.current
    if (!video) return

    const ctx = gsap.context(() => {
      video.pause()

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          if (video.duration) {
            video.currentTime = video.duration * self.progress
          }
        },
      })

      textRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${i * 30 + 10}% center`,
              end: `${i * 30 + 30}% center`,
              toggleActions: "play reverse play reverse",
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
      className="relative min-h-screen bg-[hsl(var(--deep-navy,222_47%_6%))] overflow-hidden"
    >
      <video
        ref={videoRef}
        src="/videos/laundry-process.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="text-center space-y-24">
          {["We Pick Up", "We Clean With Care", "We Deliver Fresh"].map(
            (text, i) => (
              <div
                key={text}
                ref={(el) => {
                  if (el) textRefs.current[i] = el
                }}
                className="text-4xl md:text-6xl font-bold text-white"
              >
                {text}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}

export default VideoScroll
