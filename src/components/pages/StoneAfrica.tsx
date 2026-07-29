"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/components/ui";
import { PageHeader, Button, Card, Badge } from "@/components/ui";

interface ChipProps {
  chip: {
    label: string;
    action: "lightbox" | "booking" | "link";
    src?: string;
    href?: string;
    highlight?: boolean;
  };
  openLightbox: (src: string) => void;
  openBooking: () => void;
}

function ChipRenderer({ chip, openLightbox, openBooking }: ChipProps) {
  if (chip.action === "link") {
    return (
      <a
        className={cn("sa-chip", chip.highlight && "sa-chip-hi")}
        href={chip.href}
        target="_blank"
        rel="noopener"
      >
        {chip.label}
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 9L9 1M9 1H4M9 1v5" />
        </svg>
      </a>
    );
  }
  return (
    <button
      className={cn("sa-chip", chip.highlight && "sa-chip-hi")}
      onClick={() => {
        if (chip.action === "lightbox" && chip.src) openLightbox(chip.src);
        else if (chip.action === "booking") openBooking();
      }}
    >
      {chip.label}
      <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 9L9 1M9 1H4M9 1v5" />
      </svg>
    </button>
  );
}

const SERVICES = [
  {
    id: "risk-assessments",
    title: "Risk & Threat Assessments",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7v5c0 5.25 4.25 10.15 10 11.35C17.75 22.15 22 17.25 22 12V7L12 2z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    desc: "Real-time risk monitoring and intelligence-led threat analysis across Africa's most complex environments. Combining live data feeds, AI-enabled analytics, and on-ground insight to enable proactive decision-making and mission assurance before risk escalates.",
    bullets: [
      "Location or itinerary risk assessments",
      "Aviation-specific risk assessments",
    ],
    chip: { label: "Example Report", action: "lightbox" as const, src: "/images/Risk Assessment Sample Report.png" },
  },
  {
    id: "country-reporting",
    title: "Country Reporting",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
      </svg>
    ),
    desc: "Security and geopolitical reporting derived from HUMINT networks and AI fusion of social and local media. Written with clear language and a focus on the 'so-what?' — with deep, nuanced understanding of the places we operate.",
    bullets: [
      "Country-level reporting (weekly or monthly)",
      "Sector-specific reporting",
      "Kenyan National Elections reporting",
      "Bespoke / regional trends analysis",
    ],
    chip: { label: "Example Report", action: "lightbox" as const, src: "/images/Kenya Country Reporting Sample.png" },
  },
  {
    id: "emergency-response",
    title: "Emergency Response Review",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    desc: "Independent 3rd-party review of your emergency response and crisis management plans — aligned to ICAO Annex 19 principles. Designed to reduce friction and contain loss, ensuring your team is prepared and your plans will work.",
    bullets: [
      "ERP audit & gap analysis (ICAO Annex 19–aligned), remediation roadmap, and vendor network mapping",
      "ERP rewrite / enhancement: triggers, escalation ladders, notification templates, SITREP and incident log templates",
      "Tabletop exercises (TTX) and scenario-based exercises testing first-hour actions, communications discipline, and stakeholder coordination",
    ],
    chip: { label: "Our Offering", action: "link" as const, href: "/docs/Risk Management Service Offering - East African Aviation.pdf" },
  },
  {
    id: "speak-analyst",
    title: "Speak to an Analyst",
    centered: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
      </svg>
    ),
    desc: "Book a call to speak directly with one of our senior aviation risk analysts. Discuss a particular location, route, or emerging threat trend with an expert who knows the terrain.",
    bullets: [],
    chip: { label: "Book a Call", action: "booking" as const, highlight: true },
  },
  {
    id: "security-logistics",
    title: "Security & Logistics Support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    desc: "Nairobi-based operations providing secure movement, duty of care, and coordinated support across Africa's most complex environments. Active presence in Kenya, South Sudan, Uganda, Tanzania, Mauritius, and the UAE — combining regional depth with international standards.",
    bullets: [
      "Protective Services: Team Leads, CPOs, vetted drivers, secure vehicles, and executive movement planning across all of Africa",
      "Journey Management & Security Coordination: vetted local support for logistics, verification, and on-ground facilitation",
      "Duty of Care: remote personnel monitoring, real-time alerting, incident response, and 24/7 emergency line",
      "Integrated Medical Support: MERP, 24/7 clinician access, medevac response management alongside partner Response Med",
      "Embedded Support: full-time embedded security managers with full IOC systems and process support",
    ],
    chip: { label: "Our Footprint", action: "lightbox" as const, src: "/images/Stone Africa Map Page.png" },
  },
  {
    id: "crisis-management",
    title: "Crisis Management",
    centered: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    desc: "Stone Africa's Integrated Operations Centre provides a best-in-class hub for crisis response management. Air, land, systems, AI, and intelligence reporting desks co-located — enabling a single operating picture and the ability to scale rapidly. Already 24/7, we work with your team in advance to build SOPs and defined roles that enable a handover or seamless integration alongside yours.",
    bullets: [],
    chip: { label: "Book a Call", action: "booking" as const, highlight: true },
  },
];

const STATS = [
  { value: "24/7", label: "Security Oversight", delay: 0 },
  { value: "30+", label: "Countries Active", delay: 80 },
  { value: "IOC", label: "Integrated Operations Centre", delay: 160 },
  { value: "AI", label: "Fused Intelligence", delay: 240 },
];

export function StoneAfrica({ role }: { role: "admin" | "underwriter" | "operator" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>({});
  const [statVisibility, setStatVisibility] = useState<Record<string, boolean>>({});
  const [showLoader, setShowLoader] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Initialize observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id.startsWith("card-")) {
              setCardVisibility((prev) => ({ ...prev, [id]: true }));
            } else if (id.startsWith("stat-")) {
              setStatVisibility((prev) => ({ ...prev, [id]: true }));
            } else if (entry.target.classList.contains("sa-fade-up")) {
              entry.target.classList.add("visible");
            }
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".sa-card").forEach((c, i) => {
      (c as HTMLElement).style.transitionDelay = `${i * 0.07}s`;
      observerRef.current?.observe(c);
    });
    document.querySelectorAll(".sa-stat, .sa-fade-up").forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const openLightbox = useCallback((src: string) => {
    setLightboxSrc(src);
    setShowLightbox(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    document.body.style.overflow = "";
  }, []);

  const openBooking = useCallback(() => {
    setShowBooking(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeBooking = useCallback(() => {
    setShowBooking(false);
    document.body.style.overflow = "";
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeBooking();
    }
  }, [closeLightbox, closeBooking]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Page content loads in background */}
      <div className="flex flex-col gap-6" style={{ opacity: showLoader ? 0 : 1, pointerEvents: showLoader ? 'none' : 'auto', transition: 'opacity 0.3s ease' }}>
        <StoneAfricaContent
          isDark={isDark}
          openBooking={openBooking}
          showLightbox={showLightbox}
          lightboxSrc={lightboxSrc}
          openLightbox={openLightbox}
          closeLightbox={closeLightbox}
          showBooking={showBooking}
          closeBooking={closeBooking}
        />
      </div>

      {/* Splash Screen Loader - fixed overlay */}
      {showLoader && (
        <div className="sa-loader-splash">
          <div className="sa-loader-bg" />
          <div className="sa-loader-vignette" />
          <div className="sa-loader-content">
            <img className="sa-loader-logo" src="/images/logo.png" alt="Stone Africa" />
            <div className="sa-loader-tag">Stone Africa</div>
            <div className="sa-loader-bar" />
          </div>
        </div>
      )}
    </div>
  );
}

function StoneAfricaContent({
  isDark,
  openBooking,
  showLightbox,
  lightboxSrc,
  openLightbox,
  closeLightbox,
  showBooking,
  closeBooking,
}: {
  isDark: boolean;
  openBooking: () => void;
  showLightbox: boolean;
  lightboxSrc: string;
  openLightbox: (src: string) => void;
  closeLightbox: () => void;
  showBooking: boolean;
  closeBooking: () => void;
}) {
  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>({});
  const [statVisibility, setStatVisibility] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id.startsWith("card-")) {
              setCardVisibility((prev) => ({ ...prev, [id]: true }));
            } else if (id.startsWith("stat-")) {
              setStatVisibility((prev) => ({ ...prev, [id]: true }));
            } else if (entry.target.classList.contains("sa-fade-up")) {
              entry.target.classList.add("visible");
            }
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".sa-card").forEach((c, i) => {
      (c as HTMLElement).style.transitionDelay = `${i * 0.07}s`;
      observerRef.current?.observe(c);
    });
    document.querySelectorAll(".sa-stat-dashboard, .sa-fade-up").forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="sa-hero sa-fade-up">
        <div className="sa-hero-img">
          <img src="/images/ioc_image.jpeg" alt="Stone Africa Integrated Operations Centre" />
          <div className="sa-hero-img-overlay" />
          <div className="sa-hero-corner" />
          <div className="sa-hero-corner sa-hero-corner-br" />
          <div className="sa-hero-about">
            <p className="sa-hero-eyebrow">
              <span className="sa-hero-eyebrow-bar" /> Stone Africa
            </p>
            <h1 className="sa-hero-title">Operational<br />Intelligence<br />for Aviation</h1>
            <p className="sa-hero-desc">
              A specialist 24/7 operational oversight and delivery partner. Providing intelligence-led risk management,
              crisis response, and ground support across Africa's most complex environments - from our IOC.
            </p>
          </div>
        </div>
        <aside className="sa-hero-side">
          <img className="sa-hero-side-logo" src={isDark ? "/images/logo.png" : "/images/logo_dark.png"} alt="Stone Africa" />
          <div className="sa-h-rule" />
          <div className="sa-side-group">
            <span className="sa-side-group-label">Part of the</span>
            <span className="sa-side-group-name">Alamaya Group</span>
          </div>
          <p className="sa-side-copy">Aviation Risk<br />& Security Services</p>
          <div className="sa-side-ctas">
            <button className="sa-btn sa-btn-primary" onClick={openBooking}>
              Contact Our Team
            </button>
            <a href="https://stone-africa.co" target="_blank" rel="noopener" className="sa-btn sa-btn-secondary">
              Visit Stone Africa ↗
            </a>
          </div>
        </aside>
      </section>

      {/* Stats Strip */}
      <div className="sa-stats-dashboard sa-fade-up">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            id={`stat-${stat.label}`}
            className={cn("sa-stat-dashboard", statVisibility[`stat-${stat.label}`] && "visible")}
            style={{ transitionDelay: `${stat.delay}ms` }}
          >
            <div className="sa-stat-val">{stat.value}</div>
            <div className="sa-stat-lbl">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <section className="sa-services">
        <div className="sa-sec-head sa-fade-up">
          <h2 className="sa-sec-title">Our Capabilities</h2>
        </div>
        <div className="sa-grid">
          {SERVICES.map((svc, idx) => (
            <article
              key={svc.id}
              id={`card-${svc.id}`}
              className={cn(
                "sa-card sa-fade-up",
                cardVisibility[`card-${svc.id}`] && "visible",
                svc.centered && "sa-card-centered"
              )}
              style={{ transitionDelay: `${idx * 70}ms` }}
            >
              <div className="sa-card-head">
                <div className="sa-card-title-row">
                  <div className="sa-card-ico">{svc.icon}</div>
                  <h3 className="sa-card-title">{svc.title}</h3>
                </div>
                {svc.chip && (
                  <ChipRenderer chip={svc.chip} openLightbox={openLightbox} openBooking={openBooking} />
                )}
              </div>
              <div className="sa-card-body">
                <p className="sa-card-desc">{svc.desc}</p>
                {svc.bullets.length > 0 && (
                  <ul className="sa-card-bullets">
                    {svc.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact Bar */}
      <div className="sa-contact-bar-dashboard sa-fade-up">
        <span className="sa-contact-bar-label">Get in Touch</span>
        <div className="sa-contact-bar-item">
          <span className="sa-cbi-label">Tel</span>
          <a className="sa-cbi-value" href="tel:+254116043568">+254 (0) 11 604 3568</a>
        </div>
        <div className="sa-contact-bar-item">
          <span className="sa-cbi-label">Land Ops</span>
          <a className="sa-cbi-value" href="tel:+254207903866">+254 (0) 20 790 3866</a>
        </div>
        <div className="sa-contact-bar-item">
          <span className="sa-cbi-label">Flight Ops</span>
          <a className="sa-cbi-value" href="tel:+254207903867">+254 (0) 20 790 3867</a>
        </div>
        <div className="sa-contact-bar-item">
          <span className="sa-cbi-label">Email</span>
          <a className="sa-cbi-value" href="mailto:info@stone-africa.co">info@stone-africa.co</a>
        </div>
        <div className="sa-contact-bar-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
          <span className="sa-cbi-loc">Watermark Business Park, Annex B, Nairobi, Kenya</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="sa-footer-dashboard">
        <img className="sa-footer-logo" src="/images/logo.png" alt="Stone Africa" />
        <p className="sa-footer-ioc">24/7 Integrated Operations Centre · Nairobi, Kenya</p>
        <span className="sa-footer-grp">Part of the Alamaya Group</span>
      </footer>

      {/* Lightbox */}
      {showLightbox && (
        <div className="sa-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Image preview">
          <div className="sa-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="sa-lightbox-close" onClick={closeLightbox} aria-label="Close">&#x2715;</button>
            <img id="sa-lb-img" src={lightboxSrc} alt="Preview" />
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="sa-booking-modal" onClick={closeBooking} role="dialog" aria-modal="true" aria-label="Book a call">
          <div className="sa-booking-inner" onClick={(e) => e.stopPropagation()}>
            <button className="sa-booking-close" onClick={closeBooking} aria-label="Close">&#x2715;</button>
            <p className="sa-booking-eyebrow">Stone Africa · Aviation</p>
            <h2 className="sa-booking-title">Speak to an Analyst</h2>
            <p className="sa-booking-sub">
              Complete the form below and a senior aviation risk analyst will be in touch to confirm a call time.
            </p>
            <form className="sa-booking-form" onSubmit={(e) => { e.preventDefault(); closeBooking(); }}>
              <div className="sa-form-row">
                <div className="sa-form-group">
                  <label htmlFor="sa-f-name">Full Name *</label>
                  <input type="text" id="sa-f-name" name="name" required placeholder="Jane Smith" />
                </div>
                <div className="sa-form-group">
                  <label htmlFor="sa-f-email">Email Address *</label>
                  <input type="email" id="sa-f-email" name="email" required placeholder="jane@airline.com" />
                </div>
              </div>
              <div className="sa-form-row">
                <div className="sa-form-group">
                  <label htmlFor="sa-f-org">Organisation</label>
                  <input type="text" id="sa-f-org" name="organisation" placeholder="Airline / Operator" />
                </div>
                <div className="sa-form-group">
                  <label htmlFor="sa-f-topic">Topic</label>
                  <select id="sa-f-topic" name="topic">
                    <option value="">Select a topic…</option>
                    <option>Route / Location Risk</option>
                    <option>Country Intelligence</option>
                    <option>Emergency Response Planning</option>
                    <option>Crisis Management</option>
                    <option>Security & Logistics</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="sa-form-row">
                <div className="sa-form-group">
                  <label htmlFor="sa-f-date">Preferred Date</label>
                  <input type="text" id="sa-f-date" name="preferred_date" placeholder="Select a date…" readOnly />
                </div>
                <div className="sa-form-group">
                  <label htmlFor="sa-f-time">Preferred Time (EAT)</label>
                  <input type="text" id="sa-f-time" name="preferred_time" placeholder="Select a time…" readOnly />
                </div>
              </div>
              <div className="sa-form-row">
                <div className="sa-form-group sa-form-group-full">
                  <label htmlFor="sa-f-msg">Message</label>
                  <textarea id="sa-f-msg" name="message" placeholder="Briefly describe the location, route, or subject you'd like to discuss…" />
                </div>
              </div>
              <button type="submit" className="sa-form-submit">Request a Call</button>
              <p className="sa-form-note">Your details are treated in strict confidence and will not be shared with third parties.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}