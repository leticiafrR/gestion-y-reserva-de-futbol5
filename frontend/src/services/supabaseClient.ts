import { createClient } from '@supabase/supabase-js';
import { useToken } from "@/services/TokenContext";

const supabaseUrl = 'https://ccncizipoaplqjembifj.supabase.co'; // Reemplaza con tu URL de Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbmNpemlwb2FwbHFqZW1iaWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDM2MzcsImV4cCI6MjA2NDgxOTYzN30.UWHwnqtDW2hjcQIx71sCjCpLSp8qI-AMSulM5oVA-8M'; // Reemplaza con tu anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImageProfile(file: File, userEmail: string): Promise<string> {
  try {
    // Validar el archivo
    if (!file) {
      throw new Error('No file provided');
    }

    // Validar el email
    if (!userEmail) {
      throw new Error('User email is required');
    }

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validar el tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size must be less than 2MB');
    }

    // Sanitizar el email para usarlo como nombre de carpeta
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gestiondecanchas/profile-photos/${sanitizedEmail}/${fileName}`;

    // Intentar subir el archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gestiondecanchas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Obtener la URL pública
    const { data: urlData } = supabase.storage
      .from('gestiondecanchas')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    return urlData.publicUrl;

  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}

export async function uploadFieldImage(file: File, fieldName: string): Promise<string> {
  try {
    // Validar el archivo
    if (!file) {
      throw new Error('No file provided');
    }

    // Validar el nombre de la cancha
    if (!fieldName) {
      throw new Error('Field name is required');
    }

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validar el tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size must be less than 2MB');
    }

    // Sanitizar el nombre de la cancha para usarlo como nombre de carpeta
    const sanitizedFieldName = fieldName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gestiondecanchas/fields/${sanitizedFieldName}/${fileName}`;
    // Intentar subir el archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gestiondecanchas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Obtener la URL pública
    const { data: urlData } = supabase.storage
      .from('gestiondecanchas')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return urlData.publicUrl;

  } catch (error) {
    console.error('Error in uploadFieldImage:', error);
    throw error;
  }
}

export async function uploadTeamLogo(file: File, teamName: string): Promise<string> {
  try {
    // Validar el archivo
    if (!file) {
      throw new Error('No file provided');
    }

    // Validar el nombre del equipo
    if (!teamName) {
      throw new Error('Team name is required');
    }

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validar el tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size must be less than 2MB');
    }

    // Sanitizar el nombre del equipo para usarlo como nombre de carpeta
    const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gestiondecanchas/teams/${sanitizedTeamName}/${fileName}`;
    // Intentar subir el archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gestiondecanchas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Obtener la URL pública
    const { data: urlData } = supabase.storage
      .from('gestiondecanchas')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return urlData.publicUrl;

  } catch (error) {
    console.error('Error in uploadTeamLogo:', error);
    throw error;
  }
} 