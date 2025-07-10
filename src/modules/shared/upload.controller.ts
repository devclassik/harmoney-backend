import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FileManager } from '@/services/fileManager';

const fileManager = new FileManager();

export class UploadController {
  public singleFileUpload = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'No file uploaded',
        });
      }

      const url = await fileManager.uploaderFile(req.file);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        file: url,
      });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  public multipleFileUpload = async (req: Request, res: Response) => {
    try {
      const files = req.files;

      if (!files) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'No files uploaded',
        });
      }

      const urls = await fileManager.uploaderFile(files);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        files: urls,
      });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  public updateFile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { previousUrl } = req.body;

      if (!previousUrl) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: 'error', message: 'Previous file URL required' });
      }

      const file = req.file;
      if (!file) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: 'error', message: 'No new file uploaded' });
      }

      const fileManager = new FileManager();
      await fileManager.deleteFile(previousUrl);
      const uploadedUrl = await fileManager.uploaderFile(file);

      return res
        .status(StatusCodes.OK)
        .json({ status: 'success', file: uploadedUrl });
    } catch (error: any) {
      console.error('Update file error:', error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  };

  public deleteFile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { url } = req.body;

      if (!url) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: 'error', message: 'File URL is required' });
      }

      const fileManager = new FileManager();
      await fileManager.deleteFile(url);

      return res
        .status(StatusCodes.OK)
        .json({ status: 'success', message: 'File deleted successfully' });
    } catch (error: any) {
      console.error('Delete file error:', error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: 'error', message: error.message });
    }
  };
}
