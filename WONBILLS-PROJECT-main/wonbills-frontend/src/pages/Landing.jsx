import React from 'react';
import Header from '../components/UI-Components/LandingPage/Header';
import Hero from '../components/UI-Components/LandingPage/Hero';
import StatsBar from '../components/UI-Components/LandingPage/StatsBar';
import Features from '../components/UI-Components/LandingPage/Features';
import InvoicesTemps from '../components/UI-Components/LandingPage/InvoicesTemps';
import MobileAppSection from '../components/UI-Components/LandingPage/Mobileappsection';
import Pricing from '../components/UI-Components/LandingPage/Pricing';
import Contact from '../components/UI-Components/LandingPage/Contact';
import Footer from '../components/UI-Components/LandingPage/Footer';
import SEO from '../components/SEO';

import { LanguageProvider } from '../components/UI-Components/LandingPage/LanguageContext';


import { useEffect } from "react";
import { useLocation } from "react-router-dom";


const Landing = () => {

  const location = useLocation();

  useEffect(() => {
    const container = document.querySelector(".slot-scroll");

    if (!container) return;

    // Home
    if (location.pathname === "/") {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const sectionId = location.pathname.replace("/", "");

    const section = document.getElementById(sectionId);

    if (!section) return;
    const headerHeight = 80;

    container.scrollTo({
      top: section.offsetTop - headerHeight,
      behavior: "smooth",
    });

  }, [location.pathname]);

  return (
    <>
      <LanguageProvider>
        <SEO
          title="Invoice & Billing Software"
          description="Create invoices, collect online payments, automate reminders and manage billing with ease."
          keywords="billing software, invoice software, GST billing"
          canonical="https://wonbills.com/"
          image="https://wonbillsnew.s3.ap-south-1.amazonaws.com/Untitled+design.png"
        />


        <div className="w-full h-screen overflow-x-hidden slot-scroll">
          <Header />
          <section id="home">
            <Hero />
            <StatsBar />
          </section>
          <section id="features">
            <Features />
          </section>
          <InvoicesTemps />
          <MobileAppSection />
          <section id="pricing">
            <Pricing />
          </section>
          <section id="support">
            <Contact />
          </section>
          <Footer />
        </div>
      </LanguageProvider>



    </>
  )
}

export default Landing;
