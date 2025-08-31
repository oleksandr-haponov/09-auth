"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequestData } from "@/types/note";
import { signIn } from "@/lib/api/clientApi";
import { ApiError } from "@/app/api/api";
import css from "./SignInPage.module.css";
import { useAuthStore } from "@/lib/store/authStore";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");

 // Отримуємо метод із стора
 const setUser = useAuthStore((state) => state.setUser);

  const handlerSignIn = async (formData: FormData) => {
    try {
      const formValues = Object.fromEntries(formData) as LoginRequestData;
      const result = await signIn(formValues);
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
      <form action={handlerSignIn} className={css.form}>
        <h1 className={css.formTitle}>Sign in</h1>

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
            autoComplete="current-password"
            required
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton}>
            Log in
          </button>
        </div>
        { error && <p className={css.error}>{error}</p> }
      </form>
    </main>
  );
}
