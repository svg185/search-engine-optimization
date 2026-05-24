const defaultAdminUser = {
  userId: "KARTIKKUMAR",
  password: "2492597",
  locked: true
};

if (sessionStorage.getItem("searchEngineAdminSession") !== "true") {
  window.location.href = "admin.html";
}

let customKnowledge = [];
let adminUsers = getAdminUsers();

const tabs = document.querySelectorAll(".dashboard-tab");
const panels = document.querySelectorAll(".dashboard-panel");
const adminLogout = document.querySelector("#adminLogout");
const contentCount = document.querySelector("#contentCount");
const userCount = document.querySelector("#userCount");
const historyCount = document.querySelector("#historyCount");
const dataForm = document.querySelector("#dataForm");
const dataTitle = document.querySelector("#dataTitle");
const dataCategory = document.querySelector("#dataCategory");
const dataKeywords = document.querySelector("#dataKeywords");
const dataImage = document.querySelector("#dataImage");
const dataSummary = document.querySelector("#dataSummary");
const dataAnswer = document.querySelector("#dataAnswer");
const dataPoints = document.querySelector("#dataPoints");
const dataMessage = document.querySelector("#dataMessage");
const removeContentList = document.querySelector("#removeContentList");
const userForm = document.querySelector("#userForm");
const newUserId = document.querySelector("#newUserId");
const newUserPassword = document.querySelector("#newUserPassword");
const userMessage = document.querySelector("#userMessage");
const userList = document.querySelector("#userList");
const historyList = document.querySelector("#historyList");
const databaseList = document.querySelector("#databaseList");
const apiSettingsForm = document.querySelector("#apiSettingsForm");
const apiEndpoint = document.querySelector("#apiEndpoint");
const apiModel = document.querySelector("#apiModel");
const apiKey = document.querySelector("#apiKey");
const apiEnabled = document.querySelector("#apiEnabled");
const apiMessage = document.querySelector("#apiMessage");

function getAdminUsers() {
  const savedUsers = JSON.parse(localStorage.getItem("searchEngineAdminUsers") || "[]");
  const mergedUsers = [defaultAdminUser, ...savedUsers.filter((user) => user.userId !== defaultAdminUser.userId)];
  localStorage.setItem("searchEngineAdminUsers", JSON.stringify(mergedUsers));
  return mergedUsers;
}

function saveAdminUsers() {
  localStorage.setItem("searchEngineAdminUsers", JSON.stringify(adminUsers));
  renderUsers();
  updateStats();
}

function getSearchHistory() {
  return JSON.parse(localStorage.getItem("searchEngineSearchHistory") || "[]");
}

function updateStats() {
  contentCount.textContent = `${customKnowledge.length} content ${customKnowledge.length === 1 ? "record" : "records"}`;
  userCount.textContent = `${adminUsers.length} admin ${adminUsers.length === 1 ? "user" : "users"}`;
  historyCount.textContent = `${getSearchHistory().length} searches`;
}

function showPanel(panelId) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.panel === panelId));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === panelId));

  if (panelId === "historyPanel") renderSearchHistory();
  if (panelId === "databasePanel") renderDatabase();
  if (panelId === "apiSettingsPanel") renderApiSettings();
}

function renderApiSettings() {
  if (!window.SearchApiClient) return;
  const settings = SearchApiClient.getSettings();
  apiEndpoint.value = settings.endpoint || "";
  apiModel.value = settings.model || "";
  apiKey.value = settings.apiKey || "";
  apiEnabled.checked = Boolean(settings.enabled);
}

function createRecordDetail(entry) {
  const item = document.createElement("article");
  item.className = "admin-list-item";
  item.innerHTML = `
    <div class="record-detail">
      <strong></strong>
      <dl>
        <div><dt>ID</dt><dd class="record-id"></dd></div>
        <div><dt>Category</dt><dd class="record-category"></dd></div>
        <div><dt>Keywords</dt><dd class="record-keywords"></dd></div>
        <div><dt>Image</dt><dd class="record-image"></dd></div>
        <div><dt>Summary</dt><dd class="record-summary"></dd></div>
        <div><dt>Answer</dt><dd class="record-answer"></dd></div>
        <div><dt>Key Points</dt><dd class="record-points"></dd></div>
        <div><dt>Created At</dt><dd class="record-created"></dd></div>
        <div><dt>Updated At</dt><dd class="record-updated"></dd></div>
      </dl>
    </div>
  `;
  item.querySelector("strong").textContent = entry.title;
  item.querySelector(".record-id").textContent = entry.id;
  item.querySelector(".record-category").textContent = entry.category;
  item.querySelector(".record-keywords").textContent = entry.keywords.join(", ");
  item.querySelector(".record-image").textContent = entry.imageUrl || "Automatic related image";
  item.querySelector(".record-summary").textContent = entry.summary;
  item.querySelector(".record-answer").textContent = entry.answer;
  item.querySelector(".record-points").textContent = entry.points.join(" | ");
  item.querySelector(".record-created").textContent = entry.createdAt;
  item.querySelector(".record-updated").textContent = entry.updatedAt;
  return item;
}

async function loadCustomKnowledge() {
  await SearchEngineDB.syncFromMirror();
  customKnowledge = await SearchEngineDB.getAll();
  renderContentRemoval();
  renderDatabase();
  updateStats();
}

function renderContentRemoval() {
  removeContentList.innerHTML = "";

  if (!customKnowledge.length) {
    removeContentList.innerHTML = `<p class="muted">No custom content available.</p>`;
    return;
  }

  customKnowledge.forEach((entry) => {
    const item = createRecordDetail(entry);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Delete Content";
    button.addEventListener("click", async () => {
      await SearchEngineDB.remove(entry.id);
      customKnowledge = await SearchEngineDB.getAll();
      renderContentRemoval();
      renderDatabase();
      updateStats();
    });
    item.append(button);
    removeContentList.append(item);
  });
}

function renderUsers() {
  userList.innerHTML = "";

  adminUsers.forEach((user) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="record-detail">
        <strong></strong>
        <dl>
          <div><dt>User ID</dt><dd class="user-id"></dd></div>
          <div><dt>Password</dt><dd class="user-password"></dd></div>
          <div><dt>Status</dt><dd class="user-status"></dd></div>
        </dl>
      </div>
    `;
    item.querySelector("strong").textContent = user.userId;
    item.querySelector(".user-id").textContent = user.userId;
    item.querySelector(".user-password").textContent = user.password;
    item.querySelector(".user-status").textContent = user.locked ? "Default user" : "Custom user";

    if (!user.locked) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Remove User";
      button.addEventListener("click", () => {
        adminUsers = adminUsers.filter((itemUser) => itemUser.userId !== user.userId);
        saveAdminUsers();
      });
      item.append(button);
    }

    userList.append(item);
  });
}

function renderSearchHistory() {
  const history = getSearchHistory();
  historyList.innerHTML = "";

  if (!history.length) {
    historyList.innerHTML = `<p class="muted">No search history available.</p>`;
    return;
  }

  history.forEach((record) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="record-detail">
        <strong></strong>
        <dl>
          <div><dt>Question</dt><dd class="history-query"></dd></div>
          <div><dt>Date Time</dt><dd class="history-date"></dd></div>
        </dl>
      </div>
    `;
    item.querySelector("strong").textContent = record.query;
    item.querySelector(".history-query").textContent = record.query;
    item.querySelector(".history-date").textContent = record.createdAt;
    historyList.append(item);
  });
}

function renderDatabase() {
  databaseList.innerHTML = "";

  if (!customKnowledge.length) {
    databaseList.innerHTML = `<p class="muted">Database has no custom content records yet.</p>`;
    return;
  }

  customKnowledge.forEach((entry) => {
    databaseList.append(createRecordDetail(entry));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showPanel(tab.dataset.panel));
});

adminLogout.addEventListener("click", () => {
  sessionStorage.removeItem("searchEngineAdminSession");
  window.location.href = "admin.html";
});

dataForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newEntry = {
    title: dataTitle.value.trim(),
    category: dataCategory.value.trim(),
    keywords: dataKeywords.value.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    imageUrl: dataImage.value.trim(),
    summary: dataSummary.value.trim(),
    answer: dataAnswer.value.trim(),
    points: dataPoints.value.split("\n").map((point) => point.trim()).filter(Boolean)
  };

  if (!newEntry.title || !newEntry.category || !newEntry.keywords.length || !newEntry.summary || !newEntry.answer || !newEntry.points.length) {
    dataMessage.textContent = "Please fill all fields correctly.";
    return;
  }

  await SearchEngineDB.add(newEntry);
  customKnowledge = await SearchEngineDB.getAll();
  renderContentRemoval();
  renderDatabase();
  updateStats();
  dataForm.reset();
  dataTitle.focus();
  dataMessage.textContent = "New content added to database.";
});

userForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userId = newUserId.value.trim().toUpperCase();
  const password = newUserPassword.value.trim();

  if (!userId || !password) {
    userMessage.textContent = "Please enter user ID and password.";
    return;
  }

  if (adminUsers.some((user) => user.userId === userId)) {
    userMessage.textContent = "This user already exists.";
    return;
  }

  adminUsers.push({ userId, password, locked: false });
  saveAdminUsers();
  userForm.reset();
  userMessage.textContent = "New admin user added.";
});

apiSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  SearchApiClient.saveSettings({
    endpoint: apiEndpoint.value.trim(),
    model: apiModel.value.trim() || "gpt-4o-mini",
    apiKey: apiKey.value.trim(),
    enabled: apiEnabled.checked
  });

  apiMessage.textContent = apiEnabled.checked
    ? "API settings saved. Search page will try API answers first."
    : "API settings saved. Local ML fallback mode is active.";
});

loadCustomKnowledge();
renderUsers();
renderSearchHistory();
renderApiSettings();
dataTitle.focus();
