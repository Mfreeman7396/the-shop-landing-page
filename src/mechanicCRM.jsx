import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import "./mechaniccrm.css";

const initialForm = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  source: "Facebook",
  status: "New Lead",
  notes: "",
  website: "",
  socialLink: "",
  nextFollowUp: "",
};

function MechanicCRM({ onBack }) {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showPipeline, setShowPipeline] = useState(false);

  const fetchLeads = async () => {
    try {
      const q = query(
        collection(db, "mechanicLeads"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setLeads(data);
    } catch (err) {
      console.error("Mechanic CRM fetch error:", err);
      alert("Could not load mechanic leads. Check the console.");
    }
  };

  const importExistingMechanics = async (showAlert = false) => {
    setLoading(true);

    try {
      const signupsSnapshot = await getDocs(collection(db, "launchSignups"));
      const leadsSnapshot = await getDocs(collection(db, "mechanicLeads"));

      const existingKeys = leadsSnapshot.docs.map((docSnap) => {
        const lead = docSnap.data();
        const email = (lead.email || "").toLowerCase().trim();
        const phone = (lead.phone || "").replace(/\D/g, "");
        const name = (lead.contactName || lead.businessName || "")
          .toLowerCase()
          .trim();

        return email || phone || name;
      });

      const mechanicSignups = signupsSnapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((signup) => {
          const role = (signup.role || "").toLowerCase().trim();
          return role.includes("mechanic");
        });

      let importedCount = 0;

      for (const mechanic of mechanicSignups) {
        const email = (mechanic.email || "").toLowerCase().trim();
        const phone = (mechanic.phone || "").replace(/\D/g, "");
        const name = (mechanic.fullName || "").toLowerCase().trim();
        const key = email || phone || name;

        if (key && existingKeys.includes(key)) {
          continue;
        }

        await addDoc(collection(db, "mechanicLeads"), {
          businessName: mechanic.fullName || "",
          contactName: mechanic.fullName || "",
          phone: mechanic.phone || "",
          email: mechanic.email || "",
          city: mechanic.location || "",
          source: "Launch Page",
          status: mechanic.leadStatus || "New Lead",
          notes: "Imported from launch signup list.",
          website: "",
          socialLink: "",
          nextFollowUp: "",
          lastContacted: "",
          launchSignupId: mechanic.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (key) {
          existingKeys.push(key);
        }

        importedCount++;
      }

      await fetchLeads();

      if (showAlert) {
        alert(
          `Sync complete. Found ${mechanicSignups.length} mechanic signup(s). Imported ${importedCount} new lead(s).`
        );
      }
    } catch (err) {
      console.error("Import mechanics error:", err);

      if (showAlert) {
        alert("Could not sync mechanics. Check the browser console.");
      }

      await fetchLeads();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    importExistingMechanics(false);
  }, []);

  const filteredLeads = useMemo(() => {
    let list = leads;

    if (statusFilter !== "All") {
      list = list.filter((lead) => lead.status === statusFilter);
    }

    const term = search.toLowerCase().trim();

    if (!term) return list;

    return list.filter((lead) =>
      `${lead.businessName || ""} ${lead.contactName || ""} ${
        lead.phone || ""
      } ${lead.email || ""} ${lead.city || ""} ${lead.source || ""} ${
        lead.status || ""
      } ${lead.notes || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [leads, search, statusFilter]);

  const followUpsDue = leads.filter((lead) => {
    if (!lead.nextFollowUp) return false;

    const today = new Date().toISOString().split("T")[0];

    return lead.nextFollowUp <= today && lead.status !== "Approved";
  });

  const interestedLeads = leads.filter((lead) => lead.status === "Interested");
  const approvedLeads = leads.filter((lead) => lead.status === "Approved");
  const contactedLeads = leads.filter((lead) => lead.status === "Contacted");
  const newLeads = leads.filter((lead) => lead.status === "New Lead");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLead = async (e) => {
    e.preventDefault();

    if (!form.businessName.trim() && !form.contactName.trim()) {
      alert("Add at least a mechanic/business name or contact name.");
      return;
    }

    try {
      await addDoc(collection(db, "mechanicLeads"), {
        ...form,
        lastContacted: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setForm(initialForm);
      fetchLeads();
    } catch (err) {
      console.error("Add mechanic lead error:", err);
      alert("Could not add mechanic lead.");
    }
  };

  const handleLeadUpdate = async (id, field, value) => {
    try {
      await updateDoc(doc(db, "mechanicLeads", id), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, [field]: value } : lead))
      );
    } catch (err) {
      console.error("Update mechanic lead error:", err);
      alert("Could not update lead.");
    }
  };

  const markContactedToday = async (id) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      await updateDoc(doc(db, "mechanicLeads", id), {
        lastContacted: today,
        status: "Contacted",
        updatedAt: serverTimestamp(),
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id
            ? { ...lead, lastContacted: today, status: "Contacted" }
            : lead
        )
      );
    } catch (err) {
      console.error("Mark contacted error:", err);
      alert("Could not mark contacted.");
    }
  };

  const handleDeleteLead = async (id) => {
    const confirmDelete = window.confirm("Delete this mechanic lead?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "mechanicLeads", id));
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error("Delete mechanic lead error:", err);
      alert("Could not delete lead.");
    }
  };

  const Header = () => (
    <header className="crm-header">
      <div>
        <p className="crm-kicker">The Shop Admin</p>
        <h1>{showPipeline ? "Mechanic Pipeline" : "Mechanic CRM"}</h1>
        <p className="crm-subtitle">
          {showPipeline
            ? "Review, search, update, and follow up with mechanic leads."
            : "Track mechanic outreach, follow ups, notes, and onboarding."}
        </p>
      </div>

      <div className="crm-header-actions">
        {showPipeline ? (
          <button onClick={() => setShowPipeline(false)} className="crm-back-btn">
            ← Back to CRM
          </button>
        ) : (
          onBack && (
            <button onClick={onBack} className="crm-back-btn">
              ← Back to Admin
            </button>
          )
        )}

        <button
          onClick={() => importExistingMechanics(true)}
          className="crm-refresh-btn"
          disabled={loading}
        >
          {loading ? "Syncing..." : "Refresh / Sync"}
        </button>
      </div>
    </header>
  );

  const PipelineView = () => (
    <>
      <Header />

      <section className="crm-controls">
        <input
          className="crm-search"
          placeholder="Search mechanic, phone, city, source, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="crm-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="New Lead">New Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Follow Up">Follow Up</option>
          <option value="Applied">Applied</option>
          <option value="Approved">Approved</option>
          <option value="No Response">No Response</option>
          <option value="Not Interested">Not Interested</option>
        </select>
      </section>

      <section className="crm-list-panel">
        <div className="crm-list-header">
          <h2>All Mechanic Leads</h2>
          <p>{filteredLeads.length} showing</p>
        </div>

        {loading ? (
          <p className="crm-empty">Loading mechanic leads...</p>
        ) : filteredLeads.length === 0 ? (
          <p className="crm-empty">No mechanic leads yet.</p>
        ) : (
          <div className="crm-lead-grid">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="crm-lead-card">
                <div className="crm-lead-top">
                  <div>
                    <h3>{lead.businessName || lead.contactName || "Unnamed Lead"}</h3>
                    <p>{lead.city || "No city added"}</p>
                  </div>

                  <span
                    className={`crm-status ${lead.status
                      ?.toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {lead.status || "New Lead"}
                  </span>
                </div>

                <div className="crm-info-grid">
                  <p><strong>Contact:</strong> {lead.contactName || "N/A"}</p>
                  <p><strong>Phone:</strong> {lead.phone || "N/A"}</p>
                  <p><strong>Email:</strong> {lead.email || "N/A"}</p>
                  <p><strong>Source:</strong> {lead.source || "N/A"}</p>
                  <p><strong>Last Contacted:</strong> {lead.lastContacted || "Not yet"}</p>
                  <p><strong>Next Follow Up:</strong> {lead.nextFollowUp || "None"}</p>
                </div>

                <textarea
                  className="crm-notes"
                  value={lead.notes || ""}
                  onChange={(e) =>
                    handleLeadUpdate(lead.id, "notes", e.target.value)
                  }
                  placeholder="Add notes..."
                />

                <div className="crm-card-controls">
                  <select
                    value={lead.status || "New Lead"}
                    onChange={(e) =>
                      handleLeadUpdate(lead.id, "status", e.target.value)
                    }
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Applied">Applied</option>
                    <option value="Approved">Approved</option>
                    <option value="No Response">No Response</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>

                  <input
                    type="date"
                    value={lead.nextFollowUp || ""}
                    onChange={(e) =>
                      handleLeadUpdate(lead.id, "nextFollowUp", e.target.value)
                    }
                  />
                </div>

                <div className="crm-links">
                  {lead.website && (
                    <a href={lead.website} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  )}

                  {lead.socialLink && (
                    <a href={lead.socialLink} target="_blank" rel="noreferrer">
                      Social
                    </a>
                  )}
                </div>

                <div className="crm-actions">
                  <button onClick={() => markContactedToday(lead.id)}>
                    Mark Contacted Today
                  </button>

                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const HomeView = () => (
    <>
      <Header />

      <section className="crm-stats-grid">
        <div className="crm-stat-card">
          <p>Total Leads</p>
          <h2>{leads.length}</h2>
        </div>

        <div className="crm-stat-card">
          <p>New Leads</p>
          <h2>{newLeads.length}</h2>
        </div>

        <div className="crm-stat-card">
          <p>Contacted</p>
          <h2>{contactedLeads.length}</h2>
        </div>

        <div className="crm-stat-card">
          <p>Interested</p>
          <h2>{interestedLeads.length}</h2>
        </div>

        <div className="crm-stat-card">
          <p>Approved</p>
          <h2>{approvedLeads.length}</h2>
        </div>

        <div className="crm-stat-card urgent">
          <p>Follow Ups Due</p>
          <h2>{followUpsDue.length}</h2>
        </div>
      </section>

      <section className="crm-form-panel">
        <div className="crm-section-title">
          <h2>CRM Home</h2>
          <p>
            Add new mechanic leads here, then open the pipeline when you want to
            work the full list.
          </p>
        </div>

        <div className="crm-header-actions" style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setShowPipeline(true)}
            className="crm-refresh-btn"
          >
            View Pipeline
          </button>

          <button
            onClick={() => importExistingMechanics(true)}
            className="crm-back-btn"
            disabled={loading}
          >
            {loading ? "Syncing..." : "Sync Launch Signups"}
          </button>
        </div>

        <form onSubmit={handleAddLead} className="crm-form">
          <input
            name="businessName"
            placeholder="Business / Mechanic Name"
            value={form.businessName}
            onChange={handleChange}
          />

          <input
            name="contactName"
            placeholder="Contact Name"
            value={form.contactName}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City / Area"
            value={form.city}
            onChange={handleChange}
          />

          <select name="source" value={form.source} onChange={handleChange}>
            <option value="Facebook">Facebook</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Google">Google</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Referral">Referral</option>
            <option value="In Person">In Person</option>
            <option value="Other">Other</option>
            <option value="Launch Page">Launch Page</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Applied">Applied</option>
            <option value="Approved">Approved</option>
            <option value="No Response">No Response</option>
            <option value="Not Interested">Not Interested</option>
          </select>

          <input
            type="date"
            name="nextFollowUp"
            value={form.nextFollowUp}
            onChange={handleChange}
          />

          <input
            name="website"
            placeholder="Website"
            value={form.website}
            onChange={handleChange}
          />

          <input
            name="socialLink"
            placeholder="Social / Profile Link"
            value={form.socialLink}
            onChange={handleChange}
          />

          <textarea
            name="notes"
            placeholder="Notes, what they said, vibe, experience, pricing, next step..."
            value={form.notes}
            onChange={handleChange}
          />

          <button type="submit" className="crm-submit-btn">
            Add Lead
          </button>
        </form>
      </section>
    </>
  );

  return (
    <div className="crm-page">
      <div className="crm-shell">
        {showPipeline ? <PipelineView /> : <HomeView />}
      </div>
    </div>
  );
}

export default MechanicCRM;