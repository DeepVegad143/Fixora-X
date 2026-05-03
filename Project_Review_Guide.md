# Fixora-X Project: Comprehensive Technical Review

This document provides a detailed overview of **Fixora-X**, a real-time roadside assistance platform. It is designed to help you explain the project structure, tech stack, and workflow during a project review or viva.

## 1. Project Vision
**Fixora-X** (formerly RoadGuard) is an on-demand service platform that bridges the gap between stranded motorists and automotive service providers (mechanics). It solves the problem of unpredictable wait times and lack of transparency in traditional roadside assistance.

---

## 2. Full Tech Stack & Technologies

### Frontend (The Client Side)
*   **React.js (v19)**: The core framework for building a fast, component-based user interface.
*   **Tailwind CSS**: Used for all styling. It ensures the app is fully responsive (works on mobile, tablet, and desktop) and maintains a premium look.
*   **Framer Motion**: Powers the smooth micro-animations and transitions, enhancing the user experience (UX).
*   **Context API**: Handles global state management (Authentication, Socket connections, and User preferences).
*   **Socket.io-Client**: Enables real-time updates for notifications, live tracking, and chat features.
*   **Lucide React**: A modern icon library for a clean, professional aesthetic.

### Backend (The Server Side)
*   **Node.js & Express.js**: A robust and scalable runtime/framework for handling API requests and business logic.
*   **MongoDB & Mongoose**: A NoSQL database that allows for flexible data structures. We use Mongoose for schema validation and object modeling.
*   **Socket.io (Server)**: Manages real-time event broadcasting (e.g., sending a nearby request to multiple mechanics simultaneously).
*   **JWT (JSON Web Tokens)**: Used for secure, stateless authentication and role-based access control (RBAC).
*   **Bcrypt.js**: For industry-standard password hashing and security.

### External APIs & Integrations
*   **Google Maps Platform**:
    *   *Maps JavaScript API*: To display the interactive map for customers and mechanics.
    *   *Places API*: For location autocomplete and address searching.
    *   *Distance Matrix API*: To calculate the ETA (Estimated Time of Arrival) based on real-time traffic.
*   **Razorpay**: A secure payment gateway integration for processing service fees and mechanic payouts.
*   **Cloudinary**: A cloud-based media management service used for storing vehicle images, profile pictures, and document proofs.
*   **Nodemailer**: Handles automated email communications, such as OTP verification and service summaries.

---

## 3. Project Architecture (Workflow)

### A. The User Flow (Customer)
1.  **Onboarding**: Sign up and verify account via OTP (Email).
2.  **Request Service**: Use the map to pin their location, select a vehicle, and describe the problem (with optional photos).
3.  **Real-time Bidding**: The request is broadcasted to nearby mechanics. The customer receives multiple offers and can compare ratings/prices.
4.  **Live Tracking**: Once a mechanic is hired, the customer can track their live location on the map.
5.  **Payment & Feedback**: Pay via Razorpay and leave a rating for the mechanic.

### B. The Mechanic Flow
1.  **Registration**: Mechanics upload business documents (stored on Cloudinary) for admin approval.
2.  **Duty Mode**: Toggle "Online/Offline" status to start receiving requests.
3.  **Accepting Jobs**: View nearby service requests, see the issue details, and send a price offer.
4.  **Navigation**: Use integrated Google Maps navigation to reach the customer's location.

### C. The Admin Flow
1.  **Dashboard**: A centralized hub to view platform analytics (total revenue, active users, pending requests).
2.  **Moderation**: Approve or reject mechanic registrations.
3.  **Dispute Resolution**: View detailed logs of every service request to resolve user complaints.

---

## 4. Key Design Decisions (The "Why?")

*   **Why MongoDB?**
    *   Roadside assistance requests can be complex (different fields for a "Flat Tire" vs. "Engine Overheating"). A NoSQL database handles this semi-structured data more efficiently than a traditional SQL database.
*   **Why Socket.io instead of REST polling?**
    *   Roadside assistance is time-critical. Socket.io provides **real-time** bidirectional communication, whereas REST polling would consume more battery/data and introduce delays.
*   **Why Razorpay?**
    *   It provides a developer-friendly API for Indian markets, supporting UPI, Cards, and Wallets out of the box.
*   **Why Tailwind CSS?**
    *   It allows for rapid prototyping and ensures that the "Premium Design" requirement is met with minimal custom CSS overhead.

---

## 5. Folder Structure Summary

### Backend
*   `src/models/`: Database blueprints (User, ServiceRequest, Payment).
*   `src/controllers/`: The "Brain" of the app; contains the logic for each feature.
*   `src/routes/`: Defines the API endpoints (e.g., `/api/users/login`).
*   `src/socket/`: Logic for real-time events.
*   `src/services/`: Integration logic for Cloudinary, Razorpay, and Email.

### Frontend
*   `src/pages/`: Individual screens (Dashboard, Landing, MapView).
*   `src/components/`: Reusable UI elements (Buttons, Cards, Modals).
*   `src/contexts/`: Global state providers.
*   `src/api/`: Centralized Axios configuration for backend communication.

---


