"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function validationText(input: HTMLInputElement) {
  const validity = input.validity;
  if (validity.valid) return "";
  if (validity.valueMissing) return "Completa este campo.";
  if (validity.typeMismatch && input.type === "email") return "Escribe un correo válido, por ejemplo nombre@correo.com.";
  if (validity.rangeUnderflow) return `El valor mínimo es ${input.min}.`;
  if (validity.rangeOverflow) return `El valor máximo es ${input.max}.`;
  if (validity.stepMismatch) return input.step === "1" ? "Escribe una cantidad entera." : "Revisa los decimales de este valor.";
  if (validity.tooShort) return `Escribe al menos ${input.minLength} caracteres.`;
  if (validity.tooLong) return `Usa hasta ${input.maxLength} caracteres.`;
  if (validity.patternMismatch) return input.type === "tel" ? "Usa números y, si lo necesitas, el prefijo del país." : "Revisa el formato de este campo.";
  return "Revisa este dato antes de guardar.";
}

function Input({ className, type, onInvalid, onBlur, onChange, "aria-describedby": describedBy, "aria-invalid": invalid, ...props }: React.ComponentProps<"input">) {
  const [message, setMessage] = React.useState("");
  const generatedId = React.useId();
  const errorId = (props.id || generatedId) + "-error";
  return <>
    <InputPrimitive {...props} type={type} data-slot="input"
      aria-invalid={invalid || !!message || undefined}
      aria-describedby={[describedBy, message ? errorId : undefined].filter(Boolean).join(" ") || undefined}
      className={cn("h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-400 aria-invalid:ring-2 aria-invalid:ring-rose-400/15 md:text-sm dark:bg-input/20", className)}
      onInvalid={event => {
        event.preventDefault();
        setMessage(validationText(event.currentTarget));
        if (event.currentTarget.form?.querySelector(":invalid") === event.currentTarget) event.currentTarget.focus();
        onInvalid?.(event);
      }}
      onBlur={event => { setMessage(validationText(event.currentTarget)); onBlur?.(event); }}
      onChange={event => { if (message) setMessage(validationText(event.currentTarget)); onChange?.(event); }}
    />
    {message && <span id={errorId} role="alert" className="block text-xs leading-5 text-rose-300">{message}</span>}
  </>;
}
export { Input };
