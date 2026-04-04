type MockError = { message: string; code?: string };

type SupabaseResponse<T> = {
  data: T | null;
  error: MockError | null;
};

export function supabaseOk<T>(data: T): SupabaseResponse<T> {
  return { data, error: null };
}

export function supabaseError(
  message: string,
  code?: string,
): SupabaseResponse<null> {
  return { data: null, error: { message, code } };
}

export function createSupabaseQueryBuilderMock() {
  const state = {
    singleResponse: supabaseOk<unknown>(null),
    manyResponse: supabaseOk<unknown[]>([]),
  };

  const builder = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(async () => state.manyResponse),
    single: jest.fn(async () => state.singleResponse),
    maybeSingle: jest.fn(async () => state.singleResponse),
    __setSingleResponse(response: SupabaseResponse<unknown>) {
      state.singleResponse = response;
    },
    __setManyResponse(response: SupabaseResponse<unknown[]>) {
      state.manyResponse = response;
    },
    __resolveMany: jest.fn(async () => state.manyResponse),
  };

  return builder;
}

export function createSupabaseClientMock() {
  const queryBuilder = createSupabaseQueryBuilderMock();

  return {
    auth: {
      getSession: jest.fn(async () => supabaseOk({ session: null })),
      getUser: jest.fn(async () => supabaseOk({ user: null })),
      signUp: jest.fn(async () => supabaseOk({ user: null, session: null })),
      signInWithPassword: jest.fn(async () =>
        supabaseOk({ user: null, session: null }),
      ),
      signInWithOAuth: jest.fn(async () => ({ error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      updateUser: jest.fn(async () => supabaseOk({ user: null })),
      resetPasswordForEmail: jest.fn(async () => supabaseOk({})),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => queryBuilder),
    __queryBuilder: queryBuilder,
  };
}
