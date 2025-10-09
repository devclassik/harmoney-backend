import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fetch from "node-fetch";
import { DisciplineTypes, RetrenchmentTypes, Status } from "@/database/enum";
import { FileManager } from "@/services/fileManager";
import { date } from "joi";

const fileManager = new FileManager();

export async function leavePDF(
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
        y: 650,
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
        originalname: `${type}_leave-request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}

export async function disciplinePDF(
    url: string,
    employeeName: string,
    status: Status,
    disciplineType: DisciplineTypes,
    duration: number,
    durationUnit: string,
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

        Your ${disciplineType} discipline letter has been ${status || Status.PENDING}.

        Duration: ${duration} ${durationUnit}
        Reason: ${reason || 'N/A'}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 650,
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
        originalname: `${disciplineType}_discipline-request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}

export async function promotionPDF(
    url: string,
    employeeName: string,
    status: string,
    newPostioin: string,
    updatedAt: Date,
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

        Your Promotion letter has been ${status || Status.PENDING}.

        New Position: ${newPostioin}
        Status: ${status || 'N/A'}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 650,
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
        originalname: `${newPostioin}_promotion_request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}

export async function transferPDF(
    url: string,
    employeeName: string,
    status: string,
    destination: string,
    newPosition: string,
    reason: string,
    updatedAt: Date,
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

        Your Transfer letter has been ${status || Status.PENDING}.

        New Position: ${newPosition}
        Destination: ${destination}
        Reason: ${reason}
        Date: ${updatedAt}
        Status: ${status || 'N/A'}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 650,
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
        originalname: `${newPosition}transfer-request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}

export async function retirementPDF(
    url: string,
    employeeName: string,
    status: string,
    reason: string,
    Substitute: string,
    updatedAt: Date,
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

        Your Retirement letter has been ${status || Status.PENDING}.

        Replacement: ${Substitute}
        Reason: ${reason}
        Status: ${status || 'N/A'}
        Date: ${updatedAt}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 650,
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
        originalname: `${employeeName}_retirement_request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}

export async function retrenchmentPDF(
    url: string,
    employeeName: string,
    status: string,
    reason: string,
    retrenchmentType: RetrenchmentTypes,
    updatedAt: Date,
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

        Your ${retrenchmentType} Retrenchment letter has been ${status || Status.PENDING}.

        Reason: ${reason}
        Retrenchment Type: ${retrenchmentType}
        Status: ${status || 'N/A'}
        Date: ${updatedAt || 'N/A'}

        Best regards,
        HR Department
    `;
    firstPage.drawText(text, {
        x: 50,
        y: 650,
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
        originalname: `${employeeName}_retrenchment-request_${Date.now()}.pdf`,
        mimetype: 'application/pdf',
    };

    try {
        const uploadUrl = await fileManager.uploaderPersonalize(file); // Direct buffer upload

        return uploadUrl;
    } catch (error) {
        throw new Error("Failed to upload the file to storage");
    }
}
