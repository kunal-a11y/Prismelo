import {
  activeSubscribers,
  findUserById,
  readStore,
  repliesForThread,
  type StoredSubscriber,
  type StoredThread,
  type StoredUser,
} from "@/lib/community-store";
import { sendMail } from "@/lib/email";
import { site } from "@/lib/site";

/**
 * Notification fan-out. Every function swallows its own failures: a provider
 * outage must never turn a published post or a posted reply into an error for
 * the person who wrote it. Delivery outcomes land in the email log, which the
 * admin community page shows.
 */

const CHUNK = 4;

async function sendBatch(jobs: Array<() => Promise<unknown>>) {
  for (let index = 0; index < jobs.length; index += CHUNK) {
    await Promise.allSettled(jobs.slice(index, index + CHUNK).map((job) => job()));
  }
}

function unsubscribeUrl(origin: string, token: string) {
  return `${origin}/unsubscribe?token=${encodeURIComponent(token)}`;
}

function subscriberFooter(origin: string, subscriber: StoredSubscriber) {
  return [
    "You are receiving this because you asked to hear about new Prismelo articles.",
    `Unsubscribe: ${unsubscribeUrl(origin, subscriber.token)}`,
    `Sent by Prismelo Technology — ${site.contactEmail}`,
  ].join("\n\n");
}

/** Tells everyone on the email list that a new article is live. */
export async function notifyNewResource(
  post: { title: string; description: string; slug: string },
  origin: string,
) {
  const seen = new Set<string>();
  const subscribers = activeSubscribers(readStore()).filter((subscriber) => {
    if (seen.has(subscriber.email)) return false;
    seen.add(subscriber.email);
    return true;
  });

  if (subscribers.length === 0) return { recipients: 0 };

  const url = `${origin}/resources/${post.slug}`;

  await sendBatch(
    subscribers.map((subscriber) => () =>
      sendMail({
        to: subscriber.email,
        kind: "new-post",
        subject: `New article: ${post.title}`,
        heading: post.title,
        paragraphs: [
          post.description,
          "Read it in full on the Prismelo resources page.",
        ],
        action: { label: "Read the article", href: url },
        footer: subscriberFooter(origin, subscriber),
      }),
    ),
  );

  return { recipients: subscribers.length };
}

/** Confirms a new account to the person who just registered. */
export async function notifyWelcome(user: StoredUser, origin: string) {
  await sendMail({
    to: user.email,
    kind: "forum-welcome",
    subject: "Your Prismelo community account is ready",
    heading: `Welcome, ${user.name}`,
    paragraphs: [
      `Your community account has been created. Your public handle is @${user.username}.`,
      "You can start a discussion in any category, reply to existing threads, and you will receive an email when someone replies to a discussion you started or joined.",
      "You are also on the list for new Prismelo articles. Every email includes an unsubscribe link.",
    ],
    action: { label: "Open the community", href: `${origin}/community` },
    footer: `Sent by Prismelo Technology — ${site.contactEmail}`,
  });
}

/** Confirms a thread to its author, as soon as it is published. */
export async function notifyThreadCreated(thread: StoredThread, author: StoredUser, origin: string) {
  await sendMail({
    to: author.email,
    kind: "forum-created",
    subject: `Your discussion is live: ${thread.title}`,
    heading: "Your discussion is live",
    paragraphs: [
      `“${thread.title}” has been published in the community.`,
      "You will get an email when someone replies. You can also reply to your own thread to add detail.",
    ],
    action: {
      label: "View your discussion",
      href: `${origin}/community/t/${thread.slug}`,
    },
    footer: `You received this because you started this discussion on Prismelo Technology — ${site.contactEmail}`,
  });
}

/**
 * Replies go to the thread author and to everyone who has already replied,
 * except the person who just wrote the reply.
 */
export async function notifyReply({
  thread,
  body,
  author,
  origin,
}: {
  thread: StoredThread;
  body: string;
  author: StoredUser;
  origin: string;
}) {
  const store = readStore();
  const threadAuthor = findUserById(store, thread.authorId);
  const participants = repliesForThread(store, thread.id)
    .map((reply) => findUserById(store, reply.authorId))
    .filter((user): user is StoredUser => Boolean(user));

  const recipients = new Map<string, StoredUser>();
  for (const user of [threadAuthor, ...participants]) {
    if (!user) continue;
    if (user.id === author.id) continue;
    recipients.set(user.email, user);
  }

  const excerpt = body.length > 480 ? `${body.slice(0, 480).trimEnd()}…` : body;

  await sendBatch(
    [...recipients.values()].map((recipient) => () =>
      sendMail({
        to: recipient.email,
        kind: "forum-reply",
        subject: `New reply in “${thread.title}”`,
        heading: thread.title,
        paragraphs: [`${author.name} (@${author.username}) wrote:`, excerpt],
        action: {
          label: "Read the reply",
          href: `${origin}/community/t/${thread.slug}`,
        },
        footer: "You received this because you started this discussion or replied to it. Replying again keeps you on this thread; starting a new discussion is a new thread.",
      }),
    ),
  );

  return { recipients: recipients.size };
}

/** A reviewed notice that the privacy policy or terms have changed. */
export async function notifyLegalUpdate(
  { label, path: target, note }: { label: string; path: string; note?: string },
  origin: string,
) {
  const seen = new Set<string>();
  const subscribers = activeSubscribers(readStore()).filter((subscriber) => {
    if (seen.has(subscriber.email)) return false;
    seen.add(subscriber.email);
    return true;
  });

  if (subscribers.length === 0) return { recipients: 0 };

  const summary = note?.trim();

  await sendBatch(
    subscribers.map((subscriber) => () =>
      sendMail({
        to: subscriber.email,
        kind: "legal-update",
        subject: `${label} updated`,
        heading: `${label} updated`,
        paragraphs: [
          summary || `We have updated our ${label}.`,
          "You can read the current version at the link below. If you no longer want these emails, unsubscribe using the link at the end of this message.",
        ],
        action: { label: `Read the ${label}`, href: `${origin}${target}` },
        footer: subscriberFooter(origin, subscriber),
      }),
    ),
  );

  return { recipients: subscribers.length };
}

export async function sendSubscriptionConfirmation(subscriber: StoredSubscriber, origin: string) {
  await sendMail({
    to: subscriber.email,
    kind: "subscribe",
    subject: "You're subscribed to Prismelo articles",
    heading: "You're on the list",
    paragraphs: [
      "You will get an email when a new Prismelo article is published. Nothing else.",
      "If you also join the community, replies to your discussions are emailed separately.",
    ],
    action: { label: "Browse resources", href: `${origin}/resources` },
    footer: subscriberFooter(origin, subscriber),
  });
}
