import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { FormField, Button } from "../ui";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {};
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(values.email)) newErrors.email = "Enter a valid email";
    if (!values.password) newErrors.password = "Password is required";
    else if (values.password.length < 6) newErrors.password = "Use at least 6 characters";
    if (values.confirmPassword !== values.password) newErrors.confirmPassword = "Passwords don't match";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setSubmitting(true);
    try {
      await register(values.name, values.email, values.password);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(202,170,152,0.28),_transparent_38%),linear-gradient(180deg,_#202940_0%,_#4B4038_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-[#fff7f0]/95 p-8 text-[var(--brand-ink)] shadow-2xl shadow-black/25 backdrop-blur">
          <div className="mb-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-wood)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-ink)] text-white shadow-lg shadow-black/20">▣</span>
            <span>Taskline</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-ink)]">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--brand-wood)]/85">Takes less than a minute.</p>

          {serverError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} placeholder="Syed Turrab Haider" autoFocus />
            <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
            <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} placeholder="At least 6 characters" />
            <FormField label="Confirm password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Re-enter your password" />
            <Button type="submit" variant="primary" fullWidth loading={submitting}>Create account</Button>
          </form>

          <p className="mt-6 text-sm text-[var(--brand-wood)]/85">
            Already have an account? <Link to="/login" className="font-medium text-[var(--brand-wood)] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
