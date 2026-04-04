import {
  getErrorMessage,
  handleAuthError,
  handleValidationError,
} from "@/lib/errorHandler";
import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("errorHandler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns message from native Error", () => {
    const result = getErrorMessage(new Error("Network timeout"));

    expect(result).toBe("Network timeout");
  });

  it("returns string errors as-is", () => {
    expect(getErrorMessage("Forbidden")).toBe("Forbidden");
  });

  it("returns fallback message for unknown values", () => {
    expect(getErrorMessage({})).toBe("Ha ocurrido un error inesperado");
  });

  it("maps known Supabase auth error messages", () => {
    expect(getErrorMessage(new AuthError("Invalid login credentials"))).toBe(
      "Credenciales incorrectas. Por favor verifica tu email y contraseña.",
    );
    expect(getErrorMessage(new AuthError("Email not confirmed"))).toBe(
      "Por favor confirma tu email antes de iniciar sesión.",
    );
    expect(getErrorMessage(new AuthError("User already registered"))).toBe(
      "Este correo electrónico ya está registrado.",
    );
  });

  it("returns original message for unknown Supabase auth errors", () => {
    expect(getErrorMessage(new AuthError("Custom auth failure"))).toBe(
      "Custom auth failure",
    );
  });

  it("sends auth error message to toast", () => {
    handleAuthError(new Error("Invalid login credentials"));

    expect(toast.error).toHaveBeenCalledWith("Invalid login credentials");
  });

  it("sends each validation issue to toast", () => {
    handleValidationError({
      errors: [{ message: "Campo requerido" }, { message: "Email invalido" }],
    });

    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledWith("Campo requerido");
    expect(toast.error).toHaveBeenCalledWith("Email invalido");
  });

  it("falls back to generic error handling when validation shape is invalid", () => {
    handleValidationError("validation failed");

    expect(toast.error).toHaveBeenCalledWith("validation failed");
  });
});
