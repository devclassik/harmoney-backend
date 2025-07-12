# Document Routes - Sample Payloads

This document contains sample request payloads for all document-related API endpoints.

## Available Document Types
- `PDV` (PDF)
- `XLS` (Excel)
- `XLSX` (Excel)
- `DOC` (Word Document)
- `JPG` (JPEG Image)
- `PNG` (PNG Image)

---

## 1. Create Document
**POST** `/document`

### Request Body
```json
{
  "documentId": "DOC-2024-001",
  "name": "Employee Handbook 2024",
  "downloadUrl": "https://example.com/documents/employee-handbook-2024.pdf",
  "type": "PDV"
}
```

### Minimal Required Payload
```json
{
  "name": "Employee Handbook 2024",
  "downloadUrl": "https://example.com/documents/employee-handbook-2024.pdf"
}
```

### Sample with Different Document Types
```json
{
  "name": "Monthly Report March 2024",
  "downloadUrl": "https://example.com/reports/monthly-report-march-2024.xlsx",
  "type": "XLSX"
}
```

---

## 2. Update Document
**PUT** `/document/:id`

### URL Parameters
- `id`: Document ID (number, positive integer)

### Request Body (All fields optional)
```json
{
  "documentId": "DOC-2024-001-UPDATED",
  "name": "Updated Employee Handbook 2024",
  "downloadUrl": "https://example.com/documents/updated-employee-handbook-2024.pdf",
  "type": "PDV"
}
```

### Partial Update Example
```json
{
  "name": "Updated Employee Handbook 2024"
}
```

---

## 3. Get Document
**GET** `/document/:id`

### URL Parameters
- `id`: Document ID (number, positive integer)

### Example Request
```
GET /document/123
```

### No request body required

---

## 4. Get All Documents
**GET** `/document`

### Query Parameters (All optional)
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `type`: Filter by document type
- `name`: Filter by document name

### Example Requests

#### Basic Request
```
GET /document
```

#### With Pagination
```
GET /document?page=2&limit=20
```

#### With Type Filter
```
GET /document?type=PDV
```

#### With Name Filter
```
GET /document?name=handbook
```

#### Combined Filters
```
GET /document?page=1&limit=15&type=XLSX&name=report
```

---

## 5. Delete Document
**DELETE** `/document/:id`

### URL Parameters
- `id`: Document ID (number, positive integer)

### Example Request
```
DELETE /document/123
```

### No request body required

---

## Authentication

All endpoints require authentication. Include the authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Examples

### Successful Create/Update Response
```json
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "id": 123,
    "documentId": "DOC-2024-001",
    "name": "Employee Handbook 2024",
    "downloadUrl": "https://example.com/documents/employee-handbook-2024.pdf",
    "type": "PDV",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Documents Response
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "id": 123,
        "documentId": "DOC-2024-001",
        "name": "Employee Handbook 2024",
        "downloadUrl": "https://example.com/documents/employee-handbook-2024.pdf",
        "type": "PDV",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## Error Response Examples

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "downloadUrl",
      "message": "Download URL must be a valid URI"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Document not found"
}
```

### Unauthorized Error
```json
{
  "success": false,
  "message": "Unauthorized access"
}
``` 