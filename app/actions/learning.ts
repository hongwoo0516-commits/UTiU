"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isRecordId } from "@/lib/data";
import { learningSchema, profileSchema, validationState, type ActionState } from "@/lib/validation";
import { Learning } from "@/models/Learning";
import { User } from "@/models/User";

export async function saveLearningAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = learningSchema.safeParse({ ...Object.fromEntries(formData), isPublic: formData.get("isPublic") === "on" });
  if (!parsed.success) return validationState(parsed.error);
  const id = String(formData.get("id") || "");
  if (id && !isRecordId(id)) return { message: "기록을 찾을 수 없습니다." };
  try {
    if (id) {
      const result = await Learning.updateOne({ _id: id, userId: user.id }, { $set: parsed.data }, { runValidators: true });
      if (!result.matchedCount) return { message: "기록을 찾을 수 없습니다." };
    } else {
      await Learning.create({ ...parsed.data, userId: user.id });
    }
  } catch { return { message: "기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }; }
  revalidatePath("/dashboard");
  revalidatePath(`/portfolio/${user.id}`);
  redirect("/dashboard");
}

export async function deleteLearningAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!isRecordId(id)) return { message: "기록을 찾을 수 없습니다." };
  try {
    const result = await Learning.deleteOne({ _id: id, userId: user.id });
    if (!result.deletedCount) return { message: "기록을 찾을 수 없습니다." };
  } catch { return { message: "삭제하지 못했습니다. 다시 시도해 주세요." }; }
  revalidatePath("/dashboard");
  revalidatePath(`/portfolio/${user.id}`);
  return { success: true };
}

export async function saveProfileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationState(parsed.error);
  try { await User.updateOne({ _id: user.id }, { $set: parsed.data }, { runValidators: true }); }
  catch { return { message: "소개를 저장하지 못했습니다. 다시 시도해 주세요." }; }
  revalidatePath("/dashboard");
  revalidatePath(`/portfolio/${user.id}`);
  return { success: true, message: "프로필을 저장했습니다." };
}
