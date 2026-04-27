# CodeWithAbdal Website

Personal portfolio website for `CodeWithAbdal`, built with Vite and a custom front-end stack.

This site includes:

- responsive portfolio layout
- Fiverr section for WordPress services
- Upwork section for AI services
- chatbot with service and pricing replies
- review/testimonial section
- payment methods display
- payment screenshot proof area
- optional Supabase database integration for reviews

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- GSAP
- Three.js
- Supabase JavaScript client

## Features

### Main Website

- mobile responsive layout
- animated hero section
- services section
- portfolio/projects section
- Fiverr service section
- Upwork service section
- contact section with social links

### Chatbot

The site includes a front-end chatbot that can answer common questions such as:

- pricing
- WordPress Fiverr work
- AI / ML / data work
- Upwork profile
- delivery time
- contact details
- payment methods

### Reviews

The website supports reviews in two modes:

1. local browser storage fallback
2. real Supabase database storage

If Supabase is configured, reviews are fetched from and saved to the database.
If Supabase is not configured, reviews use local browser storage.

### Payments

Payment information is shown on the site:

- JazzCash: `03419007352`
- UBL: `315533424`

There is also a payment proof section where users can:

- enter their name
- choose a payment method
- enter a transaction reference
- upload a screenshot preview
- send payment details through WhatsApp or email

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Supabase Setup

If you want live reviews with a real database:

1. Create a Supabase project
2. Run the SQL from `supabase-schema.sql`
3. Create a `.env` file using `.env.example`
4. Add your Supabase project values
5. Deploy with the same Supabase environment variables so reviews appear on all devices

Example:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

## Contact Email Setup

The contact form sends messages through EmailJS. Create a `.env` file from `.env.example` and add your EmailJS values:

```env
VITE_CONTACT_TO_EMAIL=muhammadabdal15140@gmail.com
VITE_EMAILJS_SERVICE_ID=your-emailjs-service-id
VITE_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
```

In your EmailJS template, include these variables:

```text
to_email
from_name
from_email
user_name
user_email
project_type
message
reply_to
```

If EmailJS is not configured, the form falls back to FormSubmit and sends to `VITE_CONTACT_TO_EMAIL`. On the first submission, FormSubmit may send an activation email to that inbox. Confirm it once, then future website messages will arrive by email.

## Database Schema

The SQL setup file is:

```text
supabase-schema.sql
```

It creates a `reviews` table and enables public read/insert access for review submissions.
It also enables Supabase Realtime for the `reviews` table, so open devices can update when a new review is posted.

## Project Files

- `index.html` - main page structure
- `style.css` - all styling and responsive layout
- `main.js` - site logic, reviews, chatbot, payment proof actions
- `cursor.js` - custom cursor interactions
- `three-scene.js` - animated Three.js background
- `supabase.js` - Supabase connection and review storage helpers
- `supabase-schema.sql` - database table and policies

## Deployment

This site can be deployed easily on:

- Vercel
- Netlify
- GitHub Pages

For live reviews and contact emails, make sure your deployment platform also has the Supabase and EmailJS environment variables set.

## Repository

GitHub repository:

[https://github.com/Abdal-AI/website](https://github.com/Abdal-AI/website)

## Author

Created for `CodeWithAbdal`.
