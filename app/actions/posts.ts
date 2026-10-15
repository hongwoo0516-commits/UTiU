"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isRecordId } from "@/lib/data";
import { postSchema, validationState, type ActionState } from "@/lib/validation";
import { Post } from "@/models/Post";

export async function savePostAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationState(parsed.error);
  const id = String(formData.get("id") || "");
  if (id && !isRecordId(id)) return { message: "글을 찾을 수 없습니다." };
  let savedId = id;
  try {
    if (id) {
      const result = await Post.updateOne({ _id: id, userId: user.id }, { $set: parsed.data }, { runValidators: true });
      if (!result.matchedCount) return { message: "글을 찾을 수 없습니다." };
    } else {
      const post = await Post.create({ ...parsed.data, userId: user.id, author: user.name });
      savedId = String(post._id);
    }
  } catch { return { message: "글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }; }
  revalidatePath("/posts");
  revalidatePath(`/posts/${savedId}`);
  redirect(`/posts/${savedId}`);
}

export async function deletePostAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!isRecordId(id)) return { message: "글을 찾을 수 없습니다." };
  try {
    const result = await Post.deleteOne({ _id: id, userId: user.id });
    if (!result.deletedCount) return { message: "글을 찾을 수 없습니다." };
  } catch { return { message: "글을 삭제하지 못했습니다. 다시 시도해 주세요." }; }
  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
  redirect("/posts");
}
