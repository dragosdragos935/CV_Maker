import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "companies.json");

export async function GET() {
  try {
    const content = await fs.readFile(dataFile, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await fs.mkdir(dataDir, { recursive: true });
    let current = [];
    try {
      const content = await fs.readFile(dataFile, "utf-8");
      current = JSON.parse(content);
    } catch {}
    const updated = [body, ...current.filter((c) => c.id !== body.id)];
    await fs.writeFile(dataFile, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id: body.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    await fs.mkdir(dataDir, { recursive: true });
    let current = [];
    try {
      const content = await fs.readFile(dataFile, "utf-8");
      current = JSON.parse(content);
    } catch {}
    const updated = [body, ...current.filter((c) => c.id !== body.id)];
    await fs.writeFile(dataFile, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id: body.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}


