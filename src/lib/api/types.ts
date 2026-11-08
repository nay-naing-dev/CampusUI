// Shapes the NestJS API is expected to return. Keep these in step with the
// backend DTOs once it exists, so screens don't change when the mock goes.

export type Gender = 'male' | 'female';
export type VerificationStatus = 'pending' | 'verified';

export type User = {
  id: string;
  fullName: string;
  email: string;
  universityId: string;
  gender: Gender;
  verification: VerificationStatus;
  /** Index into the stickman looks; "Shuffle my look" changes it. */
  look: number;
  major: string;
  year: string;
  hometown: string;
  /** How other students reach them outside the app, e.g. "Telegram @shin". */
  contact: string;
  joinedAt: string;
  rating: number;
  /** Sales both students confirmed. Only these count. */
  sold: number;
  /** Dollars from confirmed sales. */
  earned: number;
  /** Confirmed sales at $0. */
  givenAway: number;
  /** Highest badge earned, shown beside their name. Computed by the API. */
  topBadge: BadgeId | null;
  bought: number;
  notifyReservations: boolean;
  notifyVerification: boolean;
};

export type ProfileChanges = Partial<
  Pick<User, 'fullName' | 'major' | 'year' | 'hometown' | 'contact' | 'look' | 'notifyReservations' | 'notifyVerification'>
>;

export type Category = 'dorm' | 'books' | 'clothes' | 'tech' | 'bikes' | 'other';
export type Condition = 'New' | 'Like new' | 'Good' | 'Fair' | 'Used';
export type ListingStatus = 'available' | 'reserved' | 'sold';

export type Listing = {
  id: string;
  title: string;
  /** US dollars, as in the designs. 0 means free. */
  price: number;
  category: Category;
  condition: Condition;
  description: string;
  /** Local or remote image URIs. Empty means the category artwork is shown. */
  photos: string[];
  meetup: string;
  sellerId: string;
  universityId: string;
  status: ListingStatus;
  createdAt: string;
  views: number;
};

export type ListingWithSeller = Listing & { seller: User; saved: boolean };

export const HOLD_HOURS = 72;
export const PRICE_CHANGE_RESPONSE_HOURS = 12;

export type PriceChange = { from: number; to: number; respondBy: string };

export type Reservation = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  /** The hold is released at this time if nothing happens. */
  expiresAt: string;
  status: 'active' | 'cancelled' | 'completed';
  /** The seller changed the price; the buyer must accept or cancel. */
  priceChange: PriceChange | null;
  /**
   * A sale is real only when both students confirm it. Either side can go first;
   * the hold pauses while one confirmation is waiting.
   */
  sellerConfirmedAt: string | null;
  buyerConfirmedAt: string | null;
};

export type ReservationDetail = Reservation & { listing: Listing; buyer: User; seller: User };

export type SellingSummary = {
  active: ListingWithSeller[];
  sold: ListingWithSeller[];
  /** Reservation on each reserved listing, keyed by listing id. */
  reservations: Record<string, ReservationDetail>;
  stats: { active: number; sold: number; earned: number };
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: 'text' | 'offer';
  body: string;
  amount?: number;
  createdAt: string;
};

export type Conversation = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  updatedAt: string;
};

export type ConversationSummary = Conversation & {
  listing: Listing;
  other: User;
  lastMessage: Message | null;
  unread: number;
};

export type AppNotification = {
  id: string;
  kind: 'verified' | 'reserved' | 'price' | 'message' | 'tip' | 'confirm' | 'badge';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ReportReason = 'photos' | 'scam' | 'not-allowed' | 'rude';

export type ReportInput = {
  target: 'listing' | 'seller';
  listingId: string;
  reason: ReportReason;
  details: string;
  evidence: string[];
};

export type Report = ReportInput & { id: string; reporterId: string; createdAt: string };

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  universityId: string;
  gender: Gender;
  studentIdFront: string;
  studentIdBack: string;
};

export type NewListingInput = Pick<Listing, 'title' | 'price' | 'category' | 'condition' | 'description' | 'photos' | 'meetup'>;

export type ListingSort = 'newest' | 'price-low' | 'price-high';

export type ListingQuery = {
  universityId?: string | null;
  search?: string;
  category?: Category | null;
  conditions?: Condition[];
  maxPrice?: number | null;
  sort?: ListingSort;
  savedBy?: string;
  /** Leave out the viewer's own listings. */
  excludeSellerId?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type BadgeId =
  | 'verified'
  | 'first-loop'
  | 'rising-seller'
  | 'campus-trader'
  | 'loop-legend'
  | 'big-earner'
  | 'five-star'
  | 'free-spirit'
  | 'first-find'
  | 'regular';

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export type Badge = {
  id: BadgeId;
  title: string;
  description: string;
  emoji: string;
  tier: BadgeTier;
  group: 'selling' | 'buying' | 'trust';
  earned: boolean;
  /** Where the student is now, and what unlocks it, e.g. 12 of 25 sales. */
  current: number;
  goal: number;
  unit: string;
};

export type SaleConfirmation = {
  /** Both sides have confirmed: the sale counts. */
  completed: boolean;
  /** Badges this confirmation just unlocked for the person who confirmed. */
  newBadges: Badge[];
};
