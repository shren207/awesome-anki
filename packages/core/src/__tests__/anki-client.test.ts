import { afterEach, describe, expect, it } from "bun:test";
import { ankiConnect } from "../anki/client.js";
import { AnkiConnectError, TimeoutError } from "../errors.js";

describe("ankiConnect 타임아웃 및 에러 처리", () => {
  let server: ReturnType<typeof Bun.serve> | null = null;
  const originalUrl = process.env.ANKI_CONNECT_URL;

  afterEach(() => {
    server?.stop(true);
    server = null;
    if (originalUrl === undefined) {
      delete process.env.ANKI_CONNECT_URL;
    } else {
      process.env.ANKI_CONNECT_URL = originalUrl;
    }
  });

  it("타임아웃 시 TimeoutError를 던진다", async () => {
    server = Bun.serve({
      port: 0,
      async fetch() {
        await new Promise((r) => setTimeout(r, 3000));
        return new Response(JSON.stringify({ result: null, error: null }));
      },
    });

    process.env.ANKI_CONNECT_URL = `http://localhost:${server.port}`;

    await expect(
      ankiConnect("version", undefined, { timeout: 100 }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it("연결 거부 시 AnkiConnectError를 던진다", async () => {
    process.env.ANKI_CONNECT_URL = "http://localhost:19999";

    await expect(
      ankiConnect("version", undefined, { timeout: 1000 }),
    ).rejects.toBeInstanceOf(AnkiConnectError);
  });

  it("AnkiConnect API 에러 시 AnkiConnectError를 던진다", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        return new Response(
          JSON.stringify({
            result: null,
            error: "collection is not available",
          }),
        );
      },
    });

    process.env.ANKI_CONNECT_URL = `http://localhost:${server.port}`;

    await expect(ankiConnect("version")).rejects.toBeInstanceOf(
      AnkiConnectError,
    );
  });

  it("HTTP 에러 시 AnkiConnectError를 던진다", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        return new Response("Internal Server Error", { status: 500 });
      },
    });

    process.env.ANKI_CONNECT_URL = `http://localhost:${server.port}`;

    await expect(ankiConnect("version")).rejects.toBeInstanceOf(
      AnkiConnectError,
    );
  });

  it("정상 응답을 반환한다", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        return new Response(JSON.stringify({ result: 6, error: null }));
      },
    });

    process.env.ANKI_CONNECT_URL = `http://localhost:${server.port}`;

    const result = await ankiConnect<number>("version");
    expect(result).toBe(6);
  });
});
