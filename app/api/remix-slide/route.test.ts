import { describe, it, expect } from "vitest";

describe("POST /api/remix-slide", () => {
  it("returns 400 when slideIndex is out of range", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story: "Hello world",
        slideIndex: 7,
        slideType: "hook",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("slideIndex");
  });

  it("returns 400 when slideType is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story: "Hello world",
        slideIndex: 1,
        slideType: "not-a-type",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("slideType");
  });

  it("returns 400 when story is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideIndex: 1, slideType: "hook" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("story");
  });
});
