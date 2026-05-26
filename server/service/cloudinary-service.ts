import { v2 as cloudinary } from "cloudinary";
import { ResponseError } from "../error/response-error";

// Configure Cloudinary SDK credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadAttachmentTicket(
    file: File,
    folder: string = "ticketing/attachment",
    fileName?: string,
  ): Promise<string> {
    // 1. Client Payload Security Guards (MIME-Type & Capacity constraints)
    if (!file.type.startsWith("image/")) {
      throw new ResponseError(
        400,
        "File must be an image format (jpg, png, webp)",
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ResponseError(400, "Image size must be less than 5MB");
    }

    // 2. Convert Web API File object into Node.js Buffer for stream processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Wrap Cloudinary Callback Stream inside a Promise wrapper to support async/await
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "image",
          public_id: fileName,
          use_filename: true,
          unique_filename: !fileName, // Prevent suffix hashing if explicit filename is supplied
          overwrite: true, // Overwrite assets sharing identical public IDs within the folder

          // On-the-fly Image Processing & Optimization Matrix
          transformation: [
            {
              width: 1000,
              height: 1000,
              crop: "pad",
              background: "white",
            },
            {
              quality: "auto:best",
              fetch_format: "webp",
            },
          ],
        },
        (error, result) => {
          // Handle transmission or system faults
          if (error) {
            return reject(
              new ResponseError(500, `Image upload failed: ${error.message}`),
            );
          }
          if (!result) {
            return reject(
              new ResponseError(500, "Image upload result is empty"),
            );
          }

          // Return the secure cloud asset access URI
          resolve(result.secure_url);
        },
      );

      // Write the binary buffer chunks to the cloud upload stream and finalize pipeline
      uploadStream.end(buffer);
    });
  }

  static async deleteImage(url: string): Promise<void> {
    try {
      const rootFolder = "ticketing-school";
      const parts = url.split("/");
      const rootIndex = parts.indexOf(rootFolder);

      // Guard against anomalies where the target asset path does not match our folder structure
      if (rootIndex === -1) {
        console.warn("Could not find root folder in URL for deletion");
        return;
      }

      // Reconstruct structural path starting from root folder index onwards
      // e.g., from: ['http:', '', 'res.cloudinary.com', '...', 'ticketing-school', 'attachment', 'img.jpg']
      // to: ['ticketing-school', 'attachment', 'img.jpg']
      const relativePath = parts.slice(rootIndex);
      const publicIdWithExt = relativePath.join("/");

      // Strip off the file extension using regex (e.g., 'folder/file.webp' -> 'folder/file')
      // Cloudinary API requires only the public_id path WITHOUT extensions for destruction actions
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

      // Trigger API asset removal command
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // General error mitigation to avoid breaking relational database transactions if cleanup fails
      throw new ResponseError(500, `Image delete failed`);
    }
  }
}
