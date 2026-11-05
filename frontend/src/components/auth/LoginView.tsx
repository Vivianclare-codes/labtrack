"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOSPITAL_NAME } from "@/app/lib/hospital";

export default function LoginView() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email address and password.");
      return;
    }

    setError("");

    // Demo navigation only. Real authentication will be added later.
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] px-5 py-10">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#142E3D]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M9 3h6M10 3v6.2L5.5 17a2.7 2.7 0 0 0 2.3 4h8.4a2.7 2.7 0 0 0 2.3-4L14 9.2V3"
                stroke="#9BD3C2"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 15h8"
                stroke="#9BD3C2"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-[21px] font-semibold tracking-tight text-[#203540]">
            LabTrack
          </h1>

          <p className="mt-1 text-xs text-[#718089]">
            {HOSPITAL_NAME} / Laboratory services
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-[10px] border border-[#E1E7E5] bg-white p-6 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold tracking-tight text-[#203540]">
              Welcome back
            </h2>

            <p className="mt-2 text-[13px] leading-5 text-[#718089]">
              Sign in to access your laboratory workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-[#203540]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@hospital.com"
                className="h-[46px] w-full rounded-lg border border-[#E1E7E5] bg-white px-3 text-[13px] text-[#203540] outline-none transition focus:border-[#24776D] focus:ring-2 focus:ring-[#24776D]/10"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-[#203540]"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    alert("Password recovery will be available after authentication is connected.")
                  }
                  className="text-[11px] font-medium text-[#24776D] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-[46px] w-full rounded-lg border border-[#E1E7E5] bg-white px-3 pr-20 text-[13px] text-[#203540] outline-none transition focus:border-[#24776D] focus:ring-2 focus:ring-[#24776D]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 text-[11px] font-medium text-[#718089] hover:text-[#24776D]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember device */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(event) => setRememberDevice(event.target.checked)}
                className="h-4 w-4 rounded border-[#E1E7E5] accent-[#24776D]"
              />

              <span className="text-xs text-[#718089]">
                Remember this device
              </span>
            </label>

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-[#F0D4D4] bg-[#FAEEEE] px-3 py-2.5 text-xs text-[#AB4D4D]"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="flex h-[46px] w-full items-center justify-center rounded-lg bg-[#24776D] text-[13px] font-semibold text-white transition hover:bg-[#1D625A] focus:outline-none focus:ring-2 focus:ring-[#24776D]/30 focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 border-t border-[#E1E7E5] pt-5">
            <p className="text-center text-[11px] leading-5 text-[#718089]">
              Demo interface. Authentication and account recovery are not
              connected yet.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-[#718089]">
          © 2026 LabTrack · {HOSPITAL_NAME}
        </p>
      </div>
    </main>
  );
}