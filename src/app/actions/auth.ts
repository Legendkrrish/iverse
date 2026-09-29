"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SESSION_COOKIE_NAME = "iverse_admin_session";

// Default admin fallback credentials if database is offline or uninitialized
const DEFAULT_ADMIN = {
  email: "admin@iverse.store",
  username: "admin",
  password: "iverse@2026",
  name: "Store Admin",
  role: "ADMIN"
};

export async function loginAdmin(formData: FormData) {
  const usernameOrEmail = (formData.get("usernameOrEmail") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!usernameOrEmail || !password) {
    return { success: false, error: "Username/Email and Password are required" };
  }

  try {
    let isValid = false;
    let userDetails = { name: "Store Admin", email: usernameOrEmail, role: "ADMIN" };

    // 1. Try finding user in database
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: usernameOrEmail, mode: "insensitive" } },
            { name: { equals: usernameOrEmail, mode: "insensitive" } }
          ]
        }
      });

      if (dbUser && dbUser.password === password) {
        isValid = true;
        userDetails = { name: dbUser.name, email: dbUser.email, role: dbUser.role };
      }
    } catch (dbErr) {
      console.warn("DB query error during login, falling back to default admin credentials", dbErr);
    }

    // 2. Check default fallback credentials if DB user wasn't matched
    if (!isValid) {
      const isMatchUser = usernameOrEmail.toLowerCase() === DEFAULT_ADMIN.email || usernameOrEmail.toLowerCase() === DEFAULT_ADMIN.username;
      const isMatchPass = password === DEFAULT_ADMIN.password;

      if (isMatchUser && isMatchPass) {
        isValid = true;
        userDetails = { name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email, role: DEFAULT_ADMIN.role };
      }
    }

    if (!isValid) {
      return { success: false, error: "Invalid Username/Email or Password" };
    }

    // 3. Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userDetails), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 Days session
      path: "/",
      sameSite: "lax"
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login failed", error);
    return { success: false, error: error.message || "Failed to log in" };
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Logout failed", error);
    return { success: false, error: error.message };
  }
}

export async function getAuthSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

export async function changeAdminPassword(formData: FormData) {
  const currentPassword = (formData.get("currentPassword") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Current and New Password are required" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" };
  }

  try {
    const session = await getAuthSession();
    const userEmail = session?.email || DEFAULT_ADMIN.email;

    // Try updating DB user if exists
    try {
      const dbUser = await prisma.user.findFirst({
        where: { email: userEmail }
      });

      if (dbUser) {
        if (dbUser.password !== currentPassword) {
          return { success: false, error: "Current password is incorrect" };
        }

        await prisma.user.update({
          where: { id: dbUser.id },
          data: { password: newPassword }
        });

        return { success: true, message: "Password updated successfully!" };
      }
    } catch (e) {
      console.warn("DB user update skipped", e);
    }

    // Fallback: If DB user doesn't exist, create user record with new password
    try {
      await prisma.user.upsert({
        where: { email: DEFAULT_ADMIN.email },
        update: { password: newPassword },
        create: {
          email: DEFAULT_ADMIN.email,
          name: DEFAULT_ADMIN.name,
          password: newPassword,
          role: DEFAULT_ADMIN.role
        }
      });
      return { success: true, message: "Admin password updated successfully!" };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to update password" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to change password" };
  }
}
