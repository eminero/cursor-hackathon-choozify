# Product Requirements Document (PRD)
## RentalMatch (Choozify MVP)

**Version:** 1.0  
**Date:** January 31, 2026  
**Status:** Approved for Development

---

## Executive Summary

**RentalMatch** is an AI-powered, two-sided rental marketplace connecting **Landlords** and **Tenants**. The MVP features an **AI chat assistant** for natural-language property search and **smart notifications** that surface both exact-match properties and "nearby opportunities" within a configurable radius of a tenant's preferred zones.

### MVP Scope Decisions
- **Preferred zones**: Named areas only (string identifiers like `"Providencia"`), no polygon geometry in MVP.
- **Eligibility model**: Tenant eligibility based on **income + score + constraints**.
- **Constraints (MVP)**: **pets**, **smoking**, **employment type**, **parking requirement**.

---

## 1. Goals & Objectives

### Primary Goals (MVP)
1. **Enable two-sided marketplace matching**: Landlords post property listings with eligibility criteria; tenants discover and apply to eligible properties.
2. **Ship AI-assisted discovery**: Convert tenant natural language queries into structured search filters and return results as interactive property cards.
3. **Increase engagement via smart notifications**: Notify tenants of exact-zone matches and nearby opportunities within a configurable radius, clearly differentiated in the UI.
4. **Support role-based user experience**: Distinct UX for `landlord`, `tenant`, and `admin` roles.

### Success Metrics (MVP)
- Tenant profile completion rate > 80%
- AI chat search usage > 50% of active tenants
- Application submission rate per eligible property view
- Notification click-through rate (exact vs nearby)

### Non-Goals (MVP)
- Payments, lease signing, or escrow functionality
- Identity verification, background checks, or credit bureau integrations
- Polygon-based zone boundaries or complex geofencing
- Advanced admin tooling beyond basic oversight
- Messaging between landlords and tenants (beyond application status)

---

## 2. Target Users & Personas

### Tenant (Arrendatario)
**Profile**: Individual or family searching for rental housing based on budget, location preferences, and lifestyle constraints.

**Key Needs**:
- Fast discovery of eligible properties matching income, score, and constraints.
- AI-powered search to describe needs in natural language.
- Notifications for new opportunities in preferred zones and nearby areas.

**Pain Points**:
- Manual filtering across multiple platforms.
- Discovering properties only to find they're ineligible.
- Missing out on properties just outside preferred zones.

### Landlord (Arrendador)
**Profile**: Property owner seeking qualified tenants who meet specific financial and lifestyle criteria.

**Key Needs**:
- Post listings with clear eligibility requirements.
- View pre-qualified applicants who match criteria.
- Efficient review and acceptance workflow.

**Pain Points**:
- Time wasted reviewing unqualified applicants.
- Lack of transparency on tenant eligibility upfront.

### Admin (Optional MVP)
**Profile**: Platform operator providing basic support and oversight.

**Key Needs**:
- Monitor listings and user activity.
- Handle basic moderation and support escalations.

---

## 3. Core User Journeys

### 3.1 Tenant Onboarding & Profile Setup
1. User signs up and selects role: `tenant`.
2. Completes profile form:
   - **Financial**: Monthly income, credit score.
   - **Constraints**: Employment type, has pets (yes/no), smokes (yes/no), needs parking (yes/no).
   - **Location**: List of preferred zone names (e.g., `["Providencia", "Las Condes"]`).
3. Profile saved; user is now "eligibility-ready" and can search/apply.

### 3.2 Landlord Listing Creation
1. User signs up and selects role: `landlord`.
2. Creates property listing:
   - **Details**: Price, bedrooms, zone name, address, amenities (e.g., has parking).
   - **Criteria**: Minimum income, minimum score, allowed employment types, pets allowed (yes/no), smoking allowed (yes/no).
   - **Location**: Selects address → system geocodes to PostGIS point.
3. Listing published with status `active`.
4. Dashboard shows applicants who meet criteria.

### 3.3 Tenant Smart Search (AI Chat)
1. Tenant opens global floating `AIChatWidget` (available on all pages).
2. Types natural language query:
   - Example: *"Necesito un depa de 2 cuartos en Providencia por menos de $800 con estacionamiento"*
3. Backend (`/api/chat/search`) uses OpenAI function calling to extract:
   - `max_price: 800`, `bedrooms: 2`, `zone_name: "Providencia"`, `has_parking: true`
4. Validates extracted params with Zod schema.
5. Runs Supabase query combining:
   - Extracted filters + tenant eligibility constraints.
6. Returns property summaries as **Property Cards** inside chat.
7. Tenant clicks card → navigates to property detail page → applies.

### 3.4 Application & Review Flow
1. Tenant applies to a property (one-click from property detail page).
2. Application status: `submitted`.
3. Landlord reviews applicant profile from their dashboard.
4. Landlord actions:
   - Accept → status becomes `accepted` → optional: schedule visit (timestamp metadata).
   - Reject → status becomes `rejected` (optional in MVP).

### 3.5 Smart Notifications
**Trigger**: New property posted or tenant updates preferences.

**Notification Types**:
- **Exact Match**: Property is eligible AND `property.zone_name` is in `tenant.preferred_zone_names`.
  - Label: *"New property in [Zone Name]"*
- **Nearby Opportunity**: Property is eligible AND within radius (e.g., 2km) of a preferred zone centroid, but NOT an exact zone match.
  - Label: *"Opportunity near your zone ([Preferred Zone])"*

---

## 4. Functional Requirements

### 4.1 Authentication & Roles (Supabase Auth)
- **FR-1.1**: Users must sign up/sign in via email/password (Supabase Auth).
- **FR-1.2**: Each user has a `profiles` record with `role: landlord | tenant | admin`.
- **FR-1.3**: Role determines accessible routes and UI components (enforced by RLS and frontend guards).

### 4.2 Tenant Profile (Eligibility Inputs)
Tenant profile must capture:
- **FR-2.1**: **Income** (numeric, monthly, currency assumed by locale).
- **FR-2.2**: **Score** (numeric credit score, normalized scale defined by product).
- **FR-2.3**: **Employment type** (enum):
  - Values: `full_time`, `part_time`, `contractor`, `self_employed`, `unemployed`, `student`, `retired`, `other`.
- **FR-2.4**: **Has pets** (boolean).
- **FR-2.5**: **Smokes** (boolean).
- **FR-2.6**: **Needs parking** (boolean).
- **FR-2.7**: **Preferred zone names** (array of strings, e.g., `["Providencia", "Las Condes"]`).

**Storage**: `profiles` table with columns for income, score, employment_type, and `preferences_json` containing constraints and zone names.

### 4.3 Property Listing (Details + Criteria)
Property listing must include:
- **FR-3.1**: **Details**:
  - `price` (numeric), `bedrooms` (integer), `zone_name` (string).
  - `has_parking` (boolean).
  - Address text.
- **FR-3.2**: **Criteria**:
  - `min_income` (numeric).
  - `min_score` (numeric).
  - `employment_types_allowed` (array of enum values, or "any").
  - `pets_allowed` (boolean).
  - `smoking_allowed` (boolean).
- **FR-3.3**: **Location**: PostGIS point (`location_geom`) for distance computations.
- **FR-3.4**: **Status**: `active` or `inactive`.

**Storage**: `properties` table with `details_json`, `criteria_json`, `zone_name`, `location_geom`, `status`.

### 4.4 Eligibility & Matching Logic (Deterministic)
A tenant is **eligible** for a property if and only if:
- **FR-4.1**: `tenant.income >= property.criteria.min_income`
- **FR-4.2**: `tenant.score >= property.criteria.min_score`
- **FR-4.3**: `tenant.employment_type` is in `property.criteria.employment_types_allowed` (or property allows "any").
- **FR-4.4**: If `tenant.has_pets = true`, then `property.criteria.pets_allowed = true`.
- **FR-4.5**: If `tenant.smokes = true`, then `property.criteria.smoking_allowed = true`.
- **FR-4.6**: If `tenant.needs_parking = true`, then `property.details.has_parking = true`.

**Note**: All conditions must be satisfied for eligibility.

### 4.5 AI Chatbot Assistant (UI + API)
- **FR-5.1**: Global floating `AIChatWidget` component available on all authenticated pages.
- **FR-5.2**: Widget persists message history per user (stored in `chats` table).
- **FR-5.3**: API endpoint: `POST /api/chat/search`
  - **Input**: User message text + user context (user_id, tenant profile data).
  - **Processing**:
    - Uses OpenAI function calling to extract filter parameters:
      - `max_price`, `bedrooms`, `zone_name`, `has_parking`
      - Optionally: `has_pets`, `smokes`, `employment_type`, `needs_parking` (if mentioned in query).
    - Validates extracted params with **Zod schema**.
    - Combines extracted filters with tenant eligibility constraints.
    - Runs Supabase query with filters + eligibility rules (FR-4.1 to FR-4.6).
  - **Output**: Array of property summaries (id, price, bedrooms, zone_name, has_parking, thumbnail URL).
- **FR-5.4**: Frontend renders results as **Property Cards** inside chat interface.
- **FR-5.5**: Clicking a property card navigates to property detail page.

### 4.6 Applications
- **FR-6.1**: Tenant can apply to a property (one application per tenant per property).
- **FR-6.2**: Application statuses: `submitted`, `reviewing`, `accepted`, `rejected` (optional).
- **FR-6.3**: Landlord can view applicants for their properties in dashboard.
- **FR-6.4**: Landlord can accept application → status becomes `accepted`.
- **FR-6.5**: Optional: "Schedule visit" action updates application with visit timestamp metadata.

### 4.7 Geo-Expansion Notifications (Named Zones Only)
**Implementation Approach**: Since zones are named strings (not polygons), maintain a `zones` reference table mapping `zone_name -> centroid_geom` (PostGIS point).

**Notification Rules**:
- **FR-7.1**: **Exact Match Notification**:
  - Trigger: Property is eligible (FR-4.1 to FR-4.6) AND `property.zone_name` is in `tenant.preferred_zone_names`.
  - Label: *"New property in [Zone Name]"*
- **FR-7.2**: **Nearby Opportunity Notification**:
  - Trigger: Property is eligible AND `property.zone_name` NOT in `tenant.preferred_zone_names` AND exists a preferred zone `z` where `ST_DWithin(property.location_geom, zones[z].centroid_geom, radius_meters)` is true.
  - Configurable `radius_meters` (default: 2000m / 2km).
  - Label: *"Opportunity near your zone ([Preferred Zone])"*
- **FR-7.3**: Notifications delivered in-app (MVP).
- **FR-7.4**: Clicking notification navigates to property detail page.

---

## 5. Data Model (MVP)

### 5.1 Core Tables

#### `profiles`
Stores user profiles and role-specific data.

| Column                  | Type                  | Notes                                      |
|-------------------------|-----------------------|--------------------------------------------|
| `id`                    | `bigint` (PK)         | References `auth.users(id)`                |
| `role`                  | `text`                | `landlord`, `tenant`, `admin`              |
| `income`                | `numeric`             | Monthly income (tenant only)               |
| `score`                 | `numeric`             | Credit score (tenant only)                 |
| `employment_type`       | `text`                | Enum (tenant only)                         |
| `preferences_json`      | `jsonb`               | Contains: `preferred_zone_names`, `has_pets`, `smokes`, `needs_parking` |
| `current_location_geom` | `geometry(Point, 4326)` | Optional (tenant)                        |
| `created_at`            | `timestamptz`         | Auto-generated                             |

#### `properties`
Stores property listings.

| Column          | Type                  | Notes                                      |
|-----------------|-----------------------|--------------------------------------------|
| `id`            | `bigint` (PK)         | Auto-generated identity                    |
| `landlord_id`   | `bigint` (FK)         | References `profiles(id)`                  |
| `zone_name`     | `text`                | Named zone (e.g., "Providencia")           |
| `details_json`  | `jsonb`               | Contains: `price`, `bedrooms`, `has_parking`, `address` |
| `criteria_json` | `jsonb`               | Contains: `min_income`, `min_score`, `employment_types_allowed`, `pets_allowed`, `smoking_allowed` |
| `location_geom` | `geometry(Point, 4326)` | PostGIS point for distance queries       |
| `status`        | `text`                | `active`, `inactive`                       |
| `created_at`    | `timestamptz`         | Auto-generated                             |

**Indexes**: 
- `location_geom` (GiST index for spatial queries)
- `zone_name` (B-tree index)
- `landlord_id` (B-tree index)

#### `applications`
Stores tenant applications to properties.

| Column          | Type                  | Notes                                      |
|-----------------|-----------------------|--------------------------------------------|
| `id`            | `bigint` (PK)         | Auto-generated identity                    |
| `tenant_id`     | `bigint` (FK)         | References `profiles(id)`                  |
| `property_id`   | `bigint` (FK)         | References `properties(id)`                |
| `status`        | `text`                | `submitted`, `reviewing`, `accepted`, `rejected` |
| `visit_scheduled_at` | `timestamptz`    | Optional                                   |
| `created_at`    | `timestamptz`         | Auto-generated                             |

**Indexes**: 
- `tenant_id` (B-tree index)
- `property_id` (B-tree index)
- Unique constraint on `(tenant_id, property_id)`

#### `chats`
Stores AI chat message history per user.

| Column            | Type                  | Notes                                      |
|-------------------|-----------------------|--------------------------------------------|
| `id`              | `bigint` (PK)         | Auto-generated identity                    |
| `user_id`         | `bigint` (FK)         | References `profiles(id)`                  |
| `message_history` | `jsonb`               | Array of message objects                   |
| `created_at`      | `timestamptz`         | Auto-generated                             |
| `updated_at`      | `timestamptz`         | Auto-updated on message append             |

**Indexes**: 
- `user_id` (B-tree index)

#### `zones` (Helper/Reference Table)
Maps zone names to centroid points for distance computations.

| Column          | Type                  | Notes                                      |
|-----------------|-----------------------|--------------------------------------------|
| `zone_name`     | `text` (PK)           | Unique zone identifier                     |
| `centroid_geom` | `geometry(Point, 4326)` | Reference point for "nearby" calculations |
| `created_at`    | `timestamptz`         | Auto-generated                             |

**Note**: Seed this table with zone centroids for all supported zones in your region.

---

## 6. API Requirements (MVP)

### 6.1 `/api/chat/search` (POST)
AI-powered natural language property search.

**Request**:
```json
{
  "message": "Need a 2 bedroom in Providencia under $800 with parking",
  "user_id": "123"
}
```

**Processing**:
1. Fetch tenant profile for `user_id`.
2. Call OpenAI API with function calling schema:
   - Function: `search_properties`
   - Parameters: `max_price`, `bedrooms`, `zone_name`, `has_parking`, `has_pets`, `smokes`, `employment_type`, `needs_parking`.
3. Validate extracted params with Zod schema.
4. Build Supabase query:
   - Filter by extracted params (where provided).
   - Apply eligibility rules (FR-4.1 to FR-4.6) using tenant profile.
5. Execute query and return matching properties.

**Response**:
```json
{
  "properties": [
    {
      "id": "456",
      "price": 750,
      "bedrooms": 2,
      "zone_name": "Providencia",
      "has_parking": true,
      "thumbnail_url": "https://..."
    }
  ],
  "extracted_filters": {
    "max_price": 800,
    "bedrooms": 2,
    "zone_name": "Providencia",
    "has_parking": true
  }
}
```

**Error Handling**:
- Invalid/ambiguous query → return clarification prompt.
- No results → return empty array with message.

---

## 7. UX Requirements (MVP)

### 7.1 AIChatWidget Component
- **Global availability**: Floating button visible on all authenticated pages.
- **Expandable panel**: Click to open/close chat interface.
- **Message history**: Persists per user session; loads from `chats` table.
- **Property Cards**: Inline rendering of search results with key details (price, bedrooms, zone, thumbnail).
- **Click action**: Navigate to property detail page.

### 7.2 Tenant Dashboard
- **Profile completion status**: Progress bar/checklist.
- **Recommended properties**: List of eligible properties in preferred zones.
- **Notifications section**: Exact matches + nearby opportunities (clearly labeled).
- **Recent searches**: Quick access to previous AI chat queries.

### 7.3 Landlord Dashboard
- **My Listings**: Grid/list view of active and inactive properties.
- **Applicants per listing**: Count of matched applicants with review CTA.
- **Application review panel**: View tenant profile, accept/reject actions.

### 7.4 Notification Labels
- **Exact match**: *"New property in [Zone Name]"*
- **Nearby opportunity**: *"Opportunity near your zone ([Preferred Zone])"* with distance indicator.

---

## 8. Non-Functional Requirements

### 8.1 Security
- **NFR-1.1**: Enable Row-Level Security (RLS) on all tables.
- **NFR-1.2**: RLS policies enforce:
  - Tenants can only read/write their own `profiles`, `applications`, `chats`.
  - Landlords can only read/write their own `properties` and view applicants for their listings.
  - Admins have elevated read access (write only for moderation actions).
- **NFR-1.3**: All functions use `SECURITY INVOKER` unless explicitly required otherwise.
- **NFR-1.4**: API routes validate user authentication via Supabase JWT.

### 8.2 Performance
- **NFR-2.1**: Index all foreign key columns (tenant_id, property_id, landlord_id, user_id).
- **NFR-2.2**: Create GiST index on `properties.location_geom` for spatial queries.
- **NFR-2.3**: Create B-tree index on `properties.zone_name`.
- **NFR-2.4**: Eligibility queries must complete in < 500ms for typical result sets (< 100 properties).
- **NFR-2.5**: AI chat search response time < 3s (including OpenAI API call).

### 8.3 Reliability
- **NFR-3.1**: AI parsing must fail gracefully; on invalid/ambiguous input, return clarification prompt or fallback filters.
- **NFR-3.2**: OpenAI API timeout: 10s; on timeout, return error message to user.
- **NFR-3.3**: Supabase query timeout: 5s; on timeout, return error message.

### 8.4 Observability
- **NFR-4.1**: Log AI extraction output (extracted params + confidence) for debugging (no PII in logs).
- **NFR-4.2**: Track analytics events:
  - Chat widget opens, messages sent, searches executed, result count.
  - Property card clicks from chat.
  - Applications submitted per tenant session.
  - Notifications sent/opened/clicked (by type: exact vs nearby).

---

## 9. Acceptance Criteria (MVP)

### AC-1: Tenant Profile
- ✅ Tenant can create profile with income, score, employment type, pets, smoking, parking requirement, and preferred zone names.
- ✅ Profile data persists and is used for eligibility checks.

### AC-2: Property Listing
- ✅ Landlord can create listing with details and criteria matching tenant constraints.
- ✅ Listing becomes searchable when status is `active`.

### AC-3: Eligibility
- ✅ A tenant sees only properties where they meet ALL criteria (income, score, pets, smoking, parking, employment).
- ✅ A landlord sees only applicants who meet their property's criteria.

### AC-4: AI Chat Search
- ✅ User can type natural language query in `AIChatWidget`.
- ✅ `/api/chat/search` extracts filters (max_price, bedrooms, zone_name, has_parking) and validates with Zod.
- ✅ Results return as Property Cards inside chat interface.
- ✅ Clicking a card navigates to property detail page.

### AC-5: Applications
- ✅ Tenant can apply to an eligible property.
- ✅ Landlord can view applicants and accept applications.
- ✅ Application status updates correctly (submitted → accepted).

### AC-6: Notifications
- ✅ Exact match notification appears when property matches zone AND eligibility.
- ✅ Nearby opportunity notification appears when property is eligible and within radius of preferred zone centroid.
- ✅ Notifications are labeled differently in UI.

---

## 10. Milestones & Timeline

### M1: Project Setup & Infrastructure (Week 1)
- Initialize Next.js 14 App Router project with TypeScript.
- Set up Tailwind CSS + Shadcn UI.
- Configure Supabase project and enable PostGIS extension.
- Create base authentication flow (sign up, sign in, role selection).

### M2: Core Data Model & Auth (Week 2)
- Implement database schema (profiles, properties, applications, chats, zones).
- Enable RLS policies on all tables.
- Seed `zones` table with reference centroids.
- Build profile forms for tenant and landlord roles.

### M3: Eligibility & Matching (Week 3)
- Implement eligibility logic (FR-4.1 to FR-4.6).
- Build tenant smart search (non-AI) with filters.
- Build landlord dashboard with applicant views.
- Implement application flow.

### M4: AI Chat Assistant (Week 4)
- Create `AIChatWidget` UI component.
- Implement `/api/chat/search` with OpenAI function calling.
- Create Zod schema for extracted parameters.
- Integrate Property Cards rendering in chat.

### M5: Notifications & Geo-Expansion (Week 5)
- Implement notification logic (exact + nearby).
- Build in-app notification UI.
- Test geo-expansion with `ST_DWithin` queries.

### M6: Testing & Polish (Week 6)
- End-to-end testing of all user journeys.
- Performance optimization (query tuning, indexing validation).
- UI/UX polish and responsive design.
- Accessibility audit (WCAG 2.1 AA).

---

## 11. Open Questions & Risks

### Open Questions
1. **Zone seeding**: Who maintains the `zones` reference table? Is there a trusted data source for zone centroids?
2. **Notification delivery**: Should we support push notifications (web push) in MVP or only in-app?
3. **Multi-language support**: Is the UI fully Spanish, fully English, or bilingual in MVP?

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API rate limits or downtime | High | Implement fallback to structured filter UI; cache API responses where possible. |
| Zone name ambiguity (e.g., "Centro" exists in multiple cities) | Medium | Require users to select from predefined zone list (autocomplete). |
| Inadequate PostGIS performance on large datasets | Medium | Early performance testing with realistic data volumes; optimize indexes. |
| Tenant profile abandonment (too many fields) | Medium | Progressive profile completion; allow partial profiles with nudges. |

---

## 12. Future Enhancements (Post-MVP)

- **Polygon-based zones**: Replace named zones with actual neighborhood boundaries.
- **Messaging system**: In-app chat between landlords and tenants.
- **Payment integration**: Deposit, rent payment, and lease signing.
- **Background checks**: Integration with credit bureaus and identity verification services.
- **Mobile apps**: Native iOS and Android apps.
- **Advanced analytics**: Landlord insights (time-to-fill, application trends) and tenant recommendations.

---

## Appendix

### A. Tech Stack Details
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend/DB**: Supabase (PostgreSQL + PostGIS)
- **AI**: Vercel AI SDK + OpenAI (GPT-4 for function calling)
- **Maps**: React-Leaflet (for property detail pages)
- **State**: React Query (TanStack Query)
- **Code Quality**: ESLint + Prettier

### B. Glossary
- **Eligibility**: A tenant meeting all criteria (income, score, constraints) for a property.
- **Exact Match**: Property is in a tenant's preferred zone list.
- **Nearby Opportunity**: Property is outside preferred zones but within radius of a zone centroid.
- **PostGIS**: PostgreSQL extension for spatial/geographic data types and queries.
- **RLS**: Row-Level Security; Postgres feature for fine-grained access control.

---

**Document Owner**: Product Team  
**Last Updated**: January 31, 2026  
**Next Review**: Post-M6 (End of Week 6)
