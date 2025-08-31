"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterRequestData } from "@/types/note";
import { ApiError } from "@/app/api/api";
import { signUp } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./SignUpPage.module.css";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");

  // Отримуємо метод із стора
  const setUser = useAuthStore((state) => state.setUser);

  const handlerSignUp = async (formData: FormData) => {
    try {
      const formValues = Object.fromEntries(formData) as RegisterRequestData;
      const result = await signUp(formValues);


      if (result) {
        // Записуємо користувача у глобальний стан
        setUser(result);
        router.push("/profile");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError(
        (error as ApiError).response?.data?.error ??
          (error as ApiError).message ??
          "Oops... some error"
      );
    }
  };

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>
      <form action={handlerSignUp} className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton}>
            Register
          </button>
        </div>
        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  );
}
