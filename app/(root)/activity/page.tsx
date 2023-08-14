import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import {
  fetchNotifications,
  fetchUser,
  fetchUsers,
} from "@/lib/actions/user.action";
import Image from "next/image";
import Link from "next/link";

const ActivityPage = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  // get Notifications
  const notifications = await fetchNotifications(userInfo._id);

  return (
    <>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <Link
                key={notification._id}
                href={`/thread/${notification.parentId}`}
              >
                <article className="activity-card">
                  <Image
                    src={notification.author.image}
                    alt="user image"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {notification.author.name}
                    </span>{" "}
                    has replied to your thread.
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet.</p>
        )}
      </section>
    </>
  );
};

export default ActivityPage;
