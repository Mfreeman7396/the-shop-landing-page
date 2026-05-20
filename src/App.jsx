import { useEffect, useLayoutEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./App.css";
import Admin from "./admin.jsx";
import navLogo from "./assets/Theshop1transparent.png";

const translations = {
  en: {
    launchDate: "Coming Soon",
    headlineTop: "Your Car.",
    headlineAccent: "Wherever You Are.",
    heroText:
      "Experienced mobile mechanics come to you, whether you're at home, work, or stuck on the road.",
    joinWaitlist: "Early Customer Access",
    applyMechanic: "Apply as Mechanic",
    experiencedMechanics: "Experienced Mechanics",
    qualityService: "Quality Service",
    transparentPricing: "Fair & Transparent Pricing",
    howItWorks: "How It Works",
    mechanicsWanted: "Mechanics Wanted",
    getEarlyAccess: "Early Customer Access",
    aboutUs: "About Us",
    backHome: "Back Home",
    aboutLabel: "About The Shop",
    aboutTitle: "Built for clearer, easier mobile mechanic service.",
    aboutIntro:
      "The Shop is a modern platform built to connect customers with trusted mobile mechanics in their area.",
    aboutParagraphs: [
      "Whether your vehicle will not start, needs maintenance, or requires diagnostics, The Shop helps make getting help faster, clearer, and more convenient.",
      "Instead of spending hours searching for a shop, waiting for a tow truck, or wondering when a mechanic will arrive, customers can request service directly from their phone and connect with mechanics who come to them.",
      "The Shop was designed for people who need reliable vehicle service at home, work, on the roadside, or anywhere in between.",
      "Customers can request mobile mechanic services, save vehicles in a personal garage, track appointments and updates, chat with mechanics, view pricing before confirming appointments, and schedule service without unnecessary confusion.",
      "The Shop is also built to help mechanics grow. Independent mechanics and mobile technicians can receive service requests nearby, set their own pricing, manage schedules and availability, communicate with customers, build reviews, and grow their business using a modern platform.",
      "Our goal is to create opportunities for hardworking mechanics while making vehicle service easier and more transparent for customers.",
      "The Shop focuses on clear scheduling, transparent pricing, real-time updates, customer and mechanic communication, and a simpler service experience.",
      "The mission is simple: make mobile mechanic service more accessible, more professional, and easier for everyone involved.",
    ],
    aboutCustomerTitle: "For Customers",
    aboutCustomerText:
      "Request help from your phone, compare clear service details, and connect with mobile mechanics who come to your home, workplace, roadside location, or anywhere in between.",
    aboutMechanicTitle: "For Mechanics",
    aboutMechanicText:
      "Receive nearby requests, manage availability, set pricing, communicate with customers, earn reviews, and grow a mobile service business with modern tools.",
    aboutTrustTitle: "Built on Trust",
    aboutTrustText:
      "Transparent pricing, clear scheduling, real-time updates, and direct communication help customers and mechanics work with confidence.",
  },
  es: {
    launchDate: "Próximamente",
    headlineTop: "Tu auto.",
    headlineAccent: "Dondequiera que estés.",
    heroText:
      "Mecánicos móviles con experiencia van a ti, ya sea que estés en casa, en el trabajo o varado en la carretera.",
    joinWaitlist: "Acceso anticipado para clientes",
    applyMechanic: "Aplicar como mecánico",
    experiencedMechanics: "Mecánicos con experiencia",
    qualityService: "Servicio de calidad",
    transparentPricing: "Precios justos y transparentes",
    howItWorks: "Cómo funciona",
    mechanicsWanted: "Buscamos mecánicos",
    getEarlyAccess: "Acceso anticipado para clientes",
    aboutUs: "Acerca de nosotros",
    backHome: "Volver al inicio",
    aboutLabel: "Acerca de The Shop",
    aboutTitle: "Creado para un servicio mecánico móvil más claro y fácil.",
    aboutIntro:
      "The Shop es una plataforma moderna creada para conectar a clientes con mecánicos móviles confiables en su área.",
    aboutParagraphs: [
      "Ya sea que tu vehículo no arranque, necesite mantenimiento o requiera diagnóstico, The Shop ayuda a que recibir ayuda sea más rápido, claro y conveniente.",
      "En lugar de pasar horas buscando un taller, esperar una grúa o preguntarte cuándo llegará un mecánico, los clientes pueden solicitar servicio directamente desde su teléfono y conectar con mecánicos que van a ellos.",
      "The Shop fue diseñado para personas que necesitan servicio confiable para su vehículo en casa, en el trabajo, en la carretera o en cualquier punto intermedio.",
      "Los clientes pueden solicitar servicios de mecánica móvil, guardar vehículos en un garage personal, seguir citas y actualizaciones, chatear con mecánicos, ver precios antes de confirmar citas y programar servicio sin confusión innecesaria.",
      "The Shop también está diseñado para ayudar a los mecánicos a crecer. Mecánicos independientes y técnicos móviles pueden recibir solicitudes cercanas, establecer sus propios precios, administrar horarios y disponibilidad, comunicarse con clientes, construir reseñas y hacer crecer su negocio con una plataforma moderna.",
      "Nuestro objetivo es crear oportunidades para mecánicos trabajadores mientras hacemos que el servicio vehicular sea más fácil y transparente para los clientes.",
      "The Shop se enfoca en programación clara, precios transparentes, actualizaciones en tiempo real, comunicación entre clientes y mecánicos, y una experiencia de servicio más simple.",
      "La misión es simple: hacer que el servicio mecánico móvil sea más accesible, más profesional y más fácil para todos.",
    ],
    aboutCustomerTitle: "Para clientes",
    aboutCustomerText:
      "Solicita ayuda desde tu teléfono, compara detalles claros del servicio y conecta con mecánicos móviles que van a tu casa, trabajo, ubicación en carretera o cualquier punto intermedio.",
    aboutMechanicTitle: "Para mecánicos",
    aboutMechanicText:
      "Recibe solicitudes cercanas, administra disponibilidad, establece precios, comunícate con clientes, gana reseñas y haz crecer un negocio móvil con herramientas modernas.",
    aboutTrustTitle: "Construido sobre confianza",
    aboutTrustText:
      "Precios transparentes, programación clara, actualizaciones en tiempo real y comunicación directa ayudan a clientes y mecánicos a trabajar con confianza.",
  },
};

const scrollPageToTop = () => {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const resetPageScrollAfterNavigation = () => {
  window.setTimeout(() => {
    scrollPageToTop();
  }, 0);
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname);
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("language") === "es" ? "es" : "en";
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Customer",
    location: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminPage = route === "/admin";
  const isAboutPage = route === "/about";
  const t = translations[language];

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  const navigateTo = (nextRoute) => {
    window.history.pushState({}, "", nextRoute);
    setRoute(nextRoute);
    setMenuOpen(false);

    if (nextRoute === "/" || nextRoute === "/about") {
      resetPageScrollAfterNavigation();
    }
  };

  const navigateHomeSection = (id, role) => {
    if (role) {
      setFormData((prev) => ({
        ...prev,
        role,
      }));
    }

    if (route !== "/") {
      window.history.pushState({}, "", "/");
      setRoute("/");
      setMenuOpen(false);
      window.setTimeout(() => {
        scrollToSection(id);
      }, 0);
      return;
    }

    scrollToSection(id);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  const handleJoinWaitlist = () => {
    navigateHomeSection("waitlist", "Customer");
  };

  const handleApplyMechanic = () => {
    navigateHomeSection("waitlist", "Mechanic");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (isAdminPage) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAdminPage]);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
      setMenuOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isAboutPage) return;

    resetPageScrollAfterNavigation();
    setScrolled(false);
  }, [isAboutPage]);

  const submitSignup = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setStatus("Please enter your name and email.");
      return;
    }

    setLoading(true);
    setStatus("Submitting...");

    try {
      await addDoc(collection(db, "launchSignups"), {
        ...formData,
        source: "landing-page",
        launchDate: "Coming Soon",
        leadStatus: "New Lead",
        createdAt: serverTimestamp(),
      });

      if (formData.role === "Mechanic") {
        await addDoc(collection(db, "mechanicLeads"), {
          businessName: formData.fullName || "",
          contactName: formData.fullName || "",
          phone: formData.phone || "",
          email: formData.email || "",
          city: formData.location || "",
          source: "Launch Page",
          status: "New Lead",
          notes: "Signed up through The Shop launch page.",
          website: "",
          socialLink: "",
          nextFollowUp: "",
          lastContacted: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setStatus("You’re on the list 🔥");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "Customer",
        location: "",
      });
    } catch (error) {
      console.error("Firebase submit error:", error);
      setStatus("Something went wrong. Check Firebase settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSignup();
  };

  if (isAdminPage) {
    return <Admin />;
  }

  return (
    <div className="app">
      <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
        <a
          href="/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("/");
          }}
        >
          <img src={navLogo} alt="The Shop Logo" />
        </a>

        <div className="topActions">
          <div className="languageToggle" aria-label="Select language">
            <button
              className={language === "en" ? "active" : ""}
              type="button"
              onClick={() => handleLanguageChange("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <button
              className={language === "es" ? "active" : ""}
              type="button"
              onClick={() => handleLanguageChange("es")}
              aria-pressed={language === "es"}
            >
              ES
            </button>
          </div>

          {isAboutPage && (
            <button className="topNavLink" onClick={() => navigateTo("/")}>
              {t.backHome}
            </button>
          )}

          {!isAboutPage && (
            <>
              <button className="topPrimary" onClick={handleJoinWaitlist}>
                {t.joinWaitlist}
              </button>

              <button className="topSecondary" onClick={handleApplyMechanic}>
                {t.applyMechanic}
              </button>
            </>
          )}
        </div>

        <button className="menuBtn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {menuOpen && (
          <div className="dropdownMenu">
            <button onClick={() => navigateHomeSection("how-it-works")}>
              {t.howItWorks}
            </button>

            <button onClick={() => navigateHomeSection("mechanics")}>
              {t.mechanicsWanted}
            </button>

            {!isAboutPage && (
              <>
                <button onClick={() => navigateHomeSection("waitlist")}>
                  {t.getEarlyAccess}
                </button>

                <button onClick={handleApplyMechanic}>{t.applyMechanic}</button>
              </>
            )}

            {isAboutPage ? (
              <button onClick={() => navigateTo("/")}>{t.backHome}</button>
            ) : (
              <button onClick={() => navigateTo("/about")}>
                {t.aboutUs}
              </button>
            )}
          </div>
        )}
      </header>

      {isAboutPage ? (
        <>
          <main className="aboutPage">
            <section className="aboutHero">
              <div className="aboutHeroInner">
                <p className="sectionLabel">{t.aboutLabel}</p>
                <h1>{t.aboutTitle}</h1>
                <p className="aboutIntro">{t.aboutIntro}</p>

                <div className="aboutActions">
                  <button className="primaryBtn" onClick={handleJoinWaitlist}>
                    {t.joinWaitlist}
                  </button>
                  <button className="secondaryBtn" onClick={handleApplyMechanic}>
                    {t.applyMechanic}
                  </button>
                </div>
              </div>
            </section>

            <section className="aboutContent">
              <div className="aboutCopy">
                {t.aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <h2>
                  {t.headlineTop} {t.headlineAccent}
                </h2>
              </div>

              <div className="aboutCards">
                <article className="aboutCard">
                  <h3>{t.aboutCustomerTitle}</h3>
                  <p>{t.aboutCustomerText}</p>
                </article>
                <article className="aboutCard">
                  <h3>{t.aboutMechanicTitle}</h3>
                  <p>{t.aboutMechanicText}</p>
                </article>
                <article className="aboutCard">
                  <h3>{t.aboutTrustTitle}</h3>
                  <p>{t.aboutTrustText}</p>
                </article>
              </div>
            </section>
          </main>

          <footer className="footer">
            <img src={navLogo} alt="The Shop Logo" />

            <p>{t.launchDate}</p>

            <p>
              {t.headlineTop} {t.headlineAccent}
            </p>
          </footer>
        </>
      ) : (
        <>
      <main>
        <section className="hero">
          <div className="heroContent">
            <p className="launchBadge">{t.launchDate}</p>

            <h1>
              {t.headlineTop}
              <br />
              <span>{t.headlineAccent}</span>
            </h1>

            <p className="heroText">{t.heroText}</p>

            <div className="heroButtons">
              <button className="primaryBtn" onClick={handleJoinWaitlist}>
                {t.joinWaitlist}
              </button>

              <button className="secondaryBtn" onClick={handleApplyMechanic}>
                {t.applyMechanic}
              </button>
            </div>

            <div className="trustRow">
              <span>✓ {t.experiencedMechanics}</span>
              <span>✓ {t.qualityService}</span>
              <span>✓ {t.transparentPricing}</span>
            </div>
          </div>
        </section>

        <section className="section howSection" id="how-it-works">
          <p className="sectionLabel">How It Works</p>

          <h2>
            {t.headlineTop} {t.headlineAccent}
          </h2>

          <div className="cards">
            <div className="card">
              <div className="number">1</div>

              <h3>Tell Us The Vehicle</h3>

              <p>
                Add your car to your garage and choose what service you need.
              </p>
            </div>

            <div className="card">
              <div className="number">2</div>

              <h3>Choose A Mechanic</h3>

              <p>
                Pick from available experienced mechanics near your location.
              </p>
            </div>

            <div className="card">
              <div className="number">3</div>

              <h3>Get Help</h3>

              <p>Your mechanic comes to you, wherever you need help.</p>
            </div>
          </div>
        </section>

        <section className="section mechanicSection" id="mechanics">
          <p className="sectionLabel">Mechanics Wanted</p>

          <h2>Experienced Mobile Mechanics, Join Early.</h2>

          <button className="primaryBtn sectionBtn" onClick={handleApplyMechanic}>
            {t.applyMechanic}
          </button>
        </section>

        <section className="section signup" id="waitlist">
          <p className="sectionLabel">{t.getEarlyAccess}</p>

          <h2>Early Customer Access</h2>

          <form className="form" onSubmit={handleSubmit}>
            <input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Customer">I am a Customer</option>
              <option value="Mechanic">I am an Experienced Mechanic</option>
            </select>

            <input
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
            />

            <button type="submit" className="primaryBtn" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            {status && <p>{status}</p>}
          </form>
        </section>
      </main>

      <footer className="footer">
        <img src={navLogo} alt="The Shop Logo" />

        <p>{t.launchDate}</p>

        <p>
          {t.headlineTop} {t.headlineAccent}
        </p>
      </footer>
        </>
      )}
    </div>
  );
}

export default App;
