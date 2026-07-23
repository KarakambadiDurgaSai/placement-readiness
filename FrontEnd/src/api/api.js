const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/* =======================
   REGISTER
======================= */ 
export const registerUser = async (data) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registration failed");
  return result;
};

/* =======================
   LOGIN
======================= */
export const loginUser = async (data) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  return result;
};

/* =======================
   STUDENT PROFILE
======================= */
export const createStudentProfile = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/student/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Student profile failed");
  return result;
};

export const updateStudentProfile = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/student/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Profile update failed");
  return result;
};

/* =======================
   COMPANY PROFILE
======================= */
export const createCompanyProfile = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/company/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Company profile failed");
  return result;
};

export const getMyCompanyProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/company/me`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch company profile");
  }

  return res.json();
};

/* =======================
   OTP FUNCTIONS (DISABLED)
======================= */

/*

export const sendCollegeOtp = async (email) => {
  const res = await fetch(`${API_BASE_URL}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeEmail: email }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send OTP");
  return result;
};

export const sendCompanyOtp = async (email) => {
  const res = await fetch(`${API_BASE_URL}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeEmail: email }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send OTP");
  return result;
};

export const verifyCollegeOtp = async (email, otp) => {
  const res = await fetch(`${API_BASE_URL}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      otp,
      role: "student",
    }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "OTP verification failed");
  return result;
};

export const verifyCompanyOtp = async (email, otp) => {
  const res = await fetch(`${API_BASE_URL}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      otp,
      role: "company",
    }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "OTP verification failed");
  return result;
};

*/

/* =======================
   COMPLAINT (STUDENT)
======================= */
export const submitComplaint = async (companyId, reason) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/complaint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ companyId, reason }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

/* =======================
   PASSWORD RESET 
======================= */

export const forgotPassword = async (data) => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send OTP");
  return result;
};

export const resetPassword = async (data) => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Password reset failed");
  return result;
};