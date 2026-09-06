import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { Button } from "../components/Button";
import useViewStore from "../lib/view-manager/view-manager-store";
import type { ContactFormData } from "../lib/view-manager/view-manager-store";
import { BrandLogo } from "../components/BrandLogo";

const emptyForm: ContactFormData = {
  fullName: "",
  email: "",
  phone: "",
  acceptsCommunications: false,
};

export const FormView = () => {
  const savedForm = useViewStore((store) => store.contactFormData);
  const setContactFormData = useViewStore((store) => store.setContactFormData);
  const setView = useViewStore((store) => store.setView);
  const activeApp = useViewStore((store) => store.activeApp);
  const [formData, setFormData] = useState<ContactFormData>(
    savedForm ?? emptyForm,
  );
  const [consentError, setConsentError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewport, setViewport] = useState<{
    height: number | null;
    top: number;
    keyboardOpen: boolean;
  }>({ height: null, top: 0, keyboardOpen: false });
  const formPageRef = useRef<HTMLElement>(null);
  // La ventana visual sí se reduce cuando aparece el teclado en algunos
  // navegadores de Windows, mientras que en otros el teclado se superpone.
  // VisualViewport permite cubrir ambos casos y mantener los campos visibles.
  useEffect(() => {
    const visualViewport = window.visualViewport;
    const initialHeight = { current: visualViewport?.height ?? window.innerHeight };

    const updateViewport = () => {
      const height = visualViewport?.height ?? window.innerHeight;
      const activeElement = document.activeElement;
      const inputIsFocused =
        activeElement instanceof HTMLInputElement && activeElement.type !== "checkbox";

      const keyboardSizeDifference = initialHeight.current - height > 80;

      // No reinicia la referencia durante el cambio entre campos: Windows
      // puede emitir focusout mientras el teclado todavía está abierto.
      if (!inputIsFocused && !keyboardSizeDifference) {
        initialHeight.current = height;
      }

      setViewport({
        height,
        top: visualViewport?.offsetTop ?? 0,
        keyboardOpen: inputIsFocused && keyboardSizeDifference,
      });
    };

    updateViewport();
    visualViewport?.addEventListener("resize", updateViewport);
    visualViewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    document.addEventListener("focusin", updateViewport);
    document.addEventListener("focusout", updateViewport);

    return () => {
      visualViewport?.removeEventListener("resize", updateViewport);
      visualViewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      document.removeEventListener("focusin", updateViewport);
      document.removeEventListener("focusout", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!viewport.keyboardOpen) {
      formPageRef.current?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const activeElement = document.activeElement;
    if (
      !(activeElement instanceof HTMLInputElement) ||
      activeElement.type === "checkbox"
    ) return;

    const timer = window.setTimeout(() => {
      activeElement.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [viewport.height, viewport.keyboardOpen]);

  const keepInputVisible = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    // Espera a que Windows termine de abrir el teclado antes de recolocar el
    // campo enfocado dentro de la ventana visual disponible.
    window.setTimeout(() => {
      if (document.activeElement === input) {
        input.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    }, 250);
  };

  const focusNextField = (nextFieldId: string) => (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    document.getElementById(nextFieldId)?.focus();
  };

  const handleChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (field === "acceptsCommunications" && value) {
      setConsentError(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.acceptsCommunications) {
      setConsentError(true);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sourceApp: activeApp }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el contacto");
      }

      setContactFormData(formData);
      setView("download");
    } catch {
      setSubmitError("No pudimos guardar tus datos. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      ref={formPageRef}
      className={`contact-form-page${viewport.keyboardOpen ? " is-keyboard-open" : ""}`}
      style={
        {
          "--contact-form-viewport-height": viewport.height
            ? `${viewport.height}px`
            : undefined,
          "--contact-form-viewport-top": `${viewport.top}px`,
        } as CSSProperties
      }
    >
      <form
        className="contact-form"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <BrandLogo className="contact-form-logo" />
        <h1>
          Ingresa tus datos para
          <br />
          descargar tu caricatura.
        </h1>

        <div className="contact-form-fields">
          <div className="contact-form-field">
            <label htmlFor="fullName">Nombres y Apellidos</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
              onFocus={keepInputVisible}
              onKeyDown={focusNextField("email")}
              autoComplete="off"
              autoCapitalize="words"
              inputMode="text"
              enterKeyHint="next"
              required
            />
          </div>

          <div className="contact-form-field">
            <label htmlFor="email">Correo Electronico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              onFocus={keepInputVisible}
              onKeyDown={focusNextField("phone")}
              autoComplete="off"
              inputMode="email"
              enterKeyHint="next"
              spellCheck={false}
              required
            />
          </div>

          <div className="contact-form-field">
            <label htmlFor="phone">Numero de Celular</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              onFocus={keepInputVisible}
              autoComplete="off"
              inputMode="tel"
              enterKeyHint="done"
              required
            />
          </div>
        </div>

        <div className={`contact-form-consent ${consentError ? "has-error" : ""}`}>
          <input
            id="acceptsCommunications"
            name="acceptsCommunications"
            type="checkbox"
            checked={formData.acceptsCommunications}
            onChange={(event) =>
              handleChange("acceptsCommunications", event.target.checked)
            }
            required
          />
          <label htmlFor="acceptsCommunications">
            Acepto recibir promociones, novedades y comunicaciones publicitarias de
            SANTA CLARA por correo electrónico, llamados o WhatsApp.
          </label>
        </div>
        {consentError && (
          <p className="contact-form-error" role="alert">
            Debes aceptar para continuar.
          </p>
        )}
        {submitError && (
          <p className="contact-form-error" role="alert">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          className="contact-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Siguiente"}
        </Button>
      </form>
    </main>
  );
};
