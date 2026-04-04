import {
  formatBoldAmount,
  generateOrderId,
  initBoldCheckout,
  isBoldCheckoutLoaded,
} from "@/lib/boldCheckout";

const BOLD_SCRIPT_URL = "https://checkout.bold.co/library/boldPaymentButton.js";

describe("boldCheckout utils", () => {
  beforeEach(() => {
    document
      .querySelectorAll(`script[src="${BOLD_SCRIPT_URL}"]`)
      .forEach((node) => node.remove());
    delete (window as Window & { BoldCheckout?: unknown }).BoldCheckout;
    jest.restoreAllMocks();
  });

  it("generates order id with provided prefix", () => {
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
    jest.spyOn(Math, "random").mockReturnValue(0.123456);

    const id = generateOrderId("PAY");

    expect(id).toBe("PAY-1700000000000-123456");
  });

  it("formats amounts as rounded string", () => {
    expect(formatBoldAmount(1999.6)).toBe("2000");
  });

  it("reports loaded state based on window.BoldCheckout", () => {
    expect(isBoldCheckoutLoaded()).toBe(false);
    (window as Window & { BoldCheckout?: unknown }).BoldCheckout = jest.fn();
    expect(isBoldCheckoutLoaded()).toBe(true);
  });

  it("resolves immediately when script already exists and constructor is available", async () => {
    const script = document.createElement("script");
    script.src = BOLD_SCRIPT_URL;
    document.head.appendChild(script);

    (window as Window & { BoldCheckout?: unknown }).BoldCheckout = jest.fn();

    await expect(initBoldCheckout()).resolves.toBeUndefined();
  });

  it("resolves when existing script fires load event", async () => {
    const script = document.createElement("script");
    script.src = BOLD_SCRIPT_URL;
    document.head.appendChild(script);

    const loadingPromise = initBoldCheckout();
    (window as Window & { BoldCheckout?: unknown }).BoldCheckout = jest.fn();
    script.dispatchEvent(new Event("load"));

    await expect(loadingPromise).resolves.toBeUndefined();
  });

  it("rejects when existing script fires error event", async () => {
    const script = document.createElement("script");
    script.src = BOLD_SCRIPT_URL;
    document.head.appendChild(script);

    const loadingPromise = initBoldCheckout();
    script.dispatchEvent(new Event("error"));

    await expect(loadingPromise).rejects.toMatchObject({
      name: "BoldCheckoutError",
    });
  });

  it("rejects when new script loads but constructor is missing", async () => {
    const loadingPromise = initBoldCheckout();
    const script = document.querySelector(
      `script[src="${BOLD_SCRIPT_URL}"]`,
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();
    script?.onload?.(new Event("load"));

    await expect(loadingPromise).rejects.toMatchObject({
      name: "BoldCheckoutError",
    });
  });
});
