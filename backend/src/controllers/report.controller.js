import { prisma } from '../config/database.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload report - supports both Cloudinary and local storage
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    let fileUrl;
    let cloudinaryId;

    // Use Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `hms/reports/${patient.patientCode}`,
              resource_type: 'auto',
              format: req.file.mimetype.includes('pdf') ? 'pdf' : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        fileUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage
        fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
        cloudinaryId = `local_${Date.now()}`;
      }
    } else {
      // Local storage fallback
      fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
      cloudinaryId = `local_${Date.now()}`;
    }

    const report = await prisma.report.create({
      data: {
        patientId:    patient.id,
        title:        req.body.title || req.file.originalname,
        fileUrl,
        cloudinaryId,
        reportType:   req.body.reportType || 'OTHER',
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ error: 'Failed to upload report' });
  }
};

// Get patient's reports
export const getPatientReports = async (req, res) => {
  try {
    let patientId = req.params.patientId;
    if (!patientId) {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      patientId = patient?.id;
    }
    if (!patientId) return res.status(404).json({ error: 'Not found' });

    const reports = await prisma.report.findMany({
      where: { patientId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Delete report (patient only, own report)
export const deleteReport = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    const report = await prisma.report.findFirst({
      where: { id: req.params.id, patientId: patient.id },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // Delete from Cloudinary if configured and not a local file
    if (isCloudinaryConfigured() && !report.cloudinaryId.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(report.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with DB deletion even if Cloudinary delete fails
      }
    }

    await prisma.report.delete({ where: { id: report.id } });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};