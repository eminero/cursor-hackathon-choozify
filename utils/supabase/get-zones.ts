import { supabase } from './client';

interface Zone {
  zone_name: string;
  centroid_geom: string;
  created_at: string;
}

/**
 * Fetches all zones from the Supabase zones table.
 * @returns Array of Zone objects or null if error occurs
 */
export async function getZones(): Promise<Zone[] | null> {
  const { data, error } = await supabase.from('zones').select('*');

  if (error) {
    console.error('Error fetching zones:', error.message);
    return null;
  }

  return data;
}

/**
 * Fetches a specific zone by name.
 * @param zoneName - The name of the zone to fetch
 * @returns Single Zone object or null if not found or error occurs
 */
export async function getZoneByName(zoneName: string): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('zone_name', zoneName)
    .single();

  if (error) {
    console.error(`Error fetching zone "${zoneName}":`, error.message);
    return null;
  }

  return data;
}

// Run example if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  (async () => {
    console.log('Fetching all zones...\n');

    const zones = await getZones();

    if (zones) {
      console.log(`Found ${zones.length} zones:\n`);
      zones.forEach((zone, index) => {
        console.log(`${index + 1}. ${zone.zone_name}`);
        console.log(`   Created: ${zone.created_at}\n`);
      });
    }

    // Example: Fetch specific zone
    console.log('Fetching Providencia zone...\n');
    const providencia = await getZoneByName('Providencia');

    if (providencia) {
      console.log('Providencia zone details:');
      console.log(JSON.stringify(providencia, null, 2));
    }
  })();
}
