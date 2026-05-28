/**
 * BLOG DATA FILE — CodeWithAbdal
 *
 * HOW TO ADD A NEW BLOG POST:
 * 1. Copy one object below and paste it at the TOP of the array.
 * 2. Fill in: id, slug, title, date, tags, coverImage, excerpt, content.
 *    - slug must be lowercase-kebab-case (used in the URL: /?post=your-slug)
 *    - date format: "Month DD, YYYY"
 * 3. Save and push to GitHub — Vercel deploys automatically.
 *
 * CONTENT: Use HTML inside `content` for formatting.
 *   <h3>  <p>  <ul><li>  <strong>  <em>  <code>  <a href="">
 */

export const blogPosts = [
  {
    id: 3,
    slug: 'how-i-built-my-ai-portfolio-website',
    title: 'How I Built My AI Portfolio Website From Scratch',
    date: 'April 15, 2026',
    tags: ['Web Dev', 'Vite', 'Design'],
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    excerpt: 'A deep dive into how I designed and developed this portfolio site — from the 3D canvas background to the glassmorphism UI and contact form integration.',
    content: `
      <p>Building a portfolio from scratch is one of the best ways to showcase your skills. In this post, I walk you through the full process of creating <strong>CodeWithAbdal</strong> — my personal AI-specialist portfolio.</p>

      <h3>The Tech Stack</h3>
      <p>I chose <strong>Vite</strong> as the build tool for its blazing-fast HMR. For the visual layer, I went with:</p>
      <ul>
        <li><strong>Three.js</strong> for the 3D neural-gravity background</li>
        <li><strong>GSAP</strong> for smooth entrance animations</li>
        <li><strong>FormSubmit.co</strong> for the contact form email delivery</li>
        <li>Pure <strong>Vanilla CSS</strong> with glassmorphism effects</li>
      </ul>

      <h3>Design Philosophy</h3>
      <p>The goal was a dark, obsidian aesthetic with neon-lime accents. Every element needed to feel premium and intentional.</p>

      <h3>Key Challenges</h3>
      <p>The biggest challenge was wiring up the SPA navigation without a framework. I ended up using a simple <code>showSection()</code> pattern combined with GSAP animation transitions, which works beautifully.</p>

      <p>If you are curious about the code, check out my <a href="https://github.com/Abdal-AI" target="_blank" rel="noopener noreferrer">GitHub profile</a>.</p>
    `
  },
  {
    id: 2,
    slug: 'getting-started-with-machine-learning',
    title: 'Getting Started with Machine Learning — A Practical Guide',
    date: 'April 12, 2026',
    tags: ['Machine Learning', 'Python', 'Beginner'],
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Machine Learning can feel overwhelming at first. In this guide, I break down the core concepts you need to know and show you exactly where to start your ML journey in 2026.',
    content: `
      <p>Machine Learning is not as hard as it looks — it just requires the right mental model and the right tools. Let me break it down for you.</p>

      <h3>Step 1: Master Python First</h3>
      <p>Before touching ML, make sure you are comfortable with:</p>
      <ul>
        <li>Lists, dictionaries, and loops</li>
        <li>Functions and classes (basic OOP)</li>
        <li>NumPy arrays (the backbone of ML in Python)</li>
        <li>Pandas DataFrames for data wrangling</li>
      </ul>

      <h3>Step 2: Learn the Core Algorithms</h3>
      <p>Start with these fundamental algorithms before jumping to deep learning:</p>
      <ul>
        <li><strong>Linear Regression</strong> — predicting continuous values</li>
        <li><strong>Logistic Regression</strong> — binary classification</li>
        <li><strong>Decision Trees</strong> — explainable rule-based models</li>
        <li><strong>K-Nearest Neighbors</strong> — intuitive similarity-based model</li>
      </ul>

      <h3>Step 3: Use Scikit-Learn</h3>
      <p>Scikit-Learn is the standard Python ML library. Its consistent API makes it incredibly beginner-friendly:</p>
      <code>from sklearn.linear_model import LinearRegression<br>
model = LinearRegression()<br>
model.fit(X_train, y_train)<br>
predictions = model.predict(X_test)</code>

      <p>Follow this pathway and you will be building real models within weeks. Good luck!</p>
    `
  },
  {
    id: 1,
    slug: 'data-visualization-most-underrated-skill',
    title: 'Why Data Visualization is the Most Underrated Skill in Data Science',
    date: 'April 8, 2026',
    tags: ['Data Science', 'Visualization', 'Seaborn'],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Everyone talks about model accuracy — but the ability to communicate your findings through beautiful, clear charts is what separates good data scientists from great ones.',
    content: `
      <p>I have seen many data scientists who can train complex models but struggle to explain their findings to a non-technical stakeholder. That is where <strong>data visualization</strong> becomes a superpower.</p>

      <h3>Why It Matters</h3>
      <p>A single chart that tells a clear story is worth more than 10 pages of statistics. Visualization helps you:</p>
      <ul>
        <li>Spot anomalies and outliers instantly</li>
        <li>Communicate trends to decision-makers</li>
        <li>Validate your data before training models</li>
        <li>Build trust with stakeholders who don't read code</li>
      </ul>

      <h3>My Go-To Python Stack</h3>
      <p>I primarily use <strong>Matplotlib</strong> for full control and <strong>Seaborn</strong> for statistical plots. Here is a quick example:</p>
      <code>import seaborn as sns<br>
import matplotlib.pyplot as plt<br>
<br>
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')<br>
plt.title('Feature Correlation Matrix')<br>
plt.show()</code>

      <p>Start plotting everything. Even a simple bar chart of your dataset's value counts can reveal insights you would never find by looking at raw numbers.</p>

      <p>Check out my full <a href="https://github.com/Abdal-AI/SEABORN" target="_blank" rel="noopener noreferrer">Seaborn visualization repository</a> on GitHub for examples.</p>
    `
  }
];
