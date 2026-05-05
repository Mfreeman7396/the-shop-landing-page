import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import navLogo from "./assets/Theshop1transparent.png";
import "./admin.css";

function Admin() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const fetchSignups = async () => {
    setLoading(true);

    try {
      const q = query(
        collection(db, "launchSignups"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setSignups(data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  const customers = signups.filter((s) => s.role === "Customer");
  const mechanics = signups.filter((s) => s.role === "Mechanic");

  const filteredSignups = useMemo(() => {
    let list = signups;

    if (activeTab === "Customers") list = customers;
    if (activeTab === "Mechanics") list = mechanics;

    const term = search.toLowerCase().trim();
    if (!term) return list;

    return list.filter((s) =>
      `${s.fullName || ""} ${s.email || ""} ${s.phone || ""} ${
        s.location || ""
      } ${s.role || ""} ${s.leadStatus || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [signups, customers, mechanics, activeTab, search]);

  const formatDate = (createdAt) => {
    if (!createdAt?.toDate) return "N/A";
    return createdAt.toDate().toLocaleString();
  };

  const handleLeadChange = async (id, value) => {
    try {
      await updateDoc(doc(db, "launchSignups", id), {
        leadStatus: value,
      });

      setSignups((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, leadStatus: value } : item
        )
      );
    } catch (err) {
      console.error("Lead status update error:", err);
      alert("Could not update lead status.");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Location",
      "Role",
      "Lead Status",
      "Submitted",
    ];

    const rows = filteredSignups.map((user) => [
      user.fullName || "",
      user.email || "",
      user.phone || "",
      user.location || "",
      user.role || "",
      user.leadStatus || "New Lead",
      formatDate(user.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `the-shop-launch-signups.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <img src={navLogo} alt="The Shop" className="admin-logo" />
            <p className="admin-subtitle">Launch Signup Admin</p>
          </div>

          <div className="header-actions">
            <button onClick={exportCSV} className="export-btn">
              Export CSV
            </button>

            <button onClick={fetchSignups} className="refresh-btn">
              Refresh
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Signups</p>
            <h2>{signups.length}</h2>
          </div>

          <div className="stat-card">
            <p>Customers</p>
            <h2>{customers.length}</h2>
          </div>

          <div className="stat-card">
            <p>Mechanics</p>
            <h2>{mechanics.length}</h2>
          </div>
        </section>

        <section className="controls">
          <div className="tabs">
            {["All", "Customers", "Mechanics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            className="search"
            placeholder="Search name, email, phone, city, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        <section className="list-panel">
          <div className="list-header">
            <h2>{activeTab} List</h2>
            <p>{filteredSignups.length} showing</p>
          </div>

          {loading ? (
            <p className="empty">Loading signups...</p>
          ) : filteredSignups.length === 0 ? (
            <p className="empty">No signups found.</p>
          ) : (
            <div className="scroll-list">
              {filteredSignups.map((user) => (
                <div key={user.id} className="lead-card">
                  <div className="lead-top">
                    <h3>{user.fullName || "No Name"}</h3>

                    <span
                      className={`role-badge ${
                        user.role === "Mechanic" ? "mechanic" : "customer"
                      }`}
                    >
                      {user.role || "Unknown"}
                    </span>
                  </div>

                  <div className="info-grid">
                    <p>
                      <strong>Email:</strong> {user.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong> {user.location || "N/A"}
                    </p>
                    <p>
                      <strong>Submitted:</strong> {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <select
                    className="lead-select"
                    value={user.leadStatus || "New Lead"}
                    onChange={(e) => handleLeadChange(user.id, e.target.value)}
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Warm Lead">Warm Lead</option>
                    <option value="Cold Lead">Cold Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Admin;