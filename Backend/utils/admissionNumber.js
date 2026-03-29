const Applicant = require("../models/Applicant");
const Program = require("../models/Program");

/**
 * Generate unique admission number
 * Format: INST/{YEAR}/{COURSE_TYPE}/{PROGRAM_CODE}/{QUOTA}/{SERIAL}
 * Example: INST/2026/UG/CSE/KCET/0001
 */
const generateAdmissionNumber = async (applicant, program) => {
  const year = new Date().getFullYear();
  const confirmedCount = await Applicant.countDocuments({
    program: program._id,
    admissionStatus: "Confirmed",
  });
  const serial = String(confirmedCount + 1).padStart(4, "0");
  return `INST/${year}/${program.courseType}/${program.code}/${applicant.quotaType}/${serial}`;
};

module.exports = { generateAdmissionNumber };
