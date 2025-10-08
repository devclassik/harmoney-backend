import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fetch from "node-fetch";
import { Status } from "@/database/enum";
import { FileManager } from "@/services/fileManager";

const fileManager = new FileManager();

export async function personalizePDF(
    url: string,
    employeeName: string,
    type: string,
    status: Status,
    startDate: Date,
    endDate: Date,
    reason: string
): Promise<any> {
    // 1. Fetch the existing PDF from a URL
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // 2. Load it into pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 3. Embed the Helvetica font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 4. Add text to the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const text = `
        Dear ${employeeName},

        Your ${type} leave request has been ${status || Status.PENDING}.

        Start Date: ${startDate}
        End Date: ${endDate}
        Reason: ${reason || 'N/A'}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 750,
        size: 14,
        font,
        color: rgb(0, 0, 0),
    });

    // 5. Save the modified PDF as bytes
    const modifiedPdfBytes = await pdfDoc.save();

    // 6. Convert to Buffer
    const buffer = Buffer.from(modifiedPdfBytes);

    if (!buffer || buffer.length === 0) {
        throw new Error("Generated PDF is empty or invalid.");
    }

    const file = {
        buffer: buffer,
        originalname: `${type}_leave-request.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}
