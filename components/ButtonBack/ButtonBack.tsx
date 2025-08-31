"use client"

import { useRouter } from "next/router"
import css from "@/components/ButtonBack/ButtonBack.module.css";


export default function ButtonBack ({children}:{children:React.ReactNode}) {

 const router =useRouter();
 const handleBack = () => {
  router.back()
 }
 return (
  <button className={css.backBtn} onClick={handleBack}>{children}</button>
 )
}