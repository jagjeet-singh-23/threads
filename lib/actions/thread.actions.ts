"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });
    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating Thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();
  const skipAmount = (pageNumber - 1) * pageSize;
  // Fetch the posts that have no parents (top-level threads...)
  const fetchQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createThread: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPageCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });
  const posts = await fetchQuery.exec();
  const isNext = totalPageCount > skipAmount * pageSize;
  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();
  try {
    // TODO: Populate community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Unable to fetch thread: ${error.message}`);
  }
}

export async function addComment(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err: any) {
    console.error("Error while adding comment:", err);
    throw new Error(`Unable to add comment: ${err.message}`);
  }
}
