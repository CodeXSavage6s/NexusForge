import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import ProfileEditForm from "@/components/profile/ProfileEditForm";

export default async function EditProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <ProfileEditForm
      name={session.user.name}
      image={session.user.image}
      email={session.user.email}
    />
  );
}