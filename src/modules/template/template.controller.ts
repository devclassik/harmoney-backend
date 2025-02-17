import { Request, Response } from 'express';
import { AppDataSource, Template } from '../../database';
import { BaseService } from '../shared/base.service';

export class TemplateController {
  private templateRepo = AppDataSource.getRepository(Template);
  private baseService = new BaseService(this.templateRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { templateId, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File upload is required' });
    }
    console.log(req);

    try {
      await this.baseService.isPropertyTaken('type', type, 'Template type');
      const downloadUrl = `${req.protocol}://${req.get('host')}/${file.path}`;

      const template = await this.baseService.create({
        templateId,
        type,
        downloadUrl,
      });
      return this.baseService.createdResponse(res, template);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const templateId = req.params.templateId;
    const { type } = req.body;
    const file = req.file;

    try {
      const template = await this.baseService.findById({
        id: Number(templateId),
        resource: 'Template',
      });

      if (file) {
        template.downloadUrl = `${req.protocol}://${req.get('host')}/${
          file.path
        }`;
      }
      if (type) {
        template.type = type;
      }

      const updatedTemplate = await this.templateRepo.save(template);
      return this.baseService.updatedResponse(res, updatedTemplate);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const templateId = req.params.templateId;

    try {
      const template = await this.baseService.findById({
        id: Number(templateId),
        resource: 'Template',
      });

      return this.baseService.successResponse(res, template);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({ res });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const templateId = req.params.templateId;

    try {
      await this.baseService.delete({
        id: Number(templateId),
        resource: 'Template',
        res,
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}

/*
import express from "express";
import multer from "multer";
import { bucket } from "./firebaseConfig"; // Import the bucket

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

// Upload File Route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = bucket.file(`uploads/${Date.now()}_${req.file.originalname}`);

    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on("error", (err) => {
      console.error("Upload Error:", err);
      res.status(500).json({ message: "Upload failed" });
    });

    stream.on("finish", async () => {
      await file.makePublic(); // Make the file publicly accessible
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      res.json({ message: "File uploaded successfully", downloadUrl: publicUrl });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

*/
