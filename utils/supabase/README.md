# Supabase Integration - Choozify MVP

This directory contains utilities for connecting to and querying the Supabase instance.

## Setup

### 1. Environment Variables

A `.env` file has been created in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pxwlwahpvhvextrakdkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Dependencies

The following packages are installed:
- `@supabase/supabase-js` - Supabase client library
- `dotenv` - Environment variable management
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler

## Files

### `client.ts`
Creates and exports a configured Supabase client instance that can be used throughout the application.

```typescript
import { supabase } from './utils/supabase/client';
```

### `get-zones.ts`
Utility functions and CLI script for querying the zones table using the Supabase client.

**Functions:**
- `getZones()` - Fetches all zones from the database
- `getZoneByName(zoneName: string)` - Fetches a specific zone by name

### `raw-http-example.ts`
Example demonstrating raw HTTP GET requests to Supabase's PostgREST API without using the Supabase client library.

**Functions:**
- `fetchZonesViaHTTP()` - Fetches zones using native fetch API

### `property-images.ts`
Utilities for managing property images stored in Supabase Storage and the `images_json` JSONB column.

**Functions:**
- `uploadPropertyImage(propertyId, file, altText)` - Uploads an image to Storage
- `addImageToProperty(propertyId, image)` - Adds an image to a property's images array
- `removeImageFromProperty(propertyId, imagePath)` - Removes an image from property and Storage
- `getPropertyImages(propertyId)` - Fetches all images for a property
- `reorderPropertyImages(propertyId, orderedImages)` - Updates the display order of images

**See:** `IMAGES_USAGE.md` for detailed documentation

### `example-property-with-images.ts`
Example code demonstrating how to work with the `images_json` column on the properties table.

## Usage

### CLI Scripts

**Using Supabase Client:**

```bash
npm run get-zones
```

**Using Raw HTTP (demonstrates underlying API):**

```bash
npm run get-zones-http
```

**Property Images Example:**

```bash
npm run example-images
```

**Output:**
```
Fetching all zones...

Found 5 zones:

1. Centro
   Created: 2026-01-31T19:05:23.452866+00:00

2. Norte
   Created: 2026-01-31T19:05:23.452866+00:00

3. Sur
   Created: 2026-01-31T19:05:23.452866+00:00

4. Oeste
   Created: 2026-01-31T19:05:23.452866+00:00

5. Providencia
   Created: 2026-01-31T19:05:23.452866+00:00
```

### Programmatic Usage

Import and use the utility functions in your code:

```typescript
import { getZones, getZoneByName } from './utils/supabase/get-zones';

// Fetch all zones
const zones = await getZones();
console.log(zones);

// Fetch specific zone
const providencia = await getZoneByName('Providencia');
console.log(providencia);
```

## Database Schema

The `zones` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `zone_name` | TEXT (Primary Key) | Name of the zone (e.g., "Providencia") |
| `centroid_geom` | GEOMETRY(Point, 4326) | Geographic centroid point for proximity calculations |
| `created_at` | TIMESTAMPTZ | Timestamp when the zone was created |

## Row-Level Security (RLS)

The zones table has RLS enabled with a policy that allows public read access:

```sql
CREATE POLICY "Zones viewable by everyone"
  ON public.zones FOR SELECT
  USING (true);
```

This allows unauthenticated requests to read zone data.

## HTTP GET Request

The Supabase client performs HTTP GET requests to the PostgREST API:

```
GET https://pxwlwahpvhvextrakdkl.supabase.co/rest/v1/zones
```

Under the hood, `supabase.from('zones').select('*')` generates the appropriate HTTP request with:
- **Headers:** `apikey`, `Authorization`
- **Query Parameters:** Field selection, filters, etc.

## Property Images Feature

The `properties` table now includes an `images_json` column for storing property images from Supabase Storage.

**Quick Start:**

```typescript
import { uploadPropertyImage, addImageToProperty } from './utils/supabase/property-images';

// Upload and add an image
const { data: image } = await uploadPropertyImage(propertyId, file, 'Living room');
await addImageToProperty(propertyId, image!);
```

**Documentation:** See `IMAGES_USAGE.md` for complete setup and usage instructions.

## Next Steps

1. Create the `properties` storage bucket in Supabase Dashboard
2. Configure storage policies for image uploads
3. Use similar patterns to query other tables (`profiles`, `applications`)
4. Implement type-safe interfaces for all database tables
5. Add more utility functions for common query patterns
6. Consider using the type generator: `supabase gen types typescript`
