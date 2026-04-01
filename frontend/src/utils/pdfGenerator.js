import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePrescriptionPDF = (record) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 37, 68); // Dark blue from HMS theme
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('HOSPITAL MANAGEMENT SYSTEM', 20, 20);
  doc.setFontSize(10);
  doc.text('Digital Health Record · Prescription Seva', 20, 30);

  // Patient & Doctor Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${record.patient?.user?.name || 'N/A'}`, 20, 62);
  doc.text(`Patient Code: ${record.patient?.patientCode || 'N/A'}`, 20, 68);
  doc.text(`Date: ${new Date(record.createdAt).toLocaleDateString()}`, 20, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('DOCTOR INFORMATION', pageWidth / 2 + 10, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dr. ${record.doctor?.user?.name || 'N/A'}`, pageWidth / 2 + 10, 62);
  doc.text(`Specialty: ${record.doctor?.specialty || 'General'}`, pageWidth / 2 + 10, 68);
  doc.text(`License: ${record.doctor?.licenseNumber || 'N/A'}`, pageWidth / 2 + 10, 74);

  // Diagnosis
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 80, pageWidth - 20, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSIS & SYMPTOMS', 20, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Symptoms: ${record.symptoms || 'Not specified'}`, 20, 97, { maxWidth: pageWidth - 40 });
  doc.text(`Diagnosis: ${record.diagnosis || 'General Observation'}`, 20, 105, { maxWidth: pageWidth - 40 });

  // Prescriptions Table
  if (record.prescriptions && record.prescriptions.length > 0) {
    doc.autoTable({
      startY: 115,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: record.prescriptions.map(p => [
        p.medicineName,
        p.dosage,
        p.frequency,
        `${p.durationDays} Days`,
        p.instructions || 'As directed'
      ]),
      headStyles: { fillStyle: [15, 37, 68], textColor: [255, 255, 255] },
      margin: { left: 20, right: 20 }
    });
  }

  // Advice
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DOCTOR\'S ADVICE', 20, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(record.advice || 'Follow-up as needed.', 20, finalY + 7, { maxWidth: pageWidth - 40 });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated prescription and does not require a physical signature.', pageWidth / 2, 285, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 290, { align: 'center' });

  // Save
  doc.save(`Prescription_${record.patient?.user?.name || 'Patient'}_${new Date().toISOString().slice(0,10)}.pdf`);
};
