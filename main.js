import { initThreeScene } from './three-scene.js';
import {
  fetchRemoteReviews,
  hasSupabaseConfig,
  insertRemoteReview,
  subscribeToRemoteReviews
} from './supabase.js';
import gsap from 'gsap';
import emailjs from '@emailjs/browser';

const defaultReviews = [
  {
    name: 'Ayesha',
    rating: 5,
    message: 'Very smooth communication and a clean delivery process. The final work felt polished and professional.'
  },
  {
    name: 'Hamza',
    rating: 5,
    message: 'Great support and strong technical skills. The project was handled with care and finished on time.'
  },
  {
    name: 'Client Review',
    rating: 4,
    message: 'Helpful, responsive, and easy to work with. I would happily come back for future web or data tasks.'
  }
];

// Initialize the 3D Neural Gravity Background & Cursor
initThreeScene();

// ── Global SPA Navigation ───────────────────────────────────────────────────
// Must be on window BEFORE any inline onclick="" fires
window.showSection = (sectionId) => {
  // Hide ALL sections by removing active and forcing display:none
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
    sec.style.display = 'none';
    sec.style.opacity = '0';
  });

  // Show the requested section
  const targetEl = document.getElementById(sectionId);
  if (!targetEl) return;

  targetEl.style.display = '';   // let CSS control (flex / block etc.)
  targetEl.classList.add('active');

  // Smooth entrance animation
  gsap.fromTo(
    targetEl,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
  );

  // Sync active state on navbar buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes(`'${sectionId}'`)) {
      btn.classList.add('active');
    }
  });

  const navLinks = document.querySelector('.nav-links');
  const navToggle = document.querySelector('.mobile-nav-toggle');
  if (navLinks && navToggle) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }
};

// ── DOM-ready logic ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Boot: show only hero
  document.querySelectorAll('.page-section').forEach(sec => {
    if (sec.id !== 'hero') {
      sec.style.display = 'none';
      sec.style.opacity = '0';
    }
  });

  // 2. Entrance animations
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.navbar',      { y: -50, opacity: 0, duration: 0.8 })
    .from('.subtitle',    { y: 20,  opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.main-title',  { y: 30,  opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.description', { y: 30,  opacity: 0, duration: 0.8 }, '-=0.6')
    .from('.hero-cta',    { y: 30,  opacity: 0, duration: 0.8 }, '-=0.6')
    .from('.profile-container', { scale: 0.8, opacity: 0, duration: 1, ease: 'elastic.out(1,0.5)' }, '-=1');

  // 3. Scroll-reveal for glass cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.fromTo(
          entry.target.querySelectorAll('.glass-card'),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)' }
        );
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cards-grid, .contact-container').forEach(el => observer.observe(el));

  await initReviews();
  initChatbot();
  initContactForm();
  initPaymentProof();
});

async function initReviews() {
  const reviewForm = document.querySelector('#review-form');
  const reviewsList = document.querySelector('#reviews-list');
  const reviewAverage = document.querySelector('#review-average');
  if (!reviewForm || !reviewsList || !reviewAverage) return;

  const initialReviews = await getReviews();
  renderReviews(initialReviews, reviewsList, reviewAverage);

  subscribeToRemoteReviews((remoteReviews) => {
    renderReviews(remoteReviews, reviewsList, reviewAverage);
  });

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.querySelector('#review-name')?.value.trim();
    const rating = Number(document.querySelector('#review-rating')?.value || 5);
    const message = document.querySelector('#review-message')?.value.trim();
    const submitBtn = reviewForm.querySelector('button[type="submit"]');

    if (!name || !message) return;

    const previousButtonText = submitBtn?.textContent || 'Submit Review';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving Review...';
    }

    const nextReviews = [
      {
        name,
        rating,
        message
      },
      ...(await getReviews())
    ];

    const savedRemotely = await insertRemoteReview({ name, rating, message });
    if (!savedRemotely) {
      localStorage.setItem('codewithabdal-reviews', JSON.stringify(nextReviews));
    }

    const refreshedReviews = savedRemotely ? await getReviews() : nextReviews;
    renderReviews(refreshedReviews, reviewsList, reviewAverage);
    reviewForm.reset();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = previousButtonText;
    }
  });
}

async function getReviews() {
  if (hasSupabaseConfig) {
    const remoteReviews = await fetchRemoteReviews();
    if (remoteReviews && remoteReviews.length) return remoteReviews;
  }

  return loadReviews();
}

function loadReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem('codewithabdal-reviews') || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  return defaultReviews;
}

function renderReviews(reviews, container, averageNode) {
  const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  averageNode.textContent = avg.toFixed(1);

  container.innerHTML = reviews
    .slice(0, 6)
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-card-head">
            <h4>${escapeHtml(review.name)}</h4>
            <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          </div>
          <p>${escapeHtml(review.message)}</p>
        </article>
      `
    )
    .join('');
}

function initChatbot() {
  const toggle = document.querySelector('#chatbot-toggle');
  const closeBtn = document.querySelector('#chatbot-close');
  const panel = document.querySelector('#chatbot-panel');
  const form = document.querySelector('#chatbot-form');
  const input = document.querySelector('#chatbot-input');
  const messages = document.querySelector('#chatbot-messages');

  if (!toggle || !closeBtn || !panel || !form || !input || !messages) return;

  let booted = false;

  const openChat = () => {
    panel.hidden = false;
    panel.classList.add('is-open');
    panel.style.display = 'flex';
    toggle.setAttribute('aria-expanded', 'true');
    if (!booted) {
      appendChatMessage(messages, 'bot', 'Hi, I am the CodeWithAbdal assistant. You can ask about services, WordPress Fiverr work, portfolio, or how to get in touch.');
      booted = true;
    }
    input.focus();
  };

  const closeChat = () => {
    panel.classList.remove('is-open');
    panel.style.display = 'none';
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    if (panel.hidden) {
      openChat();
      return;
    }
    closeChat();
  });

  closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeChat();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    appendChatMessage(messages, 'user', value);
    input.value = '';

    window.setTimeout(() => {
      appendChatMessage(messages, 'bot', getChatbotReply(value));
    }, 250);
  });
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  const inbox = document.querySelector('#contact-inbox');
  const status = document.querySelector('#contact-form-status');

  if (!form || !inbox || !status) return;

  const savedThreads = loadContactThreads();
  renderContactThreads(savedThreads, inbox);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.querySelector('#contact-name')?.value.trim();
    const email = document.querySelector('#contact-email')?.value.trim();
    const projectType = document.querySelector('#contact-project-type')?.value.trim();
    const message = document.querySelector('#contact-message')?.value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !projectType || !message) {
      status.textContent = 'Please complete all fields before sending.';
      status.classList.add('is-visible');
      return;
    }

    const prevBtnText = submitBtn ? submitBtn.textContent : 'Send Fast';
    if (submitBtn) submitBtn.textContent = 'Sending Engine...';

    // Send real email via EmailJS. Configure these in .env before deploying.
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const recipientEmail = import.meta.env.VITE_CONTACT_TO_EMAIL || 'muhammadabdal15140@gmail.com';

    const emailSentSuccessfully = await sendContactEmail({
      name,
      email,
      projectType,
      message,
      recipientEmail,
      serviceId,
      templateId,
      publicKey
    });

    if (submitBtn) submitBtn.textContent = prevBtnText;

    if (!emailSentSuccessfully) {
      status.textContent = 'Email could not be sent. Please email me directly at muhammadabdal15140@gmail.com.';
      status.classList.add('is-visible');
      return;
    }

    const userEntry = {
      role: 'user',
      name,
      email,
      message: `${projectType}: ${message}`,
      time: new Date().toLocaleString()
    };

    const replyEntry = {
      role: 'system',
      name: 'CodeWithAbdal',
      email: recipientEmail,
      message: `Thank you ${name}, I have received your message by email. I will review your requirements and respond back to ${email} soon.`,
      time: new Date().toLocaleString()
    };

    const nextThreads = [replyEntry, userEntry, ...loadContactThreads()].slice(0, 12);
    localStorage.setItem('codewithabdal-contact-inbox', JSON.stringify(nextThreads));
    renderContactThreads(nextThreads, inbox);

    status.textContent = 'Message sent successfully to my email.';
    status.classList.add('is-visible');
    form.reset();
  });
}

function hasEmailJsConfig(serviceId, templateId, publicKey) {
  return [serviceId, templateId, publicKey].every(
    (value) => value && !String(value).startsWith('your-')
  );
}

async function sendContactEmail({ name, email, projectType, message, recipientEmail, serviceId, templateId, publicKey }) {
  if (hasEmailJsConfig(serviceId, templateId, publicKey)) {
    try {
      emailjs.init({ publicKey });
      await emailjs.send(serviceId, templateId, {
        to_email: recipientEmail,
        from_name: name,
        from_email: email,
        user_name: name,
        user_email: email,
        project_type: projectType,
        message,
        reply_to: email
      });
      return true;
    } catch (error) {
      console.error('EmailJS failed:', error);
    }
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        project_type: projectType,
        message,
        _subject: `New ${projectType} inquiry from ${name}`,
        _template: 'table',
        _captcha: 'false'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('FormSubmit failed:', error);
    return false;
  }
}

function appendChatMessage(container, role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chatbot-bubble ${role}`;
  if (role === 'bot') {
    bubble.innerHTML = text;
  } else {
    bubble.textContent = text;
  }
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function getChatbotReply(message) {
  const normalized = message.toLowerCase();

  if (hasAny(normalized, ['price', 'pricing', 'cost', 'rate', 'charges', 'budget'])) {
    return `
      WordPress pricing depends on scope, but here is a simple guide:<br><br>
      • Basic landing page: <strong>starting from $50</strong><br>
      • Business website: <strong>starting from $100</strong><br>
      • E-commerce / custom website: <strong>starting from $200+</strong><br><br>
      Final price depends on pages, design, features, and revisions.<br>
      WordPress work is available on <a href="https://www.fiverr.com/abdalkhan1514" target="_blank" rel="noopener noreferrer">Fiverr</a>. AI project discussions can be handled on <a href="https://www.upwork.com/freelancers/~016798e9d779c76f73?mp_source=share" target="_blank" rel="noopener noreferrer">Upwork</a>.
    `;
  }

  if (hasAny(normalized, ['wordpress', 'fiverr', 'website', 'web site', 'elementor', 'woocommerce'])) {
    return `
      The Fiverr service is focused on <strong>WordPress development</strong>.<br><br>
      It includes responsive business websites, landing pages, redesigns, blog setups, and WordPress customization.<br>
      Visit Fiverr here: <a href="https://www.fiverr.com/abdalkhan1514" target="_blank" rel="noopener noreferrer">View Fiverr Profile</a>
    `;
  }

  if (hasAny(normalized, ['delivery', 'time', 'deadline', 'how long', 'duration'])) {
    return 'Delivery time depends on the workload. Small WordPress tasks can be done quickly, while full websites, custom features, analytics dashboards, or ML tasks take longer after reviewing the requirements.';
  }

  if (hasAny(normalized, ['service', 'what do you do', 'offer', 'offers'])) {
    return 'Main services include machine learning systems, analytics and visualization, data-focused project work, and WordPress website development through Fiverr.';
  }

  if (hasAny(normalized, ['portfolio', 'project', 'work sample', 'examples'])) {
    return 'The portfolio includes machine learning notebooks, data visualization projects, pandas analytics, and applied ML work. You can open the Portfolio section to explore the examples.';
  }

  if (hasAny(normalized, ['contact', 'email', 'whatsapp', 'hire', 'reach'])) {
    return `
      You can connect through the Contact section, email, WhatsApp, Fiverr, or Upwork.<br><br>
      • Fiverr: <a href="https://www.fiverr.com/abdalkhan1514" target="_blank" rel="noopener noreferrer">Open Fiverr</a><br>
      • Upwork: <a href="https://www.upwork.com/freelancers/~016798e9d779c76f73?mp_source=share" target="_blank" rel="noopener noreferrer">Open Upwork</a><br>
      • Email: <a href="mailto:muhammadabdal15140@gmail.com">muhammadabdal15140@gmail.com</a><br>
      • WhatsApp: <a href="https://wa.me/923419007352" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
    `;
  }

  if (hasAny(normalized, ['payment', 'pay', 'jazzcash', 'jazz cash', 'bank', 'method'])) {
    return `
      Available payment methods depend on the project channel.<br><br>
      • WordPress work: Fiverr<br>
      • AI work: Upwork<br>
      • Direct payment options: <strong>JazzCash 03419007352</strong><br>
      • Bank option: <strong>UBL 315533424</strong>
    `;
  }

  if (hasAny(normalized, ['review', 'rating', 'feedback', 'testimonial'])) {
    return 'Visitors can submit a review in the Reviews section on the home page. Reviews are stored in the browser on that device in the current version.';
  }

  if (hasAny(normalized, ['ai', 'ml', 'machine learning', 'data', 'analytics'])) {
    return `
      AI-focused work is available through <strong>Upwork</strong>.<br><br>
      Services include machine learning, analytics, data cleaning, visualization, and practical Python-based support.<br>
      View the AI profile here: <a href="https://www.upwork.com/freelancers/~016798e9d779c76f73?mp_source=share" target="_blank" rel="noopener noreferrer">Open Upwork Profile</a>
    `;
  }

  if (hasAny(normalized, ['hello', 'hi', 'salam', 'hey'])) {
    return 'Hello. You can ask about pricing, WordPress services, portfolio projects, delivery time, or how to contact CodeWithAbdal.';
  }

  return 'I can answer questions about pricing, WordPress Fiverr services, delivery time, portfolio work, reviews, contact details, and AI or data services. Ask me something specific and I will help.';
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function initPaymentProof() {
  const fileInput = document.querySelector('#payment-screenshot');
  const preview = document.querySelector('#payment-preview');
  const previewImage = document.querySelector('#payment-preview-image');
  const previewName = document.querySelector('#payment-preview-name');
  const whatsappBtn = document.querySelector('#send-proof-whatsapp');
  const emailBtn = document.querySelector('#send-proof-email');

  if (!fileInput || !preview || !previewImage || !previewName || !whatsappBtn || !emailBtn) return;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) {
      preview.hidden = true;
      previewImage.removeAttribute('src');
      previewName.textContent = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewImage.src = objectUrl;
    previewName.textContent = `Selected screenshot: ${file.name}`;
    preview.hidden = false;
  });

  whatsappBtn.addEventListener('click', () => {
    const message = buildPaymentProofMessage();
    window.open(`https://wa.me/923419007352?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  emailBtn.addEventListener('click', () => {
    const subject = encodeURIComponent('Payment Proof Submission');
    const body = encodeURIComponent(buildPaymentProofMessage());
    window.location.href = `mailto:muhammadabdal15140@gmail.com?subject=${subject}&body=${body}`;
  });
}

function loadContactThreads() {
  try {
    const saved = JSON.parse(localStorage.getItem('codewithabdal-contact-inbox') || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}

  return [
    {
      role: 'system',
      name: 'CodeWithAbdal',
      email: 'muhammadabdal15140@gmail.com',
      message: 'Inbox ready. Send a message from the form and the latest conversation will appear here.',
      time: new Date().toLocaleString()
    }
  ];
}

function renderContactThreads(threads, container) {
  container.innerHTML = threads
    .map(
      (thread) => `
        <article class="contact-inbox-item ${thread.role}">
          <div class="contact-inbox-meta">
            <strong>${escapeHtml(thread.name)}</strong>
            <span>${escapeHtml(thread.time)}</span>
          </div>
          <p>${escapeHtml(thread.message)}</p>
          <small>${escapeHtml(thread.email)}</small>
        </article>
      `
    )
    .join('');
}

function buildContactReply(name, message) {
  const normalized = message.toLowerCase();

  if (hasAny(normalized, ['wordpress', 'website', 'fiverr'])) {
    return `Thank you ${name}, your WordPress inquiry has been received. Please share your website goals, number of pages, and any reference design, and a Fiverr-friendly reply will be prepared.`;
  }

  if (hasAny(normalized, ['ai', 'ml', 'machine learning', 'data', 'analytics', 'upwork'])) {
    return `Thank you ${name}, your AI and data message has been received. Please send the project scope, dataset details, and deadline so the Upwork workflow can be discussed clearly.`;
  }

  if (hasAny(normalized, ['price', 'budget', 'cost'])) {
    return `Thank you ${name}, your pricing request has been received. A quote can be shared once the project scope, features, and delivery timeline are confirmed.`;
  }

  return `Thank you ${name}, your message has been received successfully. A follow-up can continue through email, WhatsApp, Fiverr, or Upwork depending on the project type.`;
}

function buildPaymentProofMessage() {
  const name = document.querySelector('#payment-name')?.value.trim() || 'Client';
  const method = document.querySelector('#payment-method')?.value || 'Payment';
  const reference = document.querySelector('#payment-reference')?.value.trim() || 'Not provided';
  const file = document.querySelector('#payment-screenshot')?.files?.[0];
  const screenshotName = file ? file.name : 'Screenshot will be attached manually';

  return `Payment proof from ${name}
Payment method: ${method}
Reference number: ${reference}
Screenshot: ${screenshotName}

I am sending my payment proof. Please confirm receipt.`;
}
