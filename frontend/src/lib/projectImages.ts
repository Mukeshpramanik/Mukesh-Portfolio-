/**
 * Intelligent Automatic Project Image Assignment System
 * Provides category, keyword, and deterministic matching across 13 bespoke local project visuals.
 * Fully static, zero external dependencies, 100% ₹0 budget.
 */

export interface ProjectImagePreset {
  id: string;
  name: string;
  category: string;
  path: string;
  description: string;
}

export const PROJECT_IMAGE_PRESETS: ProjectImagePreset[] = [
  {
    id: 'studexa',
    name: 'Student CRUD Management',
    category: 'Web Development',
    path: '/images/projects/studexa.svg',
    description: 'Student database CRUD interface, SQLite transactional status, KPI metrics',
  },
  {
    id: 'web-dev-default',
    name: 'Full-Stack Web Application',
    category: 'Web Development',
    path: '/images/projects/web-development-default.svg',
    description: 'Responsive viewport toggles, component hierarchy, REST API inspector',
  },
  {
    id: 'ecommerce',
    name: 'Digital Commerce & Store',
    category: 'Web Development',
    path: '/images/projects/ecommerce-platform.svg',
    description: 'Product catalog cards, checkout conversion funnel, inventory tracking',
  },
  {
    id: 'database',
    name: 'Relational Database Engine',
    category: 'Database Management',
    path: '/images/projects/database-system.svg',
    description: 'Entity relationship schemas, index scans, query execution plan',
  },
  {
    id: 'ai-ml-default',
    name: 'Neural Network Deep Engine',
    category: 'AI/ML',
    path: '/images/projects/ai-ml-default.svg',
    description: 'Multi-layer topology, loss convergence curves, precision parameters',
  },
  {
    id: 'heart-disease',
    name: 'Healthcare ML Prediction',
    category: 'AI/ML',
    path: '/images/projects/heart-disease-prediction.svg',
    description: 'ECG waveform, clinical parameters, ROC-AUC curve, risk gauge',
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision Perception',
    category: 'AI/ML',
    path: '/images/projects/computer-vision.svg',
    description: 'Viewfinder bounding boxes, real-time FPS, Conv2D feature heatmap',
  },
  {
    id: 'nlp-text',
    name: 'NLP & Language Transformer',
    category: 'AI/ML',
    path: '/images/projects/nlp-text-analysis.svg',
    description: 'Subword tokenization, attention affinity, sentiment polarity, embeddings',
  },
  {
    id: 'data-vis',
    name: 'Interactive Analytics Dashboard',
    category: 'Data Analysis',
    path: '/images/projects/data-visualization.svg',
    description: 'Time-series area charts, category volume bars, distribution donut',
  },
  {
    id: 'data-analytics',
    name: 'Executive BI Analytics Hub',
    category: 'Data Analysis',
    path: '/images/projects/data-analytics-default.svg',
    description: 'Annual revenue vs target benchmarks, customer conversion funnel',
  },
  {
    id: 'eda',
    name: 'Statistical EDA & Heatmap Lab',
    category: 'Data Analysis',
    path: '/images/projects/exploratory-data-analysis.svg',
    description: 'Pearson correlation heatmap, Gaussian KDE distribution, boxplot quartiles',
  },
  {
    id: 'web-scraping',
    name: 'Web Scraping & ETL Pipeline',
    category: 'Automation',
    path: '/images/projects/web-scraping.svg',
    description: 'Terminal CLI log stream, crawler flowchart, extracted data table',
  },
  {
    id: 'automation-default',
    name: 'Task Orchestrator & DAG Cron',
    category: 'Automation',
    path: '/images/projects/automation-default.svg',
    description: 'DAG workflow graph, background worker clusters, scheduled cron stream',
  },
];

/**
 * Category-specific image pools for diverse rotation when multiple projects
 * share the same category without matching specific domain keywords.
 */
const CATEGORY_POOLS: Record<string, string[]> = {
  'Web Development': [
    '/images/projects/web-development-default.svg',
    '/images/projects/ecommerce-platform.svg',
    '/images/projects/database-system.svg',
    '/images/projects/studexa.svg',
  ],
  'AI/ML': [
    '/images/projects/ai-ml-default.svg',
    '/images/projects/heart-disease-prediction.svg',
    '/images/projects/computer-vision.svg',
    '/images/projects/nlp-text-analysis.svg',
  ],
  'Data Analysis': [
    '/images/projects/data-analytics-default.svg',
    '/images/projects/data-visualization.svg',
    '/images/projects/exploratory-data-analysis.svg',
  ],
  'Automation': [
    '/images/projects/automation-default.svg',
    '/images/projects/web-scraping.svg',
    '/images/projects/database-system.svg',
  ],
  'Python Development': [
    '/images/projects/web-scraping.svg',
    '/images/projects/database-system.svg',
    '/images/projects/ai-ml-default.svg',
    '/images/projects/data-analytics-default.svg',
  ],
  'Database Management': [
    '/images/projects/database-system.svg',
    '/images/projects/studexa.svg',
    '/images/projects/web-scraping.svg',
  ],
  'Other': [
    '/images/projects/web-development-default.svg',
    '/images/projects/data-visualization.svg',
    '/images/projects/ai-ml-default.svg',
    '/images/projects/automation-default.svg',
  ],
};

/**
 * Computes a deterministic positive integer hash from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Analyzes project metadata (title, category, description, technologies)
 * and returns the best matching project visual image.
 *
 * @param project The project object or form state
 * @param options.force If true, ignores current imageUrl and re-computes
 */
export function getAutoProjectImage(
  project: {
    title?: string;
    category?: string;
    description?: string;
    longDescription?: string;
    technologies?: string[] | string;
    imageUrl?: string;
    id?: string | number;
  },
  options: { force?: boolean } = {}
): string {
  // If an image already exists and we're not forcing re-computation, preserve it!
  if (!options.force && project.imageUrl && project.imageUrl.trim() !== '') {
    return project.imageUrl.trim();
  }

  const title = (project.title || '').toLowerCase();
  const desc = ((project.description || '') + ' ' + (project.longDescription || '')).toLowerCase();
  const cat = (project.category || 'Web Development').trim();
  const techStr = Array.isArray(project.technologies)
    ? project.technologies.join(' ').toLowerCase()
    : (project.technologies || '').toLowerCase();

  const combined = `${title} ${desc} ${techStr}`;

  // 1. Specific Keyword Matchers (highest fidelity)
  // Studexa / Student management
  if (
    combined.includes('studexa') ||
    combined.includes('student') ||
    combined.includes('school') ||
    combined.includes('college') ||
    combined.includes('academic')
  ) {
    return '/images/projects/studexa.svg';
  }

  // Heart / Healthcare / Clinical / Medical
  if (
    combined.includes('heart') ||
    combined.includes('cardio') ||
    combined.includes('disease') ||
    combined.includes('medical') ||
    combined.includes('patient') ||
    combined.includes('clinical') ||
    combined.includes('health')
  ) {
    return '/images/projects/heart-disease-prediction.svg';
  }

  // Computer Vision / Image / Detection / YOLO / OpenCV
  if (
    combined.includes('vision') ||
    combined.includes('detection') ||
    combined.includes('yolo') ||
    combined.includes('opencv') ||
    combined.includes('object') ||
    combined.includes('camera') ||
    combined.includes('face') ||
    combined.includes('cnn')
  ) {
    return '/images/projects/computer-vision.svg';
  }

  // Natural Language Processing / Text / Sentiment / LLM / Chatbot
  if (
    combined.includes('nlp') ||
    combined.includes('sentiment') ||
    combined.includes('language') ||
    combined.includes('text') ||
    combined.includes('bert') ||
    combined.includes('gpt') ||
    combined.includes('transformer') ||
    combined.includes('chatbot') ||
    combined.includes('token')
  ) {
    return '/images/projects/nlp-text-analysis.svg';
  }

  // Web Scraping / Crawler / Spider / Extraction / BeautifulSoup
  if (
    combined.includes('scrap') ||
    combined.includes('crawl') ||
    combined.includes('spider') ||
    combined.includes('extract') ||
    combined.includes('beautifulsoup') ||
    combined.includes('selenium')
  ) {
    return '/images/projects/web-scraping.svg';
  }

  // E-Commerce / Store / Retail / Shop / Checkout
  if (
    combined.includes('ecommerce') ||
    combined.includes('e-commerce') ||
    combined.includes('shop') ||
    combined.includes('store') ||
    combined.includes('cart') ||
    combined.includes('retail') ||
    combined.includes('stripe') ||
    combined.includes('merchant')
  ) {
    return '/images/projects/ecommerce-platform.svg';
  }

  // Database / SQL / Schema / Query Optimizer
  if (
    combined.includes('database') ||
    combined.includes('sql') ||
    combined.includes('postgres') ||
    combined.includes('sqlite') ||
    combined.includes('schema') ||
    combined.includes('relational') ||
    combined.includes('query')
  ) {
    return '/images/projects/database-system.svg';
  }

  // Exploratory Data Analysis / Heatmap / Correlation / Outlier
  if (
    combined.includes('eda') ||
    combined.includes('exploratory') ||
    combined.includes('correlation') ||
    combined.includes('heatmap') ||
    combined.includes('outlier') ||
    combined.includes('distribution')
  ) {
    return '/images/projects/exploratory-data-analysis.svg';
  }

  // Data Visualization / Dashboard / Charts / PowerBI
  if (
    combined.includes('visualization') ||
    combined.includes('dashboard') ||
    combined.includes('powerbi') ||
    combined.includes('power bi') ||
    combined.includes('chart') ||
    combined.includes('matplotlib') ||
    combined.includes('seaborn') ||
    combined.includes('plot')
  ) {
    return '/images/projects/data-visualization.svg';
  }

  // Machine Learning / Deep Learning / Neural Network
  if (
    combined.includes('neural') ||
    combined.includes('deep learning') ||
    combined.includes('scikit') ||
    combined.includes('classifier') ||
    combined.includes('classification') ||
    combined.includes('pytorch') ||
    combined.includes('tensorflow')
  ) {
    return '/images/projects/ai-ml-default.svg';
  }

  // Automation / Workflow / Bot / DAG / Pipeline
  if (
    combined.includes('automat') ||
    combined.includes('workflow') ||
    combined.includes('cron') ||
    combined.includes('worker') ||
    combined.includes('bot') ||
    combined.includes('pipeline') ||
    combined.includes('task')
  ) {
    return '/images/projects/automation-default.svg';
  }

  // Data Analytics / Business Intelligence / Excel
  if (
    combined.includes('analytic') ||
    combined.includes('business intelligence') ||
    combined.includes('bi') ||
    combined.includes('kpi') ||
    combined.includes('excel') ||
    combined.includes('metric')
  ) {
    return '/images/projects/data-analytics-default.svg';
  }

  // Web Application / Fullstack / SaaS / Portal / Frontend
  if (
    combined.includes('fullstack') ||
    combined.includes('full-stack') ||
    combined.includes('portal') ||
    combined.includes('saas') ||
    combined.includes('frontend') ||
    combined.includes('web app') ||
    combined.includes('webapp') ||
    combined.includes('website') ||
    combined.includes('react') ||
    combined.includes('next.js') ||
    combined.includes('nextjs') ||
    (cat === 'Web Development' && combined.includes('app'))
  ) {
    return '/images/projects/web-development-default.svg';
  }

  // 2. Category Pool Rotation with Deterministic Modulo Selection
  // Guarantees that multiple projects in the same category never share the same generic image!
  const pool = CATEGORY_POOLS[cat] || CATEGORY_POOLS['Other'];
  const hashKey = `${title}_${project.id || ''}_${cat}`;
  const index = hashString(hashKey) % pool.length;

  return pool[index];
}
