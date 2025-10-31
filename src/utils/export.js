import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportResumeAsPDF(element, filename) {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = heightLeft - imgHeight;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export async function exportResumeAsDOCX(resume, filename) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: resume.name, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: resume.role, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: resume.professionalSummary || "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Contact", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: `${resume?.contact?.email || ""} | ${resume?.contact?.phone || ""} | ${resume?.contact?.location || ""}` }),
          ...(resume?.contact?.linkedin ? [new Paragraph({ text: `LinkedIn: ${resume.contact.linkedin}` })] : []),
          ...(resume?.contact?.website ? [new Paragraph({ text: `Website: ${resume.contact.website}` })] : []),
          ...(resume?.contact?.github ? [new Paragraph({ text: `GitHub: ${resume.contact.github}` })] : []),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Work Experience", heading: HeadingLevel.HEADING_3 }),
          ...(resume.workExperience || []).flatMap((w) => [
            new Paragraph({ children: [new TextRun({ text: `${w.role} - ${w.company}`, bold: true })] }),
            new Paragraph({ text: `${w.startDate} - ${w.endDate}` }),
            new Paragraph({ text: w.description || "" }),
            new Paragraph({ text: "" }),
          ]),
          new Paragraph({ text: "Academic History", heading: HeadingLevel.HEADING_3 }),
          ...(resume.academicHistory || []).flatMap((a) => [
            new Paragraph({ children: [new TextRun({ text: `${a.degree} - ${a.institution}`, bold: true })] }),
            new Paragraph({ text: `${a.startDate} - ${a.endDate}` }),
            ...(a.details ? [new Paragraph({ text: a.details })] : []),
            new Paragraph({ text: "" }),
          ]),
          new Paragraph({ text: "Certifications", heading: HeadingLevel.HEADING_3 }),
          ...(resume.certifications || []).flatMap((c) => [
            new Paragraph({ text: `${c.name} - ${c.issuer} (${c.date})` }),
            ...(c.credentialId ? [new Paragraph({ text: `ID: ${c.credentialId}` })] : []),
            ...(c.url ? [new Paragraph({ text: c.url })] : []),
          ]),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: (resume.skills || []).join(", ") }),
          ...(resume.driverLicense ? [new Paragraph({ text: "" }), new Paragraph({ text: `Driver License: ${resume.driverLicense}` })] : []),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Languages", heading: HeadingLevel.HEADING_3 }),
          ...((resume.languages || []).map((l) => new Paragraph({ text: `${l.name}: ${l.level}` }))),
          ...(resume.other ? [new Paragraph({ text: "" }), new Paragraph({ text: "Other", heading: HeadingLevel.HEADING_3 }), new Paragraph({ text: resume.other })] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}


