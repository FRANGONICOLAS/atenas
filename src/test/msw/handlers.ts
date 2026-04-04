import { http, HttpResponse } from "msw";

const paymentsById = {
  pay_approved_001: {
    id: "pay_approved_001",
    status: "approved",
    amount: 100000,
    currency: "COP",
  },
  pay_rejected_001: {
    id: "pay_rejected_001",
    status: "rejected",
    amount: 100000,
    currency: "COP",
  },
  pay_pending_001: {
    id: "pay_pending_001",
    status: "pending",
    amount: 100000,
    currency: "COP",
  },
};

export const handlers = [
  // Basic health endpoint for smoke checks.
  http.get("/health", () => {
    return HttpResponse.json({ ok: true });
  }),

  // Supabase edge function used to sign Bold checkout requests.
  http.post("*/functions/v1/bold-signature", async ({ request }) => {
    const payload = (await request.json()) as { amount?: number };
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!payload?.amount || payload.amount <= 0) {
      return HttpResponse.json(
        { error: "Invalid amount for signature generation" },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      signature: "mock-signature-123",
      orderId: "ORDER-001",
      amountType: "COP",
    });
  }),

  // Bold API payment creation simulation.
  http.post("*/payments", async ({ request }) => {
    const payload = (await request.json()) as { amount?: number };

    if (!payload?.amount) {
      return HttpResponse.json({ error: "Missing amount" }, { status: 400 });
    }

    return HttpResponse.json({
      id: "pay_pending_001",
      status: "pending",
      amount: payload.amount,
      currency: "COP",
    });
  }),

  // Bold API payment status simulation.
  http.get("*/payments/:id", ({ params }) => {
    const paymentId = String(params.id);
    const payment = paymentsById[paymentId as keyof typeof paymentsById];

    if (!payment) {
      return HttpResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return HttpResponse.json(payment);
  }),
];
