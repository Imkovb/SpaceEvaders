(() => {
  "use strict";

  const PARKS_URL = "https://queue-times.com/parks.json";
  const QUEUE_URL = (id) => `https://queue-times.com/parks/${id}/queue_times.json`;
  const PARK_ID_KEY = "pl_park_id";
  const REFRESH_MS = 60000;

  const els = {
    summary: document.getElementById("summary"),
    lastUpdated: document.getElementById("last-updated"),
    refreshBtn: document.getElementById("refresh-btn"),
    loading: document.getElementById("loading"),
    error: document.getElementById("error"),
    lands: document.getElementById("lands"),
    search: document.getElementById("search"),
    sortToggle: document.getElementById("sort-toggle"),
  };

  let sortMode = "land";
  let lastData = null; // { lands: [{ name, rides: [...] }] }
  let refreshTimer = null;

  // Fetches JSON directly, falling back to public CORS proxies if the
  // browser blocks the cross-origin request outright.
  async function fetchJson(url) {
    const attempts = [
      url,
      `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];
    let lastErr;
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }

  async function getParkId() {
    const cached = localStorage.getItem(PARK_ID_KEY);
    if (cached) return cached;

    const groups = await fetchJson(PARKS_URL);
    for (const group of groups) {
      for (const park of group.parks || []) {
        if (park.name.toLowerCase().includes("phantasialand")) {
          localStorage.setItem(PARK_ID_KEY, String(park.id));
          return String(park.id);
        }
      }
    }
    throw new Error("Phantasialand not found in queue-times.com park list");
  }

  function normalize(raw) {
    const lands = (raw.lands || []).map((l) => ({ name: l.name, rides: l.rides || [] }));
    if (raw.rides && raw.rides.length) {
      lands.push({ name: "Other", rides: raw.rides });
    }
    return lands;
  }

  function waitClass(ride) {
    if (!ride.is_open) return "closed";
    if (ride.wait_time <= 20) return "green";
    if (ride.wait_time <= 45) return "amber";
    return "red";
  }

  function waitLabel(ride) {
    if (!ride.is_open) return "Closed";
    return `${ride.wait_time} min`;
  }

  function render() {
    if (!lastData) return;
    const query = els.search.value.trim().toLowerCase();

    let lands = lastData.map((l) => ({
      name: l.name,
      rides: l.rides.filter((r) => r.name.toLowerCase().includes(query)),
    }));

    if (sortMode === "wait") {
      const all = lands.flatMap((l) => l.rides);
      all.sort((a, b) => {
        if (a.is_open !== b.is_open) return a.is_open ? -1 : 1;
        return (b.wait_time || 0) - (a.wait_time || 0);
      });
      lands = [{ name: "All rides", rides: all }];
    }

    lands = lands.filter((l) => l.rides.length > 0);

    els.lands.innerHTML = "";
    if (lands.length === 0) {
      const div = document.createElement("div");
      div.id = "empty-state";
      div.textContent = "No rides match your search.";
      els.lands.appendChild(div);
    } else {
      for (const land of lands) {
        const section = document.createElement("section");
        section.className = "land";

        const h2 = document.createElement("h2");
        h2.textContent = land.name;
        section.appendChild(h2);

        const list = document.createElement("div");
        list.className = "ride-list";
        for (const ride of land.rides) {
          const row = document.createElement("div");
          row.className = "ride";

          const name = document.createElement("span");
          name.className = "ride-name";
          name.textContent = ride.name;

          const badge = document.createElement("span");
          badge.className = `wait-badge ${waitClass(ride)}`;
          badge.textContent = waitLabel(ride);

          row.appendChild(name);
          row.appendChild(badge);
          list.appendChild(row);
        }
        section.appendChild(list);
        els.lands.appendChild(section);
      }
    }

    const allRides = lastData.flatMap((l) => l.rides);
    const openCount = allRides.filter((r) => r.is_open).length;
    els.summary.textContent = `${openCount} open · ${allRides.length - openCount} closed`;
  }

  async function refresh(userTriggered) {
    if (userTriggered) els.refreshBtn.classList.add("spinning");
    try {
      const parkId = await getParkId();
      const raw = await fetchJson(QUEUE_URL(parkId));
      lastData = normalize(raw);
      els.loading.hidden = true;
      els.error.hidden = true;
      els.lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString()}`;
      render();
    } catch (err) {
      if (!lastData) {
        els.loading.hidden = true;
        els.error.hidden = false;
        els.error.textContent = `Couldn't load wait times: ${err.message}`;
      } else {
        els.lastUpdated.textContent = `Last update failed (${new Date().toLocaleTimeString()}), showing cached data`;
      }
    } finally {
      if (userTriggered) {
        setTimeout(() => els.refreshBtn.classList.remove("spinning"), 700);
      }
    }
  }

  function scheduleAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => refresh(false), REFRESH_MS);
  }

  els.refreshBtn.addEventListener("click", () => refresh(true));
  els.search.addEventListener("input", render);
  els.sortToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-sort]");
    if (!btn) return;
    sortMode = btn.dataset.sort;
    for (const b of els.sortToggle.querySelectorAll("button")) {
      b.classList.toggle("active", b === btn);
    }
    render();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh(false);
  });

  refresh(false);
  scheduleAutoRefresh();
})();
