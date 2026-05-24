const SearchApiClient = (() => {
  const settingsKey = "searchEngineApiSettings";
  const defaultSettings = {
    provider: "openai-compatible",
    endpoint: "",
    apiKey: "",
    model: "gpt-4o-mini",
    enabled: false
  };

  function getSettings() {
    const fromConfig = window.SEARCH_ENGINE_CONFIG || {};
    const saved = JSON.parse(localStorage.getItem(settingsKey) || "{}");
    return {
      ...defaultSettings,
      ...fromConfig,
      ...saved
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(
      settingsKey,
      JSON.stringify({
        ...getSettings(),
        ...settings,
        apiKey: settings.apiKey || ""
      })
    );
  }

  function hasApiKey() {
    const settings = getSettings();
    return Boolean(settings.enabled && settings.apiKey && settings.endpoint);
  }

  async function generateAnswer(query, matches = []) {
    const settings = getSettings();
    if (!hasApiKey()) {
      return {
        source: "local-ml",
        text: "",
        error: "API key or endpoint is not configured."
      };
    }

    const context = matches
      .slice(0, 3)
      .map((entry) => `${entry.title}: ${entry.summary}`)
      .join("\n");

    const response = await fetch(settings.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: "system",
            content: "You are a helpful search assistant. Answer briefly using the provided project knowledge when relevant."
          },
          {
            role: "user",
            content: `Question: ${query}\n\nProject knowledge:\n${context || "No matching local context."}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      source: "api",
      text: data.choices?.[0]?.message?.content || data.answer || "",
      raw: data
    };
  }

  return {
    getSettings,
    saveSettings,
    hasApiKey,
    generateAnswer
  };
})();

window.SearchApiClient = SearchApiClient;
