# Project Context: RentalMatch MVP (AI-Powered)
Act as a Senior Full Stack Developer. We are building an MVP for "RentalMatch", a two-sided marketplace connecting Landlords and Tenants with AI capabilities.

## 1. Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Styling:** Tailwind CSS + Shadcn UI.
- **Backend/DB:** Supabase (PostgreSQL).
- **AI Integration:** Vercel AI SDK + OpenAI (for the Chatbot).
- **Maps/Geo:** React-Leaflet and **PostGIS extension** enabled in Supabase.
- **State:** React Query.

## 2. User Roles & Core Flows
The app has three roles: `landlord`, `tenant`, `admin`.

### A. Landlord (Arrendador)
1.  **Listing:** Upload property with specific criteria (income, score, etc.).
2.  **Dashboard:** See applicants who match criteria.
3.  **Process:** Review -> Accept -> Schedule Visit.

### B. Tenant (Arrendatario)
1.  **Profile:** Fill personal data, income, and preferred zones.
2.  **Smart Search:** View eligible properties.
3.  **AI Chatbot Assistant (New Feature):** - A floating chat widget available globally.
    - Users type natural language (e.g., "Necesito un depa de 2 cuartos en Providencia por menos de $800").
    - The system converts this text into structured DB filters (JSON) and executes the query.

### C. Smart Notifications & Geo-Expansion (New Feature)
1.  **Exact Match:** Notify when a property matches the profile AND the exact preferred zone.
2.  **"Nearby Opportunity" (Geo-Expansion):** - If a property is *outside* the preferred zone but within a configurable radius (e.g., 2km buffer) AND the tenant is eligible, send a suggestion notification.
    - Label these differently in the UI (e.g., "Opportunity near your zone").

## 3. Database Schema Structure
- **profiles:** (id, role, preferences_json, current_location_geom).
- **properties:** (id, details_json, criteria_json, location_geom (PostGIS point), status).
- **applications:** (id, tenant_id, property_id, status).
- **chats:** (id, user_id, message_history).

## 4. Specific Implementation Logic for Cursor

### AI Search Logic
Implement a route handler `/api/chat/search`.
- Use OpenAI function calling to extract parameters: `{ max_price, bedrooms, zone_name, has_parking }`.
- Map these parameters to a Supabase query dynamically.
- Return the list of properties within the chat interface as "Property Cards".

### Geo-Expansion Logic
- Use PostGIS `ST_DWithin` for querying.
- When checking for notifications:
  `Query = (Property fits Tenant Criteria) AND (Property Location is inside Preferred Zone OR ST_Distance(Property, Preferred_Zone) < 2000 meters)`.

## 5. Immediate Task
1. Initialize Next.js project.
2. Enable PostGIS extension in the Supabase setup instructions.
3. Create the `AIChatWidget` component (UI only first).
4. Create a Zod schema for the "Natural Language Search Parameters" to be used by the LLM.