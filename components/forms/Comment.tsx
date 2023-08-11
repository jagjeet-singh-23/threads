"use client";

import * as z from "zod";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// import { createThread } from "@/lib/actions/thread.actions";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addComment } from "@/lib/actions/thread.actions";

interface CommentProps {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: CommentProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addComment(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );
    router.push("/");
    form.reset();
  };
  return (
    <Form {...form}>
      <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full gap-3 items-center">
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt="profileImage"
                  className="rounded-full object-cover"
                  width={48}
                  height={48}
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  {...field}
                  type="text"
                  placeholder="Comment..."
                  className="no-focus text-light-1 outline-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="comment-form_btn">
          Reply...
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
