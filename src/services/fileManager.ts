import * as admin from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { UploadedFile } from 'express-fileupload';
import { MESSAGES, generateRandomString } from '../utils';
import { CustomError, ErrorMiddleware } from '../middlewares';
import config from '../config';

const { firebase } = config;

export const fbAdmin = admin.initializeApp({
  credential: admin.credential.cert(firebase),
});

export class FileManager {
  private storageBucket;
  constructor() {
    this.storageBucket = fbAdmin.storage().bucket(firebase.storage_bucket);
  }

  private uploader = async (file: Express.Multer.File): Promise<string> => {

    const fileName = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;

    const fileToStore = this.storageBucket.file(fileName);
    if (!file.buffer) {
      throw new Error('No file buffer found!');
    }

    const uniqueId = await generateRandomString(32, 'aA0');

    await fileToStore.save(file.buffer, {
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uniqueId,
        },
      },
    });

    return (
      `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket.name}/o/` +
      encodeURIComponent(fileName) +
      `?alt=media&token=${uniqueId}`
    );
  };


  private upload = async (file: UploadedFile): Promise<string> => {
    const fileName =
      new Date().toISOString().replace(/:/g, '-') + '-' + file.name;

    const fileToStore = this.storageBucket.file(fileName);

    const uniqueId = await generateRandomString(32, 'aA0');
    await fileToStore.save(file.data, {
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uniqueId,
        },
      },
    });

    return (
      'https://firebasestorage.googleapis.com/v0/b/' +
      this.storageBucket.name +
      '/o/' +
      encodeURIComponent(fileName) +
      '?alt=media&token=' +
      uniqueId
    );
  };

  uploadFile = async (files: any): Promise<string[] | string> => {
    try {
      if (Array.isArray(files)) {
        const fileUrls = await Promise.all(
          files.map(async (file) => {
            return await this.upload(file);
          }),
        );

        return fileUrls;
      } else {
        const singleFile = files;
        return await this.upload(singleFile);
      }
    } catch (error) {
      console.log('upload error: ', error);
      // return { error };
    }
  };

  uploaderFile = async (files: any): Promise<string[] | string> => {
    try {
      if (Array.isArray(files)) {
        const fileUrls = await Promise.all(
          files.map(async (file) => {
            return await this.uploader(file);
          }),
        );

        return fileUrls;
      } else {
        const singleFile = files;
        return await this.uploader(singleFile);
      }
    } catch (error) {
      console.log('upload error: ', error);
      // return { error };
    }
  };

  uploadBase64File = async (base64: string): Promise<string> => {
    try {
      const base = base64.replace(/^data:\w+\/\w+;base64,/, '');
      const file = Buffer.from(base, 'base64');

      if (file.byteLength / 1024 > 100 /* size in kB */) {
        throw new CustomError(
          MESSAGES.FILE_SIZE_LIMIT('100kb'),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      const uniqueId = await generateRandomString(32, 'aA0');
      const fileName = new Date().getTime().toString();

      await this.storageBucket.file(fileName).save(file, {
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: uniqueId,
          },
        },
      });

      return (
        'https://firebasestorage.googleapis.com/v0/b/' +
        this.storageBucket.name +
        '/o/' +
        encodeURIComponent(fileName) +
        '?alt=media&token=' +
        uniqueId
      );
    } catch (error) {
      throw error;
    }
  };

  getName = (url: string): string => {
    const token = url.split('?alt=media&token=').pop();
    const pattern = `^https://firebasestorage.googleapis.com/v0/b/${this.storageBucket.name}/o/+|\\?alt=media&token=${token}+$`;
    return decodeURIComponent(url).replace(new RegExp(pattern, 'g'), '');
  };

  deleteFile = async (url: string) => {
    try {
      const fileToDelete = this.storageBucket.file(this.getName(url));

      try {
        await fileToDelete.delete();
        return {
          message: 'Successfully deleted file from storage',
          status: true,
        };
      } catch (e) {
        throw e;
      }
    } catch (e) {
      throw e;
    }
  };

  uploaderPersonalize = async (files: any): Promise<string[] | string> => {
    try {
      // Check if files is an array
      if (Array.isArray(files)) {
        // If multiple files, use Promise.all to handle them all in parallel
        const fileUrls = await Promise.all(
          files.map(async (file) => {
            // Ensure the file is in the correct format (buffer and originalname)
            if (!file.buffer || !file.originalname) {
              throw new Error('Invalid file format or missing file data');
            }
            return await this.uploader(file);
          })
        );
        return fileUrls;
      } else {
        // Single file upload
        if (!files.buffer || !files.originalname) {
          throw new Error('Invalid file format or missing file data');
        }
        return await this.uploader(files);
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Upload error: ', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  };

}
