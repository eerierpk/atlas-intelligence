import type { ComboOption } from "@/components/ui/searchable-combobox";

const PHYSICIAN = [
  "Allergy and Immunology", "Anesthesiology", "Colon and Rectal Surgery", "Dermatology",
  "Emergency Medicine", "Family Medicine", "Internal Medicine", "Medical Genetics and Genomics",
  "Neurological Surgery", "Nuclear Medicine", "Obstetrics and Gynecology", "Ophthalmology",
  "Orthopaedic Surgery", "Otolaryngology – Head and Neck Surgery", "Pathology", "Pediatrics",
  "Physical Medicine and Rehabilitation", "Plastic Surgery", "Preventive Medicine",
  "Psychiatry and Neurology", "Radiology", "Surgery (General Surgery)", "Thoracic Surgery",
  "Urology", "Vascular Surgery",
];

const SUBSPECIALTY = [
  "Adult Congenital Heart Disease", "Advanced Heart Failure and Transplant Cardiology",
  "Cardiovascular Disease", "Clinical Cardiac Electrophysiology", "Interventional Cardiology",
  "Gastroenterology", "Transplant Hepatology", "Nephrology", "Pulmonary Disease",
  "Critical Care Medicine", "Infectious Disease", "Rheumatology",
  "Endocrinology, Diabetes and Metabolism", "Geriatric Medicine", "Hematology",
  "Medical Oncology", "Sleep Medicine", "Pain Medicine", "Sports Medicine",
  "Hospice and Palliative Medicine", "Neurocritical Care", "Medical Toxicology",
  "Gynecologic Oncology", "Maternal–Fetal Medicine", "Reproductive Endocrinology and Infertility",
  "Orthopaedic Sports Medicine", "Hand Surgery", "Plastic Surgery Within the Head and Neck",
  "Neurotology", "Interventional Radiology", "Diagnostic Radiology", "Radiation Oncology",
  "Neurology", "Child and Adolescent Psychiatry", "Addiction Psychiatry", "Geriatric Psychiatry",
];

const ALLIED = [
  "Diagnostic Medical Physicist", "Medical Physicist (Therapy)", "Radiation Therapist",
  "Radiologic Technologist / Radiographer", "MRI Technologist", "CT Technologist",
  "Ultrasound Sonographer", "Nuclear Medicine Technologist", "Cardiovascular Technologist",
  "Biomedical / Clinical Engineer", "Clinical Informatics", "Health Information Management",
  "Perioperative Services Leadership", "Imaging Services Director / Manager",
  "Materials Management / Supply Chain", "Value Analysis", "Capital Planning / Finance",
  "IT / Cybersecurity (Healthcare)", "Procurement / Sourcing", "Quality / Patient Safety",
  "Research Operations",
];

export const SPECIALIZATION_OPTIONS: ComboOption[] = [
  ...PHYSICIAN.map(s => ({ value: s, label: s, group: "Physician — broad specialties" })),
  ...SUBSPECIALTY.map(s => ({ value: s, label: s, group: "Common subspecialties" })),
  ...ALLIED.map(s => ({ value: s, label: s, group: "Allied health & operations" })),
];

export const GENDER_OPTIONS: ComboOption[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Do not want to specify", label: "Do not want to specify" },
];
