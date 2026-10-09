"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "caralstable";
import { CaralIcon, CrestoneLogo } from "@/components/icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function LoginPage() {
  const { isDark, toggleDark } = useTheme();
  const [email, setEmail] = useState("jdtorres@seidoranalytics.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación o acción de inicio de sesión
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  };

  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    // Simulación de login con Microsoft SSO
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex sm:flex-col lg:flex-row bg-full overflow-x-hidden font-poppins selection:bg-info-light selection:text-info-hard">
      {/* ========================================================= */}
      {/* COLUMNA HERO: ILUSTRACIÓN DINÁMICA (LIGHT & DARK MODE)   */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-container items-center justify-center overflow-hidden ">
        <div className="relative w-full h-full min-h-screen">
          {/* Imagen para Light Mode */}
          <Image
            src={isDark ? "/loginDark.png" : "/login.png"}
            alt="Suite Ecosystem"
            fill
            className="object-cover object-center block dark:hidden"
            priority
            sizes="50vw"
          />

        </div>
      </div>

      {/* ========================================================= */}
      {/* COLUMNA DERECHA: FORMULARIO DE INICIO DE SESIÓN           */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 bg-full">
        {/* HEADER: LOGO SUPERIOR */}
        <div className="w-full flex items-center justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <CrestoneLogo size={28} accentColor="var(--color-info-main, #0191FF)" />
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-extrabold font-poppins text-neutral-900 tracking-tight">
                Crestone
              </span>
              <span className="text-2xl font-light font-poppins text-neutral-800 tracking-tight">
                Suite
              </span>
            </div>
          </Link>
        </div>

        {/* CENTRO: FORMULARIO */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* TÍTULO Y SUBTÍTULO */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-neutral-900 font-poppins tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-neutral-800 font-poppins leading-relaxed">
              Bienvenido al ecosistema de SEIDOR Analytics. Accede con tus credenciales para continuar.
            </p>
          </div>

          {/* BOTÓN MICROSOFT SSO */}
          <Button
            variant="light"
            size="lg"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full !justify-center gap-3 font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 text-neutral-900 dark:text-neutral-400"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Iniciar sesión con Microsoft</span>
          </Button>

          {/* DIVISOR CON TEXTO */}
          <div className="relative my-7 flex items-center justify-center">

            <span className="absolute px-3 bg-full text-[11px] font-bold text-neutral-800 tracking-wider uppercase font-poppins">
              O con credenciales locales
            </span>
            <div className="w-full border-t border-neutral-300" />
          </div>

          {/* FORMULARIO DE CREDENCIALES LOCALES */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Correo Electrónico */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold text-neutral-900 uppercase tracking-wider font-poppins"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@seidoranalytics.com"
                  className="w-full px-4 py-3 rounded-xl bg-container border border-neutral-300 text-neutral-900 text-sm font-medium placeholder:text-neutral-800 focus:outline-none focus:border-info-main focus:ring-2 focus:ring-info-main/20 transition-all"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-neutral-900 uppercase tracking-wider font-poppins"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-container border border-neutral-300 text-neutral-900 text-sm font-medium placeholder:text-neutral-800 focus:outline-none focus:border-info-main focus:ring-2 focus:ring-info-main/20 transition-all font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName={showPassword ? "eyeSlash" : "eye"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="!p-1.5 text-neutral-800 hover:text-neutral-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Botón: Entrar con Email */}
            <Button
              variant="info"
              size="lg"
              onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
              disabled={isLoading}
              className="w-full mt-2 font-semibold text-sm !justify-center shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Ingresando..." : "Entrar con Email"}
            </Button>
          </form>
        </div>

        {/* FOOTER: LINKS INFERIORES */}
        <div className="w-full flex items-center justify-between text-xs text-neutral-800 pt-6 border-t border-neutral-300/40">
          {/* Selector de Tema Claro / Oscuro */}
          <Button
            variant="ghost"

            iconName={isDark ? "sunBright" : "sunMoon"}
            onClick={toggleDark}
            className="!px-2.5 !py-1 text-xs text-neutral-800 hover:text-neutral-900 font-medium cursor-pointer"
            isIconButton
            title={isDark ? "Modo Claro" : "Modo Oscuro"}
          />


          <span className="text-neutral-800 font-normal">
            © 2026 SEIDOR Analytics
          </span>
        </div>
      </div>
    </div>
  );
}
