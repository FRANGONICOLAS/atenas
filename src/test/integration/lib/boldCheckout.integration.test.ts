import { initBoldCheckout, isBoldCheckoutLoaded } from "@/lib/boldCheckout";

const BOLD_SCRIPT_URL = "https://checkout.bold.co/library/boldPaymentButton.js";

describe("boldCheckout integration", () => {
  beforeEach(() => {
    document
      .querySelectorAll(`script[src="${BOLD_SCRIPT_URL}"]`)
      .forEach((node) => node.remove());
    delete (window as Window & { BoldCheckout?: unknown }).BoldCheckout;
  });

  it("resolves when script load event sets BoldCheckout constructor", async () => {
    const loadingPromise = initBoldCheckout();

    const script = document.querySelector(
      `script[src="${BOLD_SCRIPT_URL}"]`,
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    (window as Window & { BoldCheckout?: unknown }).BoldCheckout = jest.fn();
    script?.onload?.(new Event("load"));

    await expect(loadingPromise).resolves.toBeUndefined();
    expect(isBoldCheckoutLoaded()).toBe(true);
  });

  it("rejects when script triggers error event", async () => {
    const loadingPromise = initBoldCheckout();

    const script = document.querySelector(
      `script[src="${BOLD_SCRIPT_URL}"]`,
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    script?.onerror?.(new Event("error"));

    await expect(loadingPromise).rejects.toMatchObject({
      name: "BoldCheckoutError",
    });
  });
});
