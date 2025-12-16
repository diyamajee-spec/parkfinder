import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".home-section");
      const scrollPos = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll(".home-section")[index];
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: "🚗",
      title: "Real-Time Availability",
      description: "See live parking slot availability updated every minute",
      color: "from-[#1B42CB] to-[#1B42CB]/80",
    },
    {
      icon: "📍",
      title: "Smart Navigation",
      description: "Get turn-by-turn directions to your booked parking spot",
      color: "from-[#FF2F6C] to-[#FF2F6C]/80",
    },
    {
      icon: "💰",
      title: "Best Price Guarantee",
      description: "We guarantee the best parking rates in your area",
      color: "from-[#1B42CB] to-[#FF2F6C]",
    },
    {
      icon: "🛡️",
      title: "Secure Parking",
      description: "24/7 surveillance and security at all our locations",
      color: "from-[#FF2F6C] to-[#1B42CB]",
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Daily Commuter",
      content:
        "Saves me 15 minutes every morning finding parking near my office!",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Event Planner",
      content: "Perfect for finding parking during crowded city events.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Business Traveler",
      content: "The real-time updates make business trips so much smoother.",
      rating: 4,
    },
  ];

  return (
    <div className="relative bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-linear-to-r from-[#1B42CB]/5 to-[#FF2F6C]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index
                ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] scale-125"
                : "bg-[#EEECF6]/30 hover:bg-[#EEECF6]/50"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      {/* Hero Section - Premium Parking Platform */}
      <section className="home-section min-h-screen flex items-center justify-center relative px-4 py-16 md:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left Content - Enhanced */}
            <div className="flex-1 text-center lg:text-left">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#FFFFFF]/20 backdrop-blur-sm mb-8">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00FF88] animate-pulse"></span>
                  <span className="text-base font-semibold text-white tracking-wide">
                    🚀 #1 Rated Parking Platform
                  </span>
                  <span className="text-sm text-gray-300">| Live 24/7</span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block">
                  <span className="bg-linear-to-br from-white via-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                    INSTANT PARKING
                  </span>
                </span>
                <span className="block mt-2">
                  <span className="relative">
                    <span className="bg-linear-to-br from-[#FF2F6C] via-[#1B42CB] to-white bg-clip-text text-transparent">
                      ANYWHERE, ANYTIME
                    </span>
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-linear-to-br from-[#FF2F6C] to-[#1B42CB] rounded-full"></span>
                  </span>
                </span>
              </h1>

              {/* Stats Counter */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-gray-400">Occupancy Rate</div>
                </div>
                <div className="h-6 w-px bg-gray-700"></div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-gray-400">Support</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                <span className="font-semibold text-white">
                  Real-time parking analytics
                </span>{" "}
                with
                <span className="text-[#00FF88]"> AI-powered predictions</span>.
                Reserve spots before you arrive, get{" "}
                <span className="text-[#FF2F6C]">priority access</span>, and pay
                seamlessly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link
                  to="/parkingslots"
                  className="group px-10 py-5 bg-linear-to-br from-[#1B42CB] via-[#6C3BFF] to-[#FF2F6C] text-white font-bold rounded-2xl text-lg hover:shadow-2xl hover:shadow-[#FF2F6C]/30 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <span>Find Parking Instantly</span>
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-[#00FF88]/20 to-[#00FF88]/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Secure Booking</div>
                    <div className="text-sm text-gray-400">
                      Encrypted Payments
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-[#FF2F6C]/20 to-[#FF2F6C]/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Instant Entry</div>
                    <div className="text-sm text-gray-400">QR Code Access</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Premium Parking Card */}
            <div className="flex-1 w-full">
              <div className="relative max-w-md mx-auto lg:mx-0">
                {/* Main Card */}
                <div className="backdrop-blur-2xl bg-linear-to-br from-black/40 to-[#0A0A0A]/60 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-[#1B42CB]/20 overflow-hidden">
                  {/* Glowing Effect */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2F6C]/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>

                  {/* Card Header */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🏢</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              Platinum Tower
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">
                                Downtown • Premium
                              </span>
                              <span className="px-2 py-1 bg-[#00FF88]/20 text-[#00FF88] text-xs rounded-full">
                                TOP RATED
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="p-3 hover:bg-white/10 rounded-xl transition-colors">
                        <span className="text-2xl">⭐</span>
                      </button>
                    </div>

                    {/* Live Availability */}
                    <div className="bg-linear-to-br from-black/30 to-black/50 rounded-2xl p-6 mb-6 border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-gray-400 text-sm">
                            LIVE AVAILABILITY
                          </div>
                          <div className="text-3xl font-bold text-white mt-1">
                            12/24
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-20 h-20">
                            <svg
                              className="w-full h-full"
                              viewBox="0 0 100 100"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#1F2937"
                                strokeWidth="8"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset="75.36"
                                transform="rotate(-90 50 50)"
                              />
                              <defs>
                                <linearGradient
                                  id="gradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor="#1B42CB" />
                                  <stop offset="100%" stopColor="#FF2F6C" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              50%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">
                          Updated 2 mins ago
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-gray-400 text-sm mb-1">RATE</div>
                        <div className="text-2xl font-bold text-white">
                          ₹80/hr
                        </div>
                        <div className="text-gray-500 text-xs">
                          ₹500 day max
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-gray-400 text-sm mb-1">
                          DISTANCE
                        </div>
                        <div className="text-2xl font-bold text-white">
                          0.8 km
                        </div>
                        <div className="text-gray-500 text-xs">
                          🚶 10 min walk
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-gray-400 text-sm mb-1">TYPE</div>
                        <div className="text-2xl font-bold text-white">
                          COVERED
                        </div>
                        <div className="text-gray-500 text-xs">
                          EV Charging ✅
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-gray-400 text-sm mb-1">RATING</div>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-white">
                            4.8
                          </span>
                          <span className="text-yellow-400">★★★★★</span>
                        </div>
                        <div className="text-gray-500 text-xs">420 reviews</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-8 -left-8 w-24 h-24 backdrop-blur-xl bg-linear-to-br from-[#FF2F6C]/10 to-[#FF2F6C]/5 border border-[#FF2F6C]/30 rounded-2xl flex items-center justify-center animate-float">
                  <span className="text-3xl">📍</span>
                </div>
                <div className="absolute -bottom-8 -right-8 w-20 h-20 backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/10 to-[#1B42CB]/5 border border-[#1B42CB]/30 rounded-2xl flex items-center justify-center animate-float delay-1000">
                  <span className="text-3xl">⚡</span>
                </div>

                {/* Live Badge */}
                <div className="absolute -top-3 right-8 px-4 py-1.5 bg-linear-to-br from-[#00FF88] to-[#00CC66] text-black font-bold rounded-full text-sm flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  LIVE
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-white font-bold text-2xl">🏆</div>
              <div className="text-gray-400 text-sm mt-2">Award Winning</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-2xl">🔐</div>
              <div className="text-gray-400 text-sm mt-2">
                Bank-Level Security
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-2xl">🌍</div>
              <div className="text-gray-400 text-sm mt-2">15+ Cities</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-2xl">📱</div>
              <div className="text-gray-400 text-sm mt-2">Mobile First</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white text-2xl">↓</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B42CB]/10 border border-[#1B42CB]/30 mb-4">
              <span className="text-sm font-medium text-[#EEECF6]">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                Features That Make
              </span>
              <br />
              <span className="text-[#EEECF6]">Parking Effortless</span>
            </h2>
            <p className="text-lg text-[#EEECF6]/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly
              design to transform your parking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-2xl p-6 hover:border-[#FF2F6C]/40 hover:shadow-2xl hover:shadow-[#FF2F6C]/10 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#EEECF6] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#EEECF6]/70">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#EEECF6] mb-4">
                  How It Works
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Search & Filter",
                      desc: "Find parking spots by location, price, and availability",
                    },
                    {
                      step: "2",
                      title: "Book Instantly",
                      desc: "Reserve your spot with one click, no waiting required",
                    },
                    {
                      step: "3",
                      title: "Navigate & Park",
                      desc: "Get directions and park in your reserved spot",
                    },
                    {
                      step: "4",
                      title: "Pay Securely",
                      desc: "Automatic payment with multiple secure options",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center shrink-0">
                        <span className="font-bold text-white">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-[#EEECF6] mb-1">
                          {item.title}
                        </div>
                        <div className="text-[#EEECF6]/70">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-[#EEECF6]">
                          Live Map
                        </div>
                        <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                          Real-time
                        </div>
                      </div>
                      <div className="h-48 bg-[#191919]/50 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">🗺️</span>
                      </div>
                      <div className="text-sm text-[#EEECF6]/60">
                        Interactive map showing available parking spots near you
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2F6C]/10 border border-[#FF2F6C]/30 mb-4">
              <span className="text-sm font-medium text-[#EEECF6]">
                User Stories
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-[#EEECF6]">Loved by</span>
              <span className="bg-linear-to-r from-[#FF2F6C] to-[#1B42CB] bg-clip-text text-transparent">
                {" "}
                Thousands
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-2xl p-6 hover:border-[#FF2F6C]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < testimonial.rating
                          ? "text-[#FF2F6C]"
                          : "text-[#EEECF6]/30"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#EEECF6]/80 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#EEECF6]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-linear-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#EEECF6] mb-4">
              Ready to Transform Your Parking Experience?
            </h3>
            <p className="text-lg text-[#EEECF6]/70 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who have made parking
              stress-free with our intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/bookings"
                className="px-8 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 text-[#EEECF6] font-bold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#EEECF6]">
                      SmartPark
                    </h2>
                    <p className="text-[#EEECF6]/60">
                      Intelligent Parking Solutions
                    </p>
                  </div>
                </div>
                <p className="text-[#EEECF6]/70 mb-8">
                  We're on a mission to make urban parking stress-free,
                  efficient, and accessible for everyone. Our technology
                  connects drivers with available parking spots in real-time.
                </p>
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📱</span>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📧</span>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📘</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-[#EEECF6] mb-4">Quick Links</h3>
                  <ul className="space-y-3">
                    {[
                      "Parking Slots",
                      "Bookings",
                      "How It Works",
                      "Pricing",
                    ].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-[#EEECF6]/70 hover:text-[#EEECF6] transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[#EEECF6] mb-4">Contact</h3>
                  <ul className="space-y-3 text-[#EEECF6]/70">
                    <li>support@smartpark.com</li>
                    <li>+91 98765 43210</li>
                    <li>24/7 Support Available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#1B42CB]/20 text-center">
              <p className="text-[#EEECF6]/60">
                © {new Date().getFullYear()} SmartPark. All rights reserved.
              </p>
              <p className="text-sm text-[#EEECF6]/40 mt-2">
                Making parking better, one spot at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animation */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
