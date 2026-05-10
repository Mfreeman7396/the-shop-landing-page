import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./App.css";
import Admin from "./admin.jsx";
import navLogo from "./assets/Theshop1transparent.png";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

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

  const isAdminPage = window.location.pathname === "/admin";

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  const handleJoinWaitlist = () => {
    setFormData((prev) => ({
      ...prev,
      role: "Customer",
    }));

    scrollToSection("waitlist");
  };

  const handleApplyMechanic = () => {
    setFormData((prev) => ({
      ...prev,
      role: "Mechanic",
    }));

    scrollToSection("waitlist");
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
        launchDate: "June 16, 2026",
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
        <a href="#" className="brand">
          <img src={navLogo} alt="The Shop Logo" />
        </a>

        <div className="topActions">
          <button className="topPrimary" onClick={handleJoinWaitlist}>
            Join Waitlist
          </button>

          <button className="topSecondary" onClick={handleApplyMechanic}>
            Apply as Mechanic
          </button>
        </div>

        <button className="menuBtn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {menuOpen && (
          <div className="dropdownMenu">
            <button onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>

            <button onClick={() => scrollToSection("mechanics")}>
              Mechanics Wanted
            </button>

            <button onClick={() => scrollToSection("waitlist")}>
              Get Early Access
            </button>

            <button onClick={() => scrollToSection("contact")}>
              Contact Us
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="hero">
          <div className="heroContent">
            <p className="launchBadge">Launching June 16, 2026</p>

            <h1>
              Your Car.
              <br />
              <span>Wherever You Are.</span>
            </h1>

            <p className="heroText">
              Certified mobile mechanics come to you, whether you're at home,
              work, or stuck on the road.
            </p>

            <div className="heroButtons">
              <button className="primaryBtn" onClick={handleJoinWaitlist}>
                Join Waitlist
              </button>

              <button className="secondaryBtn" onClick={handleApplyMechanic}>
                Apply as Mechanic
              </button>
            </div>

            <div className="trustRow">
              <span>✓ Experienced Mechanics</span>
              <span>✓ Quality Service</span>
              <span>✓ Fair & Transparent Pricing</span>
            </div>
          </div>
        </section>

        <section className="section howSection" id="how-it-works">
          <p className="sectionLabel">How It Works</p>

          <h2>Your Car. Wherever You Are.</h2>

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
                Pick from available certified mechanics near your location.
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

          <h2>Certified Mobile Mechanics, Join Early.</h2>

          <button className="primaryBtn sectionBtn" onClick={handleApplyMechanic}>
            Apply as Mechanic
          </button>
        </section>

        <section className="section signup" id="waitlist">
          <p className="sectionLabel">Get Early Access</p>

          <h2>Join The Launch List</h2>

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
              <option value="Mechanic">I am a Certified Mechanic</option>
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

        <p>Launching June 16, 2026</p>

        <p>Your Car. Wherever You Are.</p>
      </footer>
    </div>
  );
}

export default App;