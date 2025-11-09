document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  function showMessage(text, type = "info") {
    messageEl.className = `message ${type}`;
    messageEl.textContent = text;
    messageEl.classList.remove("hidden");
    setTimeout(() => {
      messageEl.classList.add("hidden");
    }, 4000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error("Failed to load activities");
      return await response.json();
    } catch (error) {
      console.error(error);
      showMessage("Could not load activities. Try again later.", "error");
      return {};
    }
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    const names = Object.keys(activities);
    if (names.length === 0) {
      activitiesList.innerHTML = '<p class="no-participants">No activities available.</p>';
      return;
    }

    names.forEach((name) => {
      const a = activities[name];

      // Card container
      const card = document.createElement("div");
      card.className = "activity-card";

      // Title
      const title = document.createElement("h4");
      title.textContent = name;
      card.appendChild(title);

      // Description
      const desc = document.createElement("p");
      desc.textContent = a.description;
      card.appendChild(desc);

      // Schedule & capacity
      const sched = document.createElement("p");
      sched.innerHTML = `<strong>Schedule:</strong> ${a.schedule}`;
      card.appendChild(sched);

      const cap = document.createElement("p");
      cap.innerHTML = `<strong>Participants:</strong> ${a.participants.length} / ${a.max_participants}`;
      card.appendChild(cap);

      // Participants section (new)
      const participantsWrap = document.createElement("div");
      participantsWrap.className = "participants";

      const pTitle = document.createElement("h5");
      pTitle.textContent = "Signed-up Students";
      participantsWrap.appendChild(pTitle);

      if (a.participants && a.participants.length > 0) {
        const ul = document.createElement("ul");
        a.participants.forEach((email) => {
          const li = document.createElement("li");
          li.textContent = email;
          ul.appendChild(li);
        });
        participantsWrap.appendChild(ul);
      } else {
        const empty = document.createElement("div");
        empty.className = "no-participants";
        empty.textContent = "No participants yet.";
        participantsWrap.appendChild(empty);
      }

      card.appendChild(participantsWrap);
      activitiesList.appendChild(card);

      // Add option to select
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      activitySelect.appendChild(opt);
    });
  }

  // Initial load
  async function loadAndRender() {
    const activities = await fetchActivities();
    renderActivities(activities);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;

    if (!email || !activity) {
      showMessage("Please provide your email and pick an activity.", "error");
      return;
    }

    try {
      const url = `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, { method: "POST" });
      const body = await response.json();

      if (!response.ok) {
        showMessage(body.detail || body.message || "Signup failed", "error");
        return;
      }

      showMessage(body.message || "Signed up successfully!", "success");
      signupForm.reset();
      await loadAndRender();
    } catch (error) {
      console.error(error);
      showMessage("Network error during signup.", "error");
    }
  });

  // Kick off
  loadAndRender();
});
