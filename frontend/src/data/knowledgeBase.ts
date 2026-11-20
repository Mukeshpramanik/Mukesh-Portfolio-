import portfolioContent from './portfolioContent.json';

export interface KnowledgeEntry {
  category: string;
  keywords: string[];
  patterns: (RegExp | string)[];
  response: string;
  suggestedQuestions?: string[];
}

export const mukeshKnowledgeBase: KnowledgeEntry[] = (
  portfolioContent.chatbotKnowledge || []
).map((entry) => ({
  ...entry,
  patterns: (entry.patterns || []).map((p: string | RegExp) =>
    typeof p === 'string' ? new RegExp(p, 'i') : p
  ),
}));

export function findAnswerInKnowledgeBase(
  question: string,
  customKnowledge?: any[]
): {
  answer: string;
  suggestions: string[];
} {
  const cleaned = question.trim().toLowerCase();

  const kbToSearch = customKnowledge && customKnowledge.length > 0
    ? customKnowledge.map((entry) => ({
        ...entry,
        patterns: (entry.patterns || []).map((p: string | RegExp) =>
          typeof p === 'string' ? new RegExp(p, 'i') : p
        ),
      }))
    : mukeshKnowledgeBase;

  if (!cleaned) {
    return {
      answer:
        "Hi there! I'm Mukesh's interactive AI assistant. Ask me anything about Mukesh's projects, technical skills, education, or internship availability!",
      suggestions: [
        'What are your top technical skills?',
        'Tell me about your featured projects',
        'Are you available for internships?',
      ],
    };
  }

  // 1. Direct regex pattern matches (highest precedence)
  for (const entry of kbToSearch) {
    for (const pattern of entry.patterns) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
      if (regex.test(cleaned)) {
        return {
          answer: entry.response,
          suggestions: entry.suggestedQuestions || [
            'What are your skills?',
            'Tell me about your projects',
            'How can I contact you?',
          ],
        };
      }
    }
  }

  // 2. Multi-word phrase matching
  for (const entry of mukeshKnowledgeBase) {
    for (const kw of entry.keywords) {
      if (kw.includes(' ') && cleaned.includes(kw)) {
        return {
          answer: entry.response,
          suggestions: entry.suggestedQuestions || [
            'Tell me about your projects',
            'What are your technical skills?',
          ],
        };
      }
    }
  }

  // 3. Keyword score matching with word boundaries
  const words = cleaned.split(/[\s,?.!/\\-]+/).filter((w) => w.length > 1);
  let bestEntry: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of mukeshKnowledgeBase) {
    let score = 0;
    for (const word of words) {
      // Prioritize exact keyword matches
      if (entry.keywords.includes(word)) {
        score += 3;
      } else if (
        word.length >= 4 &&
        entry.keywords.some(
          (k) => k.length >= 4 && (k.includes(word) || word.includes(k))
        )
      ) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && highestScore >= 2) {
    return {
      answer: bestEntry.response,
      suggestions: bestEntry.suggestedQuestions || [
        'Tell me about your projects',
        'What are your technical skills?',
        'How can I get in touch?',
      ],
    };
  }

  // 4. Fallback answer using only verified information
  return {
    answer:
      "I don't have verified information on that specific question. However, I can share verified details about Mukesh's **B.Tech CSE education (2023–2027)**, his **Python, SQL, and Data Analytics skills**, his **5 portfolio projects**, or his **GitHub and resume**!",
    suggestions: [
      'Tell me about Mukesh Pramanik',
      'What are your top technical skills?',
      'Tell me about your featured projects',
      'What is your GitHub profile?',
    ],
  };
}
