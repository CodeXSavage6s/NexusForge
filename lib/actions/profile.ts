"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type UpdateProfileInput = {
  name: string;
  image?: string;
};

export async function updateProfile({
  name,
  image,
}: UpdateProfileInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const trimmedName = name.trim();
  const trimmedImage = image?.trim() || undefined;

  if (!trimmedName) {
    return {
      success: false,
      error: "Name is required.",
    };
  }

  if (trimmedName.length > 80) {
    return {
      success: false,
      error: "Name is too long.",
    };
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: trimmedName,
        image: trimmedImage,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update profile:", error);

    return {
      success: false,
      error: "Unable to update your profile.",
    };
  }
}