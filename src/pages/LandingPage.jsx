import Navbar from '../landing/Navbar'
import Hero from '../landing/Hero'
import Metrics from '../landing/Metrics'
import Features from '../landing/Features'
import HowItWorks from '../landing/HowItWorks'
import About from '../landing/About'
import CTASection from '../landing/CTA'
import Footer from '../landing/Footer'

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900 bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Metrics />
      <Features />
      <HowItWorks />
      <About />
      <CTASection />
      <Footer />
    </div>
  )
}
