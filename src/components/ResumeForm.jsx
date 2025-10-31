"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResumeStore } from "@/store/useResumeStore";
import LanguageSelector from "@/components/LanguageSelector";
import AutoTextarea from "@/components/AutoTextarea";

const schema = z.object({
  company: z.string().min(1),
  recipients: z.string().optional(),
  jobTitle: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal("")),
  jobDescription: z.string().min(10),
  cvLanguage: z.enum(["ro", "en", "it"]),
  name: z.string().min(1),
  role: z.string().min(1),
  professionalSummary: z.string().min(10),
  email: z.string().email(),
  phone: z.string().min(3),
  location: z.string().min(1),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  skills: z.string().optional(),
  driverLicense: z.string().optional(),
  other: z.string().optional(),
});

export default function ResumeForm({ onAdapt }) {
  const { resume, setField } = useResumeStore();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      company: resume.company,
      recipients: (resume.recipients || []).join(", "),
      jobTitle: resume.jobTitle,
      jobUrl: resume.jobUrl || "",
      jobDescription: resume.jobDescription,
      cvLanguage: resume.cvLanguage,
      name: resume.name,
      role: resume.role,
      professionalSummary: resume.professionalSummary,
      email: resume?.contact?.email || "",
      phone: resume?.contact?.phone || "",
      location: resume?.contact?.location || "",
      linkedin: resume?.contact?.linkedin || "",
      website: resume?.contact?.website || "",
      github: resume?.contact?.github || "",
      skills: (resume.skills || []).join(", "),
      driverLicense: resume.driverLicense || "",
      other: resume.other || "",
    },
  });

  const onSubmit = (values) => {
    setField("company", values.company);
    setField("recipients", values.recipients ? values.recipients.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setField("jobTitle", values.jobTitle);
    setField("jobUrl", values.jobUrl || "");
    setField("jobDescription", values.jobDescription);
    setField("cvLanguage", values.cvLanguage);
    setField("name", values.name);
    setField("role", values.role);
    setField("professionalSummary", values.professionalSummary);
    setField("contact", {
      email: values.email,
      phone: values.phone,
      location: values.location,
      linkedin: values.linkedin || "",
      website: values.website || "",
      github: values.github || "",
    });
    setField("skills", values.skills ? values.skills.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setField("driverLicense", values.driverLicense || "");
    setField("other", values.other || "");
    onAdapt();
  };

  // Live sync store on form changes (debounced by RHF internal batching)
  form.watch((values) => {
    // update only lightweight fields to avoid excessive writes
    setField("company", values.company);
    setField("recipients", values.recipients ? values.recipients.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setField("jobTitle", values.jobTitle);
    setField("jobUrl", values.jobUrl || "");
    setField("jobDescription", values.jobDescription);
    setField("cvLanguage", values.cvLanguage);
    setField("name", values.name);
    setField("role", values.role);
    setField("professionalSummary", values.professionalSummary);
    setField("contact", {
      email: values.email,
      phone: values.phone,
      location: values.location,
      linkedin: values.linkedin || "",
      website: values.website || "",
      github: values.github || "",
    });
    setField("skills", values.skills ? values.skills.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setField("driverLicense", values.driverLicense || "");
    setField("other", values.other || "");
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Compania</label>
          <input className="input" {...form.register("company")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Destinatari (virgule)</label>
          <input className="input" {...form.register("recipients")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Titlu job</label>
          <input className="input" {...form.register("jobTitle")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Link job (LinkedIn)</label>
          <input className="input" {...form.register("jobUrl")} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Descriere job (de pe LinkedIn)</label>
        <AutoTextarea rows={4} value={form.watch("jobDescription") || ""} onChange={(v) => form.setValue("jobDescription", v)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Limbă CV</label>
          <LanguageSelector value={form.watch("cvLanguage")} onChange={(l) => form.setValue("cvLanguage", l)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Rol</label>
          <input className="input" {...form.register("role")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nume</label>
          <input className="input" {...form.register("name")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Rezumat profesional</label>
          <AutoTextarea rows={3} value={form.watch("professionalSummary") || ""} onChange={(v) => form.setValue("professionalSummary", v)} className="textarea" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="input" {...form.register("email")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input className="input" {...form.register("phone")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Locație</label>
          <input className="input" {...form.register("location")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">LinkedIn</label>
          <input className="input" {...form.register("linkedin")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Website</label>
          <input className="input" {...form.register("website")} />
        </div>
        <div>
          <label className="block text-sm font-medium">GitHub</label>
          <input className="input" {...form.register("github")} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Skills (virgule)</label>
        <input className="input" {...form.register("skills")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Permis auto</label>
          <input className="input" {...form.register("driverLicense")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Altele</label>
          <AutoTextarea rows={2} value={form.watch("other") || ""} onChange={(v) => form.setValue("other", v)} className="textarea" />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">Adaptează CV</button>
      </div>
    </form>
  );
}


