import { Hero } from '../components/sections/Hero.tsx'
import { Features } from '../components/sections/Features.tsx'
import { Pricing } from '../components/sections/Pricing.tsx'
import { Footer } from '../components/layout/Footer.tsx'

export const Landing = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  )
}
