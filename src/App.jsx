import Admin from "./Admin.jsx";
import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./App.css";
import navLogo from "./assets/theshop1transparent.png";



function App() {
  

    if (window.location.pathname === "/admin") {
      return <Admin />;
    }
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Customer",
    location: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleJoinWaitlist = () => {
    setFormData((prev) => ({ ...prev, role: "Customer" }));
    scrollToWaitlist();
  };

  const handleApplyMechanic = () => {
    setFormData((prev) => ({ ...prev, role: "Mechanic" }));
    scrollToWaitlist();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
        createdAt: serverTimestamp(),
      });

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

  return (
    <div className="app">
      <header className="topbar">
        <a href="#" className="brand">
          <img src={navLogo} alt="The Shop Logo" />
        </a>

        <div className="topActions">
          <button type="button" className="topPrimary" onClick={handleJoinWaitlist}>
            Join Waitlist
          </button>
          <button type="button" className="topSecondary" onClick={handleApplyMechanic}>
            Apply as Mechanic
          </button>
        </div>

        <button type="button" className="menuBtn">☰</button>
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
              <button type="button" className="primaryBtn" onClick={handleJoinWaitlist}>
                Join Waitlist
              </button>
              <button type="button" className="secondaryBtn" onClick={handleApplyMechanic}>
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

        <section className="section howSection">
          <p className="sectionLabel">How It Works</p>
          <h2>Your Car. Wherever You Are.</h2>

          <div className="cards">
            <div className="card">
              <div className="number">1</div>
              <h3>Tell Us The Vehicle</h3>
              <p>Add your car to your garage and choose what service you need.</p>
            </div>

            <div className="card">
              <div className="number">2</div>
              <h3>Choose A Mechanic</h3>
              <p>Pick from available certified mechanics near your location.</p>
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
          <p className="sectionText">
            Build your profile, set your service area, and be ready for customers
            when The Shop launches.
          </p>

          <button type="button" className="primaryBtn sectionBtn" onClick={handleApplyMechanic}>
            Apply as Mechanic
          </button>
        </section>

        <section className="section signup" id="waitlist">
          <p className="sectionLabel">Get Early Access</p>
          <h2>Join The Launch List</h2>

          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="tel"
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
              type="text"
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
            />

            <button
              type="button"
              className="primaryBtn"
              onClick={submitSignup}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {status && <p className="formStatus">{status}</p>}
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