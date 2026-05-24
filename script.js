const defaultKnowledgeBase = [
  {
    title: "Cyber Security",
    category: "Security",
    keywords: ["cyber", "security", "privacy", "password", "phishing", "hacking"],
    summary: "Cyber security means protecting computers, networks, apps, and data from unauthorized access or damage.",
    answer:
      "Cyber security is the practice of keeping digital systems safe. It protects users from attacks like phishing, weak passwords, malware, data theft, and unauthorized access.",
    points: [
      "Use strong passwords and two-factor authentication.",
      "Do not click unknown links or download suspicious files.",
      "Keep software updated and back up important data."
    ]
  },
  {
    title: "Question Answering System",
    category: "AI",
    keywords: ["search", "answer", "question", "ai", "knowledge", "response"],
    summary: "A question answering system receives a user query, searches stored knowledge, and returns a helpful answer.",
    answer:
      "To build a question answering system, create an input box, store useful knowledge, match the user's question with relevant topics, and display the answer clearly.",
    points: [
      "Start with a clean search interface and result history.",
      "Use keyword matching for a simple offline answer system.",
      "Use an AI API later if you want live, open-ended answers."
    ]
  },
  {
    title: "Python Programming",
    category: "Programming",
    keywords: ["python", "programming", "code", "pandas", "data", "csv"],
    summary: "Python is a beginner-friendly programming language used for web apps, automation, data analysis, and AI.",
    answer:
      "Python is popular because its syntax is simple and readable. Students use it for automation, data analysis, machine learning, backend development, and scripting.",
    points: [
      "Learn variables, loops, functions, lists, and dictionaries first.",
      "For data analysis, learn pandas and matplotlib.",
      "For web projects, learn Flask, Django, or FastAPI."
    ]
  },
  {
    title: "Web Design",
    category: "Design",
    keywords: ["web", "website", "design", "ui", "ux", "css", "responsive"],
    summary: "Web design focuses on layout, colors, typography, spacing, navigation, and responsive user experience.",
    answer:
      "Good web design makes a website clear, fast, and easy to use. It combines visual design with usability so users can complete tasks without confusion.",
    points: [
      "Use consistent spacing, readable text, and strong contrast.",
      "Make the layout responsive for mobile and desktop.",
      "Keep important actions easy to find."
    ]
  },
  {
    title: "Database",
    category: "Programming",
    keywords: ["database", "sql", "mysql", "table", "normalization", "schema"],
    summary: "A database stores organized data in tables so an application can save, search, update, and delete information.",
    answer:
      "A database is used to store information in an organized way. In web projects, it can store users, products, messages, orders, and search records.",
    points: [
      "SQL databases use tables, rows, columns, and relationships.",
      "Primary keys uniquely identify records.",
      "Normalization reduces duplicate and inconsistent data."
    ]
  },
  {
    title: "Machine Learning",
    category: "AI",
    keywords: ["machine", "learning", "model", "training", "dataset", "prediction"],
    summary: "Machine learning teaches computers to find patterns in data and make predictions or decisions.",
    answer:
      "Machine learning is a branch of AI where models learn from data. After training, the model can predict outcomes, classify information, or identify patterns.",
    points: [
      "Collect clean and relevant data.",
      "Train a model and test it on unseen data.",
      "Measure accuracy, errors, and real-world usefulness."
    ]
  },
  {
    title: "Cloud Hosting",
    category: "Cloud",
    keywords: ["cloud", "hosting", "server", "deployment", "api", "website"],
    summary: "Cloud hosting lets you publish websites and apps on internet servers without managing physical hardware.",
    answer:
      "Cloud hosting is used to deploy apps online. Instead of running only on your computer, the project runs on a server so users can access it from anywhere.",
    points: [
      "Static sites can be hosted on Netlify, Vercel, or GitHub Pages.",
      "Backend apps usually need a server or serverless platform.",
      "Databases and files should be secured before deployment."
    ]
  },
  {
    title: "Project Presentation",
    category: "Productivity",
    keywords: ["project", "presentation", "ppt", "college", "report", "explain"],
    summary: "A project presentation explains the problem, objective, features, technology, implementation, and result.",
    answer:
      "A strong project presentation should clearly explain what problem you solved, how your system works, which technology you used, and what result the user gets.",
    points: [
      "Start with the problem statement and objective.",
      "Show screenshots or a live demo of the main features.",
      "End with benefits, limitations, and future scope."
    ]
  }
];

let customKnowledge = JSON.parse(localStorage.getItem("searchEngineCustomData") || "[]");
let knowledgeBase = [...defaultKnowledgeBase, ...customKnowledge];
let modes = getModes();

const starterQuestions = [
  "What is cyber security?",
  "How to build a question answering system?",
  "What is machine learning?",
  "How to make a good website?",
  "How to present my project?"
];

const state = {
  mode: "All",
  latestQuestion: "",
  recent: JSON.parse(localStorage.getItem("searchEngineRecent") || "[]")
};

const modeFilters = document.querySelector("#modeFilters");
const recentQuestions = document.querySelector("#recentQuestions");
const promptSuggestions = document.querySelector("#promptSuggestions");
const chatWindow = document.querySelector("#chatWindow");
const chatForm = document.querySelector("#chatForm");
const questionInput = document.querySelector("#questionInput");
const resourcesGrid = document.querySelector("#resourcesGrid");
const resourceCount = document.querySelector("#resourceCount");
const activeQuestion = document.querySelector("#activeQuestion");
const webResults = document.querySelector("#webResults");
const webResultHeading = document.querySelector("#webResultHeading");
const webResultMeta = document.querySelector("#webResultMeta");
const openGoogleLink = document.querySelector("#openGoogleLink");
const messageTemplate = document.querySelector("#messageTemplate");
const resourceTemplate = document.querySelector("#resourceTemplate");
const themeToggle = document.querySelector("#themeToggle");
const luckyButton = document.querySelector("#luckyButton");

function normalize(value) {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").trim();
}

function getRelatedImage(entry = {}) {
  if (entry.imageUrl) return entry.imageUrl;

  const terms = [entry.title, entry.category, ...(entry.keywords || [])]
    .filter(Boolean)
    .join(",");

  return `https://source.unsplash.com/640x360/?${encodeURIComponent(terms || "technology education")}`;
}

function getModes() {
  return ["All", ...new Set(knowledgeBase.map((entry) => entry.category))];
}

function refreshKnowledgeBase() {
  customKnowledge = JSON.parse(localStorage.getItem("searchEngineCustomData") || "[]");
  knowledgeBase = [...defaultKnowledgeBase, ...customKnowledge];
  modes = getModes();
}

async function loadDatabaseRecords() {
  if (!window.SearchEngineDB) return;

  await SearchEngineDB.syncFromMirror();
  customKnowledge = await SearchEngineDB.getAll();
  knowledgeBase = [...defaultKnowledgeBase, ...customKnowledge];
  modes = getModes();
}

function scoreEntry(entry, question) {
  if (window.MLSearchEngine) {
    return MLSearchEngine.score(entry, question);
  }

  const terms = normalize(question).split(/\s+/).filter(Boolean);
  const haystack = normalize(`${entry.title} ${entry.category} ${entry.summary} ${entry.keywords.join(" ")}`);

  return terms.reduce((score, term) => {
    if (normalize(entry.title).includes(term)) return score + 8;
    if (entry.keywords.some((keyword) => normalize(keyword).includes(term))) return score + 5;
    if (haystack.includes(term)) return score + 2;
    return score;
  }, 0);
}

function findMatches(question) {
  if (window.MLSearchEngine) {
    return MLSearchEngine.rank(knowledgeBase, question, state.mode).slice(0, 4);
  }

  return knowledgeBase
    .filter((entry) => state.mode === "All" || entry.category === state.mode)
    .map((entry) => ({ ...entry, score: scoreEntry(entry, question) }))
    .filter((entry) => !question || entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function getPlatformResults(query, matches = []) {
  const encodedQuery = encodeURIComponent(query);
  const bestMatch = matches[0];
  const platformResults = [
    {
      platform: "Google",
      title: `${query} - Google Search`,
      url: `https://www.google.com/search?q=${encodedQuery}`,
      displayUrl: `google.com/search?q=${query}`,
      snippet: "Open the full Google results page for current web pages, news, videos, images, and related searches."
    },
    {
      platform: "Bing",
      title: `${query} - Bing Search`,
      url: `https://www.bing.com/search?q=${encodedQuery}`,
      displayUrl: `bing.com/search?q=${query}`,
      snippet: "See online results from Bing with web pages, quick answers, images, and related topics."
    },
    {
      platform: "DuckDuckGo",
      title: `${query} - DuckDuckGo`,
      url: `https://duckduckgo.com/?q=${encodedQuery}`,
      displayUrl: `duckduckgo.com/?q=${query}`,
      snippet: "Search the web through DuckDuckGo for privacy-focused results and instant answers."
    },
    {
      platform: "Wikipedia",
      title: `${query} - Wikipedia Search`,
      url: `https://en.wikipedia.org/w/index.php?search=${encodedQuery}`,
      displayUrl: `wikipedia.org/search/${query}`,
      snippet: "Find encyclopedia-style background, definitions, history, and references related to this search."
    },
    {
      platform: "YouTube",
      title: `${query} - YouTube Search`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
      displayUrl: `youtube.com/results?search_query=${query}`,
      snippet: "Explore videos, tutorials, lectures, demos, and explainers for this topic."
    }
  ];

  if (bestMatch) {
    platformResults.unshift({
      platform: "Project Knowledge",
      title: bestMatch.title,
      url: `https://www.google.com/search?q=${encodeURIComponent(`${query} ${bestMatch.title}`)}`,
      displayUrl: `local.project/result/${bestMatch.category.toLowerCase()}`,
      snippet: bestMatch.summary
    });
  }

  return platformResults;
}

async function createAnswer(question) {
  const matches = findMatches(question);
  const best = matches[0];

  if (!question.trim()) {
    return {
      text: "Please type a question first. I can answer about programming, AI, web design, security, cloud, databases, and project presentation.",
      points: [],
      matches: [],
      topic: "Search Guidance",
      category: "General",
      confidence: 0,
      source: "Guidance"
    };
  }

  if (!best) {
    return {
      text:
        "I do not have an exact answer in my ML-ranked local knowledge base yet. Add more records from the admin dashboard or enable API answers from API / ML Settings.",
      points: [
        "The query was processed through the machine-learning ranking module.",
        "No local record crossed the matching threshold.",
        "API answers can be enabled from the admin settings panel."
      ],
      matches: [],
      topic: "No Exact Match",
      category: "General",
      confidence: 0,
      source: "ML Fallback"
    };
  }

  let apiText = "";
  let source = "ML Ranked Knowledge Base";

  if (window.SearchApiClient?.hasApiKey()) {
    try {
      const apiAnswer = await SearchApiClient.generateAnswer(question, matches);
      apiText = apiAnswer.text;
      source = apiAnswer.source === "api" ? "API + ML Context" : source;
    } catch (error) {
      source = "ML Fallback";
    }
  }

  return {
    text: apiText || best.answer,
    points: best.points,
    matches,
    topic: best.title,
    category: best.category,
    confidence: Math.min(98, 62 + best.score),
    source,
    model: best.model || "Keyword Matching"
  };
}

function appendMessage(sender, text, points = [], meta = {}) {
  const node = messageTemplate.content.cloneNode(true);
  const message = node.querySelector(".message");
  const avatar = node.querySelector(".avatar");
  const name = node.querySelector(".message-name");
  const body = node.querySelector(".message-text");

  message.classList.add(sender);
  avatar.textContent = sender === "user" ? "U" : "S";
  name.textContent = sender === "user" ? "You" : "Search Engine";

  if (sender === "system") {
    const answerCard = document.createElement("div");
    answerCard.className = "enhanced-answer";

    const header = document.createElement("div");
    header.className = "enhanced-answer-header";
    header.innerHTML = `
      <div>
        <span class="answer-label">Direct Answer</span>
        <h3>${meta.topic || "Search Result"}</h3>
      </div>
      <span class="confidence">${meta.confidence ? `${meta.confidence}% match` : "New query"}</span>
    `;

    const paragraph = document.createElement("p");
    paragraph.className = "answer-summary";
    paragraph.textContent = text;

    const visual = document.createElement("div");
    visual.className = "answer-visual";
    visual.innerHTML = `<img alt="" loading="lazy" />`;
    visual.querySelector("img").src = getRelatedImage(meta);

    answerCard.append(header, visual, paragraph);

    if (points.length) {
      const pointGrid = document.createElement("div");
      pointGrid.className = "point-grid";
      points.forEach((point, index) => {
        const item = document.createElement("div");
        item.className = "point-card";
        item.innerHTML = `<span>${index + 1}</span><p></p>`;
        item.querySelector("p").textContent = point;
        pointGrid.append(item);
      });
      answerCard.append(pointGrid);
    }

    const footer = document.createElement("div");
    footer.className = "answer-footer";
    footer.innerHTML = `
      <span>Category: ${meta.category || "General"}</span>
      <span>${meta.source || "Knowledge Base Result"}${meta.model ? ` | ${meta.model}` : ""}</span>
    `;
    answerCard.append(footer);
    body.append(answerCard);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    body.append(paragraph);

    if (points.length) {
      const list = document.createElement("ul");
      points.forEach((point) => {
        const item = document.createElement("li");
        item.textContent = point;
        list.append(item);
      });
      body.append(list);
    }
  }

  chatWindow.append(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function askQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;

  state.latestQuestion = cleanQuestion;
  state.recent = [cleanQuestion, ...state.recent.filter((item) => item !== cleanQuestion)].slice(0, 6);
  localStorage.setItem("searchEngineRecent", JSON.stringify(state.recent));
  saveSearchHistory(cleanQuestion);

  appendMessage("user", cleanQuestion);
  questionInput.value = "";
  questionInput.style.height = "auto";

  setTimeout(async () => {
    const answer = await createAnswer(cleanQuestion);
    appendMessage("system", answer.text, answer.points, answer);
    renderWebResults(cleanQuestion, answer.matches);
    renderResources(answer.matches);
    renderRecent();
    activeQuestion.textContent = `For: "${cleanQuestion}"`;
  }, 220);
}

function saveSearchHistory(query) {
  const history = JSON.parse(localStorage.getItem("searchEngineSearchHistory") || "[]");
  history.unshift({
    query,
    createdAt: new Date().toLocaleString("en-IN")
  });
  localStorage.setItem("searchEngineSearchHistory", JSON.stringify(history.slice(0, 100)));
}

function renderModes() {
  modes = getModes();
  modeFilters.innerHTML = "";
  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${state.mode === mode ? "active" : ""}`;
    button.textContent = mode;
    button.addEventListener("click", async () => {
      state.mode = mode;
      renderModes();
      if (state.latestQuestion) {
        const answer = await createAnswer(state.latestQuestion);
        renderWebResults(state.latestQuestion, answer.matches);
        renderResources(answer.matches);
      }
    });
    modeFilters.append(button);
  });
}

function renderRecent() {
  recentQuestions.innerHTML = "";
  if (!state.recent.length) {
    const empty = document.createElement("span");
    empty.className = "muted";
    empty.textContent = "No searches yet";
    recentQuestions.append(empty);
    return;
  }

  state.recent.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-button";
    button.textContent = question;
    button.addEventListener("click", () => askQuestion(question));
    recentQuestions.append(button);
  });
}

function renderSuggestions() {
  promptSuggestions.innerHTML = "";
  const customQuestions = customKnowledge.slice(-3).map((entry) => `What is ${entry.title}?`);
  const trendCounts = ["1.2M+ searches", "850K+ searches", "620K+ searches", "580K+ searches", "450K+ searches", "390K+ searches", "320K+ searches", "280K+ searches"];
  [...starterQuestions, ...customQuestions].slice(0, 8).forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `suggestion-button trend-card trend-${(index % 5) + 1}`;
    button.innerHTML = `
      <strong></strong>
      <span></span>
      <i aria-hidden="true"></i>
    `;
    button.querySelector("strong").textContent = question.replace(/^What is |[?]/g, "");
    button.querySelector("span").textContent = trendCounts[index] || "250K+ searches";
    button.addEventListener("click", () => askQuestion(question));
    promptSuggestions.append(button);
  });
}

function renderResources(matches = []) {
  resourcesGrid.innerHTML = "";
  resourceCount.textContent = `${matches.length} related ${matches.length === 1 ? "source" : "sources"}`;

  if (!matches.length) {
    resourcesGrid.innerHTML = `
      <div class="empty-state">
        <h2>No related source found</h2>
        <p class="muted">Ask about AI, programming, web design, cloud, security, database, or project presentation.</p>
      </div>
    `;
    return;
  }

  matches.forEach((entry) => {
    const node = resourceTemplate.content.cloneNode(true);
    const image = node.querySelector(".resource-image");
    image.src = getRelatedImage(entry);
    image.alt = `${entry.title} related image`;
    node.querySelector(".category-pill").textContent = entry.category;
    node.querySelector(".score").textContent = `${entry.score} match`;
    node.querySelector("h3").textContent = entry.title;
    node.querySelector("p").textContent = entry.summary;

    const tagRow = node.querySelector(".tag-row");
    entry.keywords.slice(0, 4).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      tagRow.append(span);
    });

    resourcesGrid.append(node);
  });
}

function renderWebResults(query = "", matches = []) {
  webResults.innerHTML = "";

  if (!query.trim()) {
    webResultHeading.textContent = "Search results";
    webResultMeta.textContent = "Type a query to see online platform links";
    openGoogleLink.href = "https://www.google.com";
    webResults.innerHTML = `
      <div class="empty-state">
        <h2>No search yet</h2>
        <p class="muted">Search anything to get Google-style links for online platforms.</p>
      </div>
    `;
    return;
  }

  const results = getPlatformResults(query, matches);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  webResultHeading.textContent = `Results for "${query}"`;
  webResultMeta.textContent = `About ${Math.max(1280, query.length * 421).toLocaleString("en-IN")} results from online platforms`;
  openGoogleLink.href = googleUrl;

  results.forEach((result) => {
    const article = document.createElement("article");
    article.className = "web-result";

    const platform = document.createElement("span");
    platform.className = "web-platform";
    platform.textContent = result.platform;

    const displayUrl = document.createElement("span");
    displayUrl.className = "web-url";
    displayUrl.textContent = result.displayUrl;

    const link = document.createElement("a");
    link.href = result.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = result.title;

    const snippet = document.createElement("p");
    snippet.textContent = result.snippet;

    const actions = document.createElement("div");
    actions.className = "web-actions";

    const openLink = document.createElement("a");
    openLink.href = result.url;
    openLink.target = "_blank";
    openLink.rel = "noopener";
    openLink.textContent = "Open result";

    actions.append(openLink);
    article.append(platform, displayUrl, link, snippet, actions);
    webResults.append(article);
  });
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  askQuestion(questionInput.value);
});

questionInput.addEventListener("input", () => {
  questionInput.style.height = "auto";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 140)}px`;
});

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askQuestion(questionInput.value);
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("searchEngineTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

luckyButton.addEventListener("click", () => {
  const question = starterQuestions[Math.floor(Math.random() * starterQuestions.length)];
  askQuestion(question);
});

async function initializeSearchEngine() {
  if (localStorage.getItem("searchEngineTheme") === "dark") {
    document.body.classList.add("dark");
  }

  await loadDatabaseRecords();
  renderModes();
  renderRecent();
  renderSuggestions();
  renderWebResults();
  renderResources();
  appendMessage(
    "system",
    "Hello! Search anything and I will show online platform links like Google, Bing, DuckDuckGo, Wikipedia, and YouTube. I will also show a short answer when the topic exists in the project knowledge base.",
    ["For live Google results, click any generated online result link."],
    { topic: "Welcome", category: "General", confidence: 0 }
  );
}

initializeSearchEngine();
