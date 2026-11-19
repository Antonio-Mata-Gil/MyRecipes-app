import { Injectable } from '@angular/core';
import { Storage, ref } from '@angular/fire/storage';
import { getDownloadURL, listAll, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  constructor(private storage: Storage) { }

  /**
   * Sube una imagen a Firebase Storage
   * @param folder - Carpeta destino (nombre de la receta)
   * @param file - Archivo a subir
   */
  async uploadImage(folder: string, file: File): Promise<void> {
    const imgRef = ref(this.storage, `imagen/${folder}/${file.name}`);
    await uploadBytes(imgRef, file);
  }

  /**
   * Obtiene la URL de descarga de la última imagen en una carpeta
   * @param folder - Carpeta desde la que obtener la imagen
   * @returns URL de descarga o cadena vacía si no existe
   */
  async getImageUrl(folder: string): Promise<string> {
    try {
      const imgRef = ref(this.storage, `imagen/${folder}`);
      const response = await listAll(imgRef);

      if (response.items.length > 0) {
        const lastItem = response.items[response.items.length - 1];
        return await getDownloadURL(lastItem);
      }
      return '';
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      return '';
    }
  }
}
