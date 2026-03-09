describe("mobile API unit fetch", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_API_BASE_URL: "https://example.com/api/v1",
      EXPO_PUBLIC_MOBILE_APP_API_KEY: "test-mobile-key",
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("sends featured as numeric boolean when requesting latest properties", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 10,
            unit_code: "UNIT10",
            number: "10",
            status: "Available",
            location: {},
          },
        ],
      }),
    });

    const { getLatestProperties } = require("./api");

    await getLatestProperties();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];

    expect(String(url)).toContain("/units?");
    expect(String(url)).toContain("featured=1");
    expect(String(url)).toContain("per_page=5");
    expect(options.headers["X-Api-Key"]).toBe("test-mobile-key");
  });

  it("falls back to non-featured feed when featured results are empty", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 101,
              unit_code: "UNIT101",
              number: "101",
              status: "Available",
              location: {},
            },
          ],
        }),
      });

    const { getLatestProperties } = require("./api");

    const result = await getLatestProperties();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain("featured=1");
    expect(String((global.fetch as jest.Mock).mock.calls[1][0])).not.toContain("featured=");
    expect(result).toHaveLength(1);
  });

  it("sends filters with numeric booleans and paging parameters", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { getProperties } = require("./api");

    await getProperties({
      filter: "Apartment",
      query: "",
      page: 2,
      limit: 12,
      bedrooms: 2,
      bathrooms: 1,
      vacant: true,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    const requestUrl = String(url);

    expect(requestUrl).toContain("page=2");
    expect(requestUrl).toContain("per_page=12");
    expect(requestUrl).toContain("filters%5Btype%5D=Apartment");
    expect(requestUrl).toContain("filters%5Bvacant%5D=1");
    expect(requestUrl).toContain("filters%5Bbedrooms%5D=2");
    expect(requestUrl).toContain("filters%5Bbathrooms%5D=1");
    expect(requestUrl).not.toContain("featured=");
  });
});
