export type BoldPaymentStatus = "approved" | "rejected" | "pending";

export const boldFixtures = {
  signature: {
    success: {
      signature: "mock-signature-123",
      orderId: "ORDER-001",
      amountType: "COP",
    },
    error: {
      error: "Unable to generate integrity signature",
    },
  },
  payments: {
    approved: {
      id: "pay_approved_001",
      status: "approved",
      amount: 100000,
      currency: "COP",
    },
    rejected: {
      id: "pay_rejected_001",
      status: "rejected",
      amount: 100000,
      currency: "COP",
    },
    pending: {
      id: "pay_pending_001",
      status: "pending",
      amount: 100000,
      currency: "COP",
    },
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mockBoldSignatureSuccess() {
  return jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(jsonResponse(boldFixtures.signature.success));
}

export function mockBoldSignatureError(status = 500) {
  return jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(jsonResponse(boldFixtures.signature.error, status));
}

export function mockBoldPaymentStatus(status: BoldPaymentStatus) {
  return jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(jsonResponse(boldFixtures.payments[status]));
}
