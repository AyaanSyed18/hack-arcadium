"use server"

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { cookies } from "next/headers";

export async function deleteUser(id: string) {
  try {
    await connectToDatabase();
    await Registration.findByIdAndDelete(id);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function loginAdmin(pin: string) {
  if (pin === "1808") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }
  return { success: false, error: "Incorrect PIN" };
}
