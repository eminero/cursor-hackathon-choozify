import { supabase } from './client';

/**
 * Property image stored in Supabase Storage
 * Expected structure for images_json array
 */
export interface PropertyImage {
  url: string;      // Full public URL from Supabase Storage
  path: string;     // Storage path in the "properties" bucket
  alt: string;      // Alt text for accessibility
  order?: number;   // Optional: display order
}

/**
 * Uploads an image to the properties bucket and returns the image object
 * @param propertyId - The property ID for organizing files
 * @param file - The image file to upload
 * @param altText - Alt text for the image
 * @returns PropertyImage object or error
 */
export async function uploadPropertyImage(
  propertyId: number,
  file: File,
  altText: string
): Promise<{ data: PropertyImage | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName);

    const propertyImage: PropertyImage = {
      url: urlData.publicUrl,
      path: fileName,
      alt: altText,
    };

    return { data: propertyImage, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Adds an image to a property's images_json array
 * @param propertyId - The property ID
 * @param image - The PropertyImage object to add
 */
export async function addImageToProperty(
  propertyId: number,
  image: PropertyImage
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Fetch current images
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('images_json')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError };
    }

    const currentImages = (property?.images_json as PropertyImage[]) || [];
    const updatedImages = [...currentImages, image];

    // Update with new image
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images_json: updatedImages })
      .eq('id', propertyId);

    if (updateError) {
      return { success: false, error: updateError };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Removes an image from a property and deletes it from storage
 * @param propertyId - The property ID
 * @param imagePath - The storage path of the image to remove
 */
export async function removeImageFromProperty(
  propertyId: number,
  imagePath: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Fetch current images
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('images_json')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError };
    }

    const currentImages = (property?.images_json as PropertyImage[]) || [];
    const updatedImages = currentImages.filter((img) => img.path !== imagePath);

    // Update database
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images_json: updatedImages })
      .eq('id', propertyId);

    if (updateError) {
      return { success: false, error: updateError };
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('properties')
      .remove([imagePath]);

    if (deleteError) {
      console.error('Failed to delete image from storage:', deleteError);
      // Don't return error since DB update succeeded
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Gets all images for a property
 * @param propertyId - The property ID
 * @returns Array of PropertyImage objects
 */
export async function getPropertyImages(
  propertyId: number
): Promise<{ data: PropertyImage[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('images_json')
      .eq('id', propertyId)
      .single();

    if (error) {
      return { data: null, error };
    }

    const images = (data?.images_json as PropertyImage[]) || [];
    return { data: images, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Updates the order of images for a property
 * @param propertyId - The property ID
 * @param orderedImages - Array of PropertyImage objects in the desired order
 */
export async function reorderPropertyImages(
  propertyId: number,
  orderedImages: PropertyImage[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Add order field to each image
    const imagesWithOrder = orderedImages.map((img, index) => ({
      ...img,
      order: index,
    }));

    const { error } = await supabase
      .from('properties')
      .update({ images_json: imagesWithOrder })
      .eq('id', propertyId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}
