# Crystal Bookkeeping 💎

Official website for **Crystal Bookkeeping** — Professional bookkeeping, cleanup, catch-up, and financial reconciliation for service-based businesses locally and globally.

## 🚀 Features

- **Responsive Modern Design**: Built with HTML5, CSS3, and Bootstrap 5 with deep forest green and vibrant lime aesthetics.
- **Interactive Pricing Estimator**: Dynamic real-time fixed-fee quote calculator with dual-currency support (USD $ and NGN ₦).
- **Smooth Page Preloader**: 3D book-opening animation with brand logo reveal.
- **Scroll-Reveal System**: Lightweight, pure CSS & vanilla JS scroll animations with zero third-party dependencies.
- **Appointment & Booking Modals**: Seamless consultation scheduling integrated into every service tier.
- **cPanel & Static Hosting Ready**: No build step or backend required; plug-and-play static structure.

## 📁 Project Structure

```
├── index.html          # Homepage with Hero, Packages, Cleanup Process, Estimator & FAQs
├── about.html          # Founder's story (Wuraola Oluwalana), credentials & values
├── services.html       # Detailed breakdown of all 4 service packages & deliverables
├── contact.html        # Contact form, direct booking & consultation details
├── css/
│   └── style.css       # Custom design system, animations, responsive layout & overrides
├── js/
│   ├── main.js         # Interactive pricing estimator & booking handlers
│   ├── preloader.js    # 3D book opening preloader controller
│   └── scroll-reveal.js# IntersectionObserver scroll reveal system
└── assets/
    └── images/         # Brand logos, portraits, and photography assets
```

## 🛠️ Local Development

Open `index.html` directly in any web browser, or serve using:

```bash
# Python
python3 -m http.server 8080

# PHP / XAMPP
# Place folder in /htdocs/Crystal and access via http://localhost/Crystal
```

## 🌐 Deployment to cPanel

1. Compress all files in the root folder into a `.zip` archive.
2. Log in to **cPanel** > **File Manager**.
3. Navigate to `public_html` (or your addon domain directory).
4. Upload and extract the `.zip` archive.
