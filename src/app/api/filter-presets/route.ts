import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getFilterPresets,
  createFilterPreset,
  updateFilterPreset,
  deleteFilterPreset,
  PresetContext,
} from "@/db/filter-presets";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const context = searchParams.get("context") as PresetContext | null;

  const presets = await getFilterPresets(userId, context || undefined);
  return NextResponse.json(presets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  try {
    const { name, filters, isDefault, context } = await req.json();

    if (!name || !filters || !context) {
      return NextResponse.json(
        { error: "Name, filters, and context are required" },
        { status: 400 }
      );
    }

    const preset = await createFilterPreset(userId, name, context, filters, isDefault);
    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error("Failed to create filter preset:", error);
    return NextResponse.json(
      { error: "Failed to create filter preset" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Preset ID is required" },
        { status: 400 }
      );
    }

    const preset = await updateFilterPreset(id, userId, updates);
    if (!preset) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Failed to update filter preset:", error);
    return NextResponse.json(
      { error: "Failed to update filter preset" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Preset ID is required" },
        { status: 400 }
      );
    }

    await deleteFilterPreset(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete filter preset:", error);
    return NextResponse.json(
      { error: "Failed to delete filter preset" },
      { status: 500 }
    );
  }
}