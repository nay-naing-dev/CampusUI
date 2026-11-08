import { db, nextId, starterNotifications } from '@/lib/api/mock-db';
import {
  ApiError,
  HOLD_HOURS,
  type AppNotification,
  type ConversationSummary,
  type Listing,
  type ListingQuery,
  type ListingWithSeller,
  type Message,
  type NewListingInput,
  type ProfileChanges,
  type RegisterInput,
  type ReportInput,
  type ReservationDetail,
  type SaleConfirmation,
  type Badge,
  type SellingSummary,
  type User,
} from '@/lib/api/types';
import { computeBadges, topBadgeId } from '@/lib/badges';
import { isGmail } from '@/lib/validation';

/**
 * Mock CampusLoop API. Each function names the NestJS route it stands in for;
 * to go live, replace the body with a `fetch` to that route and keep the
 * signature, so no screen has to change.
 */

const LATENCY_MS = 300;
const HOUR = 3_600_000;
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

function storedUser(userId: string) {
  const stored = db.users.find((user) => user.id === userId);
  if (!stored) throw new ApiError('User not found.', 404);
  return stored;
}

function publicUser(userId: string): User {
  const { password: _password, ...user } = storedUser(userId);
  return { ...user, topBadge: topBadgeId(user) };
}

function notify(userId: string, notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  const user = publicUser(userId);
  db.notifications[userId] ??= starterNotifications(user);
  db.notifications[userId].unshift({ ...notification, id: nextId('n'), createdAt: new Date().toISOString(), read: false });
}

/** Badges a change unlocked: earned now, not before. */
function unlocked(before: Badge[], after: Badge[]) {
  return after.filter((badge) => badge.earned && !before.find((old) => old.id === badge.id)?.earned);
}

function findListing(listingId: string) {
  const listing = db.listings.find((item) => item.id === listingId);
  if (!listing) throw new ApiError('Listing not found.', 404);
  return listing;
}

function withSeller(listing: Listing, viewerId: string | null): ListingWithSeller {
  return {
    ...listing,
    seller: publicUser(listing.sellerId),
    saved: viewerId ? (db.saves[viewerId] ?? []).includes(listing.id) : false,
  };
}

function findReservation(reservationId: string) {
  const reservation = db.reservations.find((item) => item.id === reservationId);
  if (!reservation) throw new ApiError('Reservation not found.', 404);
  return reservation;
}

/** Releases holds whose 72 hours are up, as the backend's cron job will. */
function expireHolds() {
  const now = new Date().toISOString();
  for (const reservation of db.reservations) {
    // A hold waiting on the other student's confirmation doesn't expire.
    const confirming = reservation.sellerConfirmedAt || reservation.buyerConfirmedAt;
    if (reservation.status === 'active' && !confirming && reservation.expiresAt < now) {
      reservation.status = 'cancelled';
      const listing = db.listings.find((item) => item.id === reservation.listingId);
      if (listing?.status === 'reserved') listing.status = 'available';
    }
  }
}

function detail(reservationId: string): ReservationDetail {
  const reservation = findReservation(reservationId);
  return {
    ...reservation,
    listing: findListing(reservation.listingId),
    buyer: publicUser(reservation.buyerId),
    seller: publicUser(reservation.sellerId),
  };
}

function activeReservationFor(listingId: string) {
  return db.reservations.find((item) => item.listingId === listingId && item.status === 'active') ?? null;
}

function summarize(conversationId: string, viewerId: string): ConversationSummary {
  const conversation = db.conversations.find((item) => item.id === conversationId);
  if (!conversation) throw new ApiError('Conversation not found.', 404);
  const messages = db.messages.filter((message) => message.conversationId === conversationId);
  const lastRead = db.reads[conversationId]?.[viewerId] ?? '';
  const otherId = conversation.buyerId === viewerId ? conversation.sellerId : conversation.buyerId;
  return {
    ...conversation,
    listing: findListing(conversation.listingId),
    other: publicUser(otherId),
    lastMessage: messages.at(-1) ?? null,
    unread: messages.filter((message) => message.senderId !== viewerId && message.createdAt > lastRead).length,
  };
}

const MOCK_REPLIES = [
  'Sounds good! When are you free to meet?',
  'Sure, I can do that 🙂',
  'I’m on campus most afternoons.',
  'Let me check and get back to you.',
];

/** Mock only: the other student answers a couple of seconds later. */
function scheduleMockReply(conversationId: string, senderId: string) {
  const conversation = db.conversations.find((item) => item.id === conversationId)!;
  const otherId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
  const body = MOCK_REPLIES[db.messages.length % MOCK_REPLIES.length];
  setTimeout(() => {
    const createdAt = new Date().toISOString();
    db.messages.push({ id: nextId('m'), conversationId, senderId: otherId, kind: 'text', body, createdAt });
    conversation.updatedAt = createdAt;
  }, 2200);
}

function ensureConversation(listingId: string, buyerId: string) {
  const listing = findListing(listingId);
  const existing = db.conversations.find((item) => item.listingId === listingId && item.buyerId === buyerId);
  if (existing) return existing.id;
  const conversation = { id: nextId('c'), listingId, buyerId, sellerId: listing.sellerId, updatedAt: new Date().toISOString() };
  db.conversations.push(conversation);
  return conversation.id;
}

export const api = {
  auth: {
    /** POST /auth/register (multipart: student ID photos) */
    async register(input: RegisterInput): Promise<User> {
      await wait(700);
      const email = input.email.trim().toLowerCase();
      if (!isGmail(email)) throw new ApiError('Use a Gmail address.', 400);
      if (db.users.some((user) => user.email === email)) {
        throw new ApiError('An account with this Gmail already exists. Log in instead.', 409);
      }
      const user = {
        id: nextId('u'),
        fullName: input.fullName.trim(),
        email,
        password: input.password,
        universityId: input.universityId,
        gender: input.gender,
        verification: 'pending' as const,
        look: Math.floor(Math.random() * 6),
        major: '',
        year: '',
        hometown: '',
        contact: '',
        joinedAt: new Date().toISOString(),
        rating: 0,
        sold: 0,
        earned: 0,
        givenAway: 0,
        topBadge: null,
        bought: 0,
        notifyReservations: true,
        notifyVerification: true,
      };
      db.users.push(user);
      return publicUser(user.id);
    },

    /** POST /auth/login */
    async login(email: string, password: string): Promise<User> {
      await wait(600);
      const stored = db.users.find((user) => user.email === email.trim().toLowerCase());
      if (!stored) throw new ApiError('No account uses this Gmail yet. Sign up first.', 404);
      if (stored.password !== password) throw new ApiError('That password is not right.', 401);
      return publicUser(stored.id);
    },

    /** POST /auth/forgot-password */
    async requestPasswordReset(email: string): Promise<void> {
      await wait(600);
      if (!isGmail(email)) throw new ApiError('Use a Gmail address.', 400);
      // Always succeeds, so the API never reveals which emails have accounts.
    },
  },

  users: {
    /** GET /users?search=&universityId=: students by name (own campus only when given), top sellers first. */
    async search(query: string, universityId: string | null, viewerId: string | null): Promise<User[]> {
      await wait(250);
      const needle = query.trim().toLowerCase();
      if (needle.length < 2) return [];
      return db.users
        .filter((user) => user.id !== viewerId && user.fullName.toLowerCase().includes(needle))
        .filter((user) => !universityId || user.universityId === universityId)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 8)
        .map((user) => publicUser(user.id));
    },

    /** GET /users/:id with their live listings, for a public profile. */
    async profile(userId: string, viewerId: string | null): Promise<{ user: User; listings: ListingWithSeller[]; badges: Badge[] }> {
      await wait();
      const user = publicUser(userId);
      const listings = db.listings
        .filter((listing) => listing.sellerId === userId && listing.status !== 'sold')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((listing) => withSeller(listing, viewerId));
      return { user, listings, badges: computeBadges(user) };
    },

    /** PATCH /users/me */
    async update(userId: string, changes: ProfileChanges): Promise<User> {
      await wait(400);
      Object.assign(storedUser(userId), changes);
      return publicUser(userId);
    },

    /** DELETE /users/me: cancels their holds and removes their listings. */
    async remove(userId: string): Promise<void> {
      await wait(800);
      for (const reservation of db.reservations) {
        if (reservation.status === 'active' && (reservation.buyerId === userId || reservation.sellerId === userId)) {
          reservation.status = 'cancelled';
          const listing = db.listings.find((item) => item.id === reservation.listingId);
          if (listing?.status === 'reserved') listing.status = 'available';
        }
      }
      db.listings = db.listings.filter((listing) => listing.sellerId !== userId);
      db.users = db.users.filter((user) => user.id !== userId);
    },

    /** What deleting the account would cancel, for the warning on that screen. */
    async deletionImpact(userId: string): Promise<{ holds: number; reservedListings: number }> {
      await wait(200);
      const active = db.reservations.filter((item) => item.status === 'active');
      return {
        holds: active.filter((item) => item.buyerId === userId).length,
        reservedListings: active.filter((item) => item.sellerId === userId).length,
      };
    },

    /** GET /users/:id/badges */
    async badges(userId: string): Promise<Badge[]> {
      await wait(200);
      return computeBadges(publicUser(userId));
    },

    /** Testing only: stands in for an admin approving the student ID. */
    async simulateVerification(userId: string): Promise<User> {
      await wait(500);
      storedUser(userId).verification = 'verified';
      db.notifications[userId] = starterNotifications(publicUser(userId));
      return publicUser(userId);
    },
  },

  listings: {
    /** GET /listings?universityId=&search=&category=&conditions=&maxPrice=&sort= */
    async list(query: ListingQuery, viewerId: string | null): Promise<ListingWithSeller[]> {
      await wait();
      expireHolds();
      const search = query.search?.trim().toLowerCase();
      const saved = query.savedBy ? (db.saves[query.savedBy] ?? []) : null;
      const sorted = db.listings
        .filter((listing) => listing.status !== 'sold')
        .filter((listing) => !query.universityId || listing.universityId === query.universityId)
        .filter((listing) => !query.category || listing.category === query.category)
        .filter((listing) => !query.conditions?.length || query.conditions.includes(listing.condition))
        .filter((listing) => query.maxPrice == null || listing.price <= query.maxPrice)
        .filter((listing) => !query.excludeSellerId || listing.sellerId !== query.excludeSellerId)
        .filter((listing) => !saved || saved.includes(listing.id))
        .filter(
          (listing) =>
            !search ||
            listing.title.toLowerCase().includes(search) ||
            listing.description.toLowerCase().includes(search) ||
            // Typing a seller's name also finds what they're selling.
            storedUser(listing.sellerId).fullName.toLowerCase().includes(search),
        )
        .sort((a, b) =>
          query.sort === 'price-low'
            ? a.price - b.price
            : query.sort === 'price-high'
              ? b.price - a.price
              : b.createdAt.localeCompare(a.createdAt),
        );
      return sorted.map((listing) => withSeller(listing, viewerId));
    },

    /** GET /listings/trending: most viewed this week */
    async trending(universityId: string | null, viewerId: string | null): Promise<ListingWithSeller[]> {
      await wait();
      return db.listings
        .filter((listing) => listing.status === 'available' && (!universityId || listing.universityId === universityId))
        .sort((a, b) => b.views - a.views)
        .slice(0, 6)
        .map((listing) => withSeller(listing, viewerId));
    },

    /** GET /listings/:id */
    async get(listingId: string, viewerId: string | null): Promise<ListingWithSeller & { reservation: ReservationDetail | null }> {
      await wait();
      expireHolds();
      const listing = findListing(listingId);
      listing.views += 1;
      const reservation = activeReservationFor(listingId);
      return { ...withSeller(listing, viewerId), reservation: reservation ? detail(reservation.id) : null };
    },

    /** POST /listings */
    async create(input: NewListingInput, seller: User): Promise<ListingWithSeller> {
      await wait(800);
      const listing: Listing = {
        ...input,
        id: nextId('l'),
        sellerId: seller.id,
        universityId: seller.universityId,
        status: 'available',
        createdAt: new Date().toISOString(),
        views: 0,
      };
      db.listings.push(listing);
      return withSeller(listing, seller.id);
    },

    /** DELETE /listings/:id */
    async remove(listingId: string): Promise<void> {
      await wait();
      const reservation = activeReservationFor(listingId);
      if (reservation) reservation.status = 'cancelled';
      db.listings = db.listings.filter((listing) => listing.id !== listingId);
    },

    /**
     * PATCH /listings/:id { price }. On a reserved listing the buyer has
     * 12 hours to accept the new price or let the hold go.
     */
    async changePrice(listingId: string, price: number): Promise<void> {
      await wait();
      const listing = findListing(listingId);
      const reservation = activeReservationFor(listingId);
      if (reservation && price !== listing.price) {
        reservation.priceChange = { from: listing.price, to: price, respondBy: new Date(Date.now() + 12 * HOUR).toISOString() };
      }
      listing.price = price;
    },

    /**
     * PATCH /listings/:id: edit photos, title, details. A price change on a
     * reserved listing goes through the buyer-approval rule above.
     */
    async update(listingId: string, sellerId: string, changes: NewListingInput): Promise<ListingWithSeller> {
      await wait(600);
      const listing = findListing(listingId);
      if (listing.sellerId !== sellerId) throw new ApiError('You can only edit your own listings.', 403);
      if (listing.status === 'sold') throw new ApiError('Sold listings can’t be edited.', 409);
      const { price, ...rest } = changes;
      Object.assign(listing, rest);
      if (price !== listing.price) await api.listings.changePrice(listingId, price);
      return withSeller(listing, sellerId);
    },

    /** PUT or DELETE /listings/:id/save */
    async setSaved(listingId: string, userId: string, saved: boolean): Promise<void> {
      await wait(150);
      const current = new Set(db.saves[userId] ?? []);
      if (saved) current.add(listingId);
      else current.delete(listingId);
      db.saves[userId] = [...current];
    },

    /** GET /users/me/selling */
    async selling(userId: string): Promise<SellingSummary> {
      await wait();
      expireHolds();
      const mine = db.listings.filter((listing) => listing.sellerId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const active = mine.filter((listing) => listing.status !== 'sold');
      const sold = mine.filter((listing) => listing.status === 'sold');
      const reservations: Record<string, ReservationDetail> = {};
      for (const listing of active) {
        const reservation = activeReservationFor(listing.id);
        if (reservation) reservations[listing.id] = detail(reservation.id);
      }
      return {
        active: active.map((listing) => withSeller(listing, userId)),
        sold: sold.map((listing) => withSeller(listing, userId)),
        reservations,
        stats: { active: active.length, sold: sold.length, earned: sold.reduce((total, listing) => total + listing.price, 0) },
      };
    },
  },

  reservations: {
    /** POST /listings/:id/reservations: holds the item for 72 hours */
    async create(listingId: string, buyerId: string): Promise<ReservationDetail> {
      await wait(600);
      expireHolds();
      const listing = findListing(listingId);
      if (listing.sellerId === buyerId) throw new ApiError('This is your own listing.', 400);
      if (storedUser(buyerId).verification !== 'verified') {
        throw new ApiError('Your student ID is still in review. You can reserve once it’s verified (Profile → Testing to approve it now).', 403);
      }
      if (listing.status !== 'available') throw new ApiError('Someone else is holding this right now.', 409);
      const now = Date.now();
      const reservation = {
        id: nextId('r'),
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + HOLD_HOURS * HOUR).toISOString(),
        status: 'active' as const,
        priceChange: null,
        sellerConfirmedAt: null,
        buyerConfirmedAt: null,
      };
      db.reservations.push(reservation);
      listing.status = 'reserved';
      ensureConversation(listingId, buyerId);
      return detail(reservation.id);
    },

    /** GET /users/me/reservations */
    async forBuyer(userId: string): Promise<ReservationDetail[]> {
      await wait();
      expireHolds();
      return db.reservations
        .filter((item) => item.buyerId === userId && item.status === 'active')
        .sort((a, b) => Number(!!b.priceChange) - Number(!!a.priceChange) || b.createdAt.localeCompare(a.createdAt))
        .map((item) => detail(item.id));
    },

    /** GET /reservations/:id */
    async get(reservationId: string): Promise<ReservationDetail> {
      await wait();
      return detail(reservationId);
    },

    /** POST /reservations/:id/cancel (buyer or seller) */
    async cancel(reservationId: string): Promise<void> {
      await wait(400);
      const reservation = findReservation(reservationId);
      reservation.status = 'cancelled';
      const listing = findListing(reservation.listingId);
      if (listing.status === 'reserved') listing.status = 'available';
    },

    /** POST /reservations/:id/price-change { accept } */
    async respondToPriceChange(reservationId: string, accept: boolean): Promise<void> {
      await wait(400);
      const reservation = findReservation(reservationId);
      if (!accept) return api.reservations.cancel(reservationId);
      reservation.priceChange = null;
    },

    /**
     * POST /reservations/:id/confirm. The seller ("I sold it") or the buyer
     * ("I got it and paid") confirms. The sale only becomes real, and only
     * counts for stats and badges, once both have confirmed.
     */
    async confirmSale(reservationId: string, userId: string): Promise<SaleConfirmation> {
      await wait(500);
      const reservation = findReservation(reservationId);
      if (reservation.status !== 'active') throw new ApiError('This reservation is already closed.', 409);
      const role = reservation.sellerId === userId ? 'seller' : reservation.buyerId === userId ? 'buyer' : null;
      if (!role) throw new ApiError('Only the buyer and seller can confirm a sale.', 403);

      const now = new Date().toISOString();
      if (role === 'seller') reservation.sellerConfirmedAt ??= now;
      else reservation.buyerConfirmedAt ??= now;
      const listing = findListing(reservation.listingId);
      const otherId = role === 'seller' ? reservation.buyerId : reservation.sellerId;

      if (!reservation.sellerConfirmedAt || !reservation.buyerConfirmedAt) {
        const me = publicUser(userId).fullName;
        notify(otherId, {
          kind: 'confirm',
          title: role === 'seller' ? `${me} marked ${listing.title} as sold` : `${me} confirmed they got ${listing.title}`,
          body: 'Confirm it on Activity so the sale counts for both of you.',
        });
        return { completed: false, newBadges: [] };
      }

      // Both sides agree: the sale is real.
      const sellerBefore = computeBadges(publicUser(reservation.sellerId));
      const buyerBefore = computeBadges(publicUser(reservation.buyerId));
      reservation.status = 'completed';
      listing.status = 'sold';
      const seller = storedUser(reservation.sellerId);
      seller.sold += 1;
      seller.earned += listing.price;
      if (listing.price === 0) seller.givenAway += 1;
      storedUser(reservation.buyerId).bought += 1;

      const sellerNew = unlocked(sellerBefore, computeBadges(publicUser(reservation.sellerId)));
      const buyerNew = unlocked(buyerBefore, computeBadges(publicUser(reservation.buyerId)));
      for (const [personId, badges] of [[reservation.sellerId, sellerNew], [reservation.buyerId, buyerNew]] as const) {
        for (const badge of badges) {
          notify(personId, { kind: 'badge', title: `New badge: ${badge.title} ${badge.emoji}`, body: badge.description });
        }
      }
      notify(otherId, { kind: 'confirm', title: `${listing.title}: sale confirmed`, body: 'You both confirmed. It now counts on your profile.' });
      return { completed: true, newBadges: role === 'seller' ? sellerNew : buyerNew };
    },

    /**
     * POST /reservations/:id/decline-confirmation. "That didn't happen": clears
     * the other side's confirmation and the hold runs on as before.
     */
    async declineSale(reservationId: string, userId: string): Promise<void> {
      await wait(400);
      const reservation = findReservation(reservationId);
      const listing = findListing(reservation.listingId);
      if (reservation.buyerId === userId) {
        reservation.sellerConfirmedAt = null;
        notify(reservation.sellerId, { kind: 'confirm', title: `${listing.title}: buyer says not yet`, body: 'They haven’t received it. Message them to sort it out.' });
      } else if (reservation.sellerId === userId) {
        reservation.buyerConfirmedAt = null;
        notify(reservation.buyerId, { kind: 'confirm', title: `${listing.title}: seller says not yet`, body: 'They haven’t been paid. Message them to sort it out.' });
      }
    },

    /** Testing only: the other student (a mock) confirms their side. */
    async simulateOtherConfirmation(reservationId: string, viewerId: string): Promise<SaleConfirmation> {
      const reservation = findReservation(reservationId);
      const otherId = reservation.sellerId === viewerId ? reservation.buyerId : reservation.sellerId;
      const before = computeBadges(publicUser(viewerId));
      const result = await api.reservations.confirmSale(reservationId, otherId);
      // Report the viewer's own new badges, not the mock student's.
      return { completed: result.completed, newBadges: unlocked(before, computeBadges(publicUser(viewerId))) };
    },
  },

  chats: {
    /** GET /conversations */
    async list(userId: string): Promise<ConversationSummary[]> {
      await wait();
      return db.conversations
        .filter((conversation) => conversation.buyerId === userId || conversation.sellerId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((conversation) => summarize(conversation.id, userId));
    },

    /** GET /conversations/:id, and marks it read */
    async get(conversationId: string, userId: string): Promise<{ summary: ConversationSummary; messages: Message[] }> {
      await wait();
      db.reads[conversationId] = { ...db.reads[conversationId], [userId]: new Date().toISOString() };
      return {
        summary: summarize(conversationId, userId),
        messages: db.messages.filter((message) => message.conversationId === conversationId),
      };
    },

    /** POST /listings/:id/conversations: opens (or reuses) the chat about a listing */
    async open(listingId: string, userId: string, buyerId?: string): Promise<string> {
      await wait();
      const listing = findListing(listingId);
      if (listing.sellerId === userId && !buyerId) throw new ApiError('This is your own listing.', 400);
      return ensureConversation(listingId, buyerId ?? userId);
    },

    /** POST /conversations/:id/messages */
    async send(conversationId: string, senderId: string, message: Pick<Message, 'kind' | 'body' | 'amount'>): Promise<Message> {
      await wait(200);
      const conversation = db.conversations.find((item) => item.id === conversationId);
      if (!conversation) throw new ApiError('Conversation not found.', 404);
      const createdAt = new Date().toISOString();
      const sent = { ...message, id: nextId('m'), conversationId, senderId, createdAt };
      db.messages.push(sent);
      conversation.updatedAt = createdAt;
      db.reads[conversationId] = { ...db.reads[conversationId], [senderId]: createdAt };
      scheduleMockReply(conversationId, senderId);
      return sent;
    },
  },

  reports: {
    /** POST /reports */
    async create(reporterId: string, input: ReportInput): Promise<void> {
      await wait(700);
      db.reports.push({ ...input, id: nextId('rep'), reporterId, createdAt: new Date().toISOString() });
    },
  },

  notifications: {
    /** GET /notifications */
    async list(user: User): Promise<AppNotification[]> {
      await wait();
      db.notifications[user.id] ??= starterNotifications(user);
      return db.notifications[user.id];
    },

    /** POST /notifications/read-all */
    async markAllRead(userId: string): Promise<void> {
      await wait(150);
      db.notifications[userId]?.forEach((notification) => {
        notification.read = true;
      });
    },
  },
};

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}
