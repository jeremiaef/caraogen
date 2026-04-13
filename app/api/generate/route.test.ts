import { describe, it, expect } from "vitest";

describe("POST /api/generate", () => {
  it("returns 400 when story is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("story");
  });

  it("returns 400 when tone is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: "Hello world", tone: "not-a-tone" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("tone");
  });

  it("returns 400 when aspectRatio is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: "Hello", aspectRatio: "16:9" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("aspectRatio");
  });
});
