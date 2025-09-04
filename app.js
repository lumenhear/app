// Toggle sections
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Sample data
const speechData = [
  { title: "Say /pa/", desc: "Repeat /pa/ 10 times with correct lip closure." },
  { title: "Animal Sounds", desc: "Imitate cow, dog, and cat sounds." },
  { title: "Story Time", desc: "Listen to a story and repeat 2 words." }
];

const hearingData = [
  { title: "Change Battery", desc: "Open battery door, replace with new one." },
  { title: "Clean HA", desc: "Use brush to clean mic & earmold daily." },
  { title: "Fix Whistling", desc: "Check fit, lower volume, reposition HA." }
];

const videosData = [
  { title: "Parent Training", link: "https://youtube.com" },
  { title: "AVT Basics", link: "https://youtube.com" },
  { title: "Communication Tips", link: "https://youtube.com" }
];

// Render data
function renderList(data, elementId) {
  const list = document.getElementById(elementId);
  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.title}</strong><br>${item.desc || ""} 
                    ${item.link ? `<br><a href="${item.link}" target="_blank">Watch</a>` : ""}`;
    list.appendChild(li);
  });
}

renderList(speechData, "speechList");
renderList(hearingData, "hearingList");
renderList(videosData, "videoList");

// Progress form
document.getElementById("progressForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = e.target[0].value;
  const date = e.target[1].value;
  const activity = e.target[2].value;
  const li = document.createElement("li");
  li.textContent = `${date} - ${name}: ${activity}`;
  document.getElementById("progressList").appendChild(li);
  e.target.reset();
});

// Appointment form
document.getElementById("appointmentForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = e.target[0].value;
  const phone = e.target[1].value;
  const date = e.target[2].value;
  const notes = e.target[3].value;
  const li = document.createElement("li");
  li.textContent = `${date} - ${name} (${phone}) | ${notes}`;
  document.getElementById("appointmentList").appendChild(li);
  e.target.reset();
});

// PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
