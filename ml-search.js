const MLSearchEngine = (() => {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "for",
    "how",
    "in",
    "is",
    "of",
    "on",
    "the",
    "to",
    "what",
    "why"
  ]);

  function normalizeText(value = "") {
    return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function tokenize(value = "") {
    return normalizeText(value)
      .split(" ")
      .filter((token) => token && !stopWords.has(token));
  }

  function termFrequency(tokens = []) {
    return tokens.reduce((vector, token) => {
      vector[token] = (vector[token] || 0) + 1;
      return vector;
    }, {});
  }

  function cosineSimilarity(leftVector, rightVector) {
    const terms = new Set([...Object.keys(leftVector), ...Object.keys(rightVector)]);
    let dot = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;

    terms.forEach((term) => {
      const leftValue = leftVector[term] || 0;
      const rightValue = rightVector[term] || 0;
      dot += leftValue * rightValue;
      leftMagnitude += leftValue * leftValue;
      rightMagnitude += rightValue * rightValue;
    });

    if (!leftMagnitude || !rightMagnitude) return 0;
    return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
  }

  function buildDocument(entry = {}) {
    return [
      entry.title,
      entry.category,
      entry.summary,
      entry.answer,
      ...(entry.keywords || []),
      ...(entry.points || [])
    ]
      .filter(Boolean)
      .join(" ");
  }

  function score(entry, query) {
    const queryTokens = tokenize(query);
    const documentTokens = tokenize(buildDocument(entry));
    const queryVector = termFrequency(queryTokens);
    const documentVector = termFrequency(documentTokens);
    const semanticScore = cosineSimilarity(queryVector, documentVector) * 100;
    const titleScore = tokenize(entry.title).some((token) => queryTokens.includes(token)) ? 18 : 0;
    const keywordScore = (entry.keywords || []).reduce((total, keyword) => {
      return queryTokens.includes(normalizeText(keyword)) ? total + 10 : total;
    }, 0);

    return Math.round(semanticScore + titleScore + keywordScore);
  }

  function rank(entries = [], query = "", mode = "All") {
    return entries
      .filter((entry) => mode === "All" || entry.category === mode)
      .map((entry) => ({
        ...entry,
        score: score(entry, query),
        model: "TF-IDF Cosine Similarity"
      }))
      .filter((entry) => !query || entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  return {
    rank,
    score,
    tokenize
  };
})();

window.MLSearchEngine = MLSearchEngine;
