import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useSiteContent,
  useSiteContentBySection,
  useSiteContents,
  useSiteContentsByKeys,
} from "@/hooks/useSiteContent";

const getContentByKeyMock = jest.fn();
const getContentsBySectionMock = jest.fn();
const getContentsByKeysMock = jest.fn();

jest.mock("@/api/services", () => ({
  contentService: {
    getContentByKey: (...args: unknown[]) => getContentByKeyMock(...args),
    getContentsBySection: (...args: unknown[]) =>
      getContentsBySectionMock(...args),
    getContentsByKeys: (...args: unknown[]) => getContentsByKeysMock(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 1,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSiteContent hooks unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns content and imageUrl from useSiteContent", async () => {
    getContentByKeyMock.mockResolvedValueOnce({
      content_key: "home_hero",
      public_url: "https://cdn.test/home-hero.png",
    });

    const { result } = renderHook(() => useSiteContent("home_hero"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.content_key).toBe("home_hero");
    expect(result.current.imageUrl).toBe("https://cdn.test/home-hero.png");
    expect(result.current.error).toBeNull();
  });

  it("uses fallback image url when content has no public_url", async () => {
    getContentByKeyMock.mockResolvedValueOnce(null);

    const { result } = renderHook(
      () => useSiteContent("home_hero", "https://fallback.test/fallback.png"),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBeNull();
    expect(result.current.imageUrl).toBe("https://fallback.test/fallback.png");
  });

  it("returns query error in useSiteContent", async () => {
    getContentByKeyMock.mockRejectedValue(new Error("content failed"));

    const { result } = renderHook(() => useSiteContent("home_hero"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("content failed");
  });

  it("loads contents by section", async () => {
    getContentsBySectionMock.mockResolvedValueOnce([
      { content_key: "home_hero", public_url: "https://cdn.test/h1.png" },
      { content_key: "home_banner", public_url: "https://cdn.test/h2.png" },
    ]);

    const { result } = renderHook(() => useSiteContentBySection("home"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contents).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("returns query error in useSiteContentBySection", async () => {
    getContentsBySectionMock.mockRejectedValueOnce(new Error("section failed"));

    const { result } = renderHook(() => useSiteContentBySection("home"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contents).toEqual([]);
    expect(result.current.error?.message).toBe("section failed");
  });

  it("builds dataMap and imageMap in useSiteContents", async () => {
    getContentByKeyMock.mockImplementation(async (key: string) => {
      if (key === "home_hero") {
        return { content_key: key, public_url: "https://cdn.test/hero.png" };
      }
      return null;
    });

    const { result } = renderHook(
      () => useSiteContents(["home_hero", "about_banner"]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dataMap.home_hero?.content_key).toBe("home_hero");
    expect(result.current.dataMap.about_banner).toBeNull();
    expect(result.current.imageMap.home_hero).toBe("https://cdn.test/hero.png");
    expect(result.current.imageMap.about_banner).toBe("");
    expect(result.current.error).toBeNull();
  });

  it("returns first query error in useSiteContents", async () => {
    getContentByKeyMock.mockImplementation(async (key: string) => {
      if (key === "home_hero") {
        return {
          content_key: "home_hero",
          public_url: "https://cdn.test/hero.png",
        };
      }
      throw new Error("second key failed");
    });

    const { result } = renderHook(
      () => useSiteContents(["home_hero", "about_banner"]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("second key failed");
  });

  it("builds maps with useSiteContentsByKeys", async () => {
    getContentsByKeysMock.mockResolvedValueOnce([
      { content_key: "home_hero", public_url: "https://cdn.test/hero.png" },
      {
        content_key: "about_banner",
        public_url: "https://cdn.test/about-banner.png",
      },
    ]);

    const { result } = renderHook(
      () => useSiteContentsByKeys(["home_hero", "about_banner"]),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dataMap.home_hero?.content_key).toBe("home_hero");
    expect(result.current.imageMap.about_banner).toBe(
      "https://cdn.test/about-banner.png",
    );
    expect(result.current.error).toBeNull();
  });

  it("does not query when keys are empty in useSiteContentsByKeys", async () => {
    const { result } = renderHook(() => useSiteContentsByKeys([]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getContentsByKeysMock).not.toHaveBeenCalled();
    expect(result.current.dataMap).toEqual({});
    expect(result.current.imageMap).toEqual({});
  });

  it("returns query error in useSiteContentsByKeys", async () => {
    getContentsByKeysMock.mockRejectedValueOnce(new Error("keys failed"));

    const { result } = renderHook(() => useSiteContentsByKeys(["home_hero"]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("keys failed");
  });
});
