import type { AppNotification, Conversation, Listing, Message, Report, Reservation, User } from '@/lib/api/types';

// In-memory seed data, modelled on the Figma flows. Everything resets on reload.

const HOUR = 3_600_000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();
const fromNow = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

type StoredUser = User & { password: string };

function person(user: Partial<StoredUser> & Pick<User, 'id' | 'fullName' | 'email' | 'universityId' | 'gender'>): StoredUser {
  return {
    password: 'password123',
    verification: 'verified',
    look: 0,
    major: '',
    year: '',
    hometown: '',
    contact: '',
    joinedAt: ago(24 * 200),
    rating: 4.8,
    earned: 45,
    givenAway: 0,
    topBadge: null,
    sold: 3,
    bought: 2,
    notifyReservations: true,
    notifyVerification: true,
    ...user,
  };
}

function item(listing: Partial<Listing> & Pick<Listing, 'id' | 'title' | 'price' | 'category' | 'sellerId' | 'universityId'>): Listing {
  return {
    condition: 'Good',
    description: '',
    photos: [],
    meetup: 'Main library steps',
    status: 'available',
    createdAt: ago(5),
    views: 12,
    ...listing,
  };
}

export const db = {
  users: [
    person({ id: 'u-demo', fullName: 'Shin Thant', email: 'demo@gmail.com', universityId: 'tukse', gender: 'male', look: 3, major: 'Computer Science', year: 'Year 3', hometown: 'Kyaukse', contact: 'Telegram @shin', rating: 4.9, sold: 12, earned: 240, bought: 5 }),
    person({ id: 'u-wytu', fullName: 'Thandar Win', email: 'wytu.demo@gmail.com', universityId: 'wytu', gender: 'female', look: 1, major: 'Civil Engineering', year: 'Year 2', hometown: 'Yangon', contact: 'Viber 09 7xx xxx', rating: 4.7, sold: 4, bought: 6 }),
    person({ id: 'u-zaw', fullName: 'Zaw Lin', email: 'zaw.lin@gmail.com', universityId: 'tukse', gender: 'male', look: 2, major: 'Physics', year: 'Year 2', hometown: 'Mandalay', rating: 4.9, sold: 27, earned: 410, givenAway: 2 }),
    person({ id: 'u-aung', fullName: 'Aung M.', email: 'aung.m@gmail.com', universityId: 'tukse', gender: 'male', look: 4, major: 'CS', year: 'Year 1', hometown: 'Kyaukse', rating: 4.6, sold: 1 }),
    person({ id: 'u-kyaw', fullName: 'Kyaw Zin', email: 'kyaw.zin@gmail.com', universityId: 'tukse', gender: 'male', look: 5, major: 'Mechanical', year: 'Year 4', rating: 4.8, sold: 9, earned: 150 }),
    person({ id: 'u-nwe', fullName: 'Nwe Ni', email: 'nwe.ni@gmail.com', universityId: 'tukse', gender: 'female', look: 1, major: 'Electronics', year: 'Year 3', rating: 5, sold: 7, earned: 120 }),
    person({ id: 'u-koko', fullName: 'Ko Ko', email: 'ko.ko@gmail.com', universityId: 'wytu', gender: 'male', look: 2, major: 'Mechatronics', year: 'Year 3' }),
    person({ id: 'u-pyae', fullName: 'Pyae Phyo', email: 'pyae.phyo@gmail.com', universityId: 'utycc', gender: 'male', look: 5, major: 'IT', year: 'Year 2' }),
    person({ id: 'u-hsu', fullName: 'Hsu Yee', email: 'hsu.yee@gmail.com', universityId: 'miit', gender: 'female', look: 1, major: 'Computer Science', year: 'Year 4' }),
    person({ id: 'u-may', fullName: 'May Thu', email: 'may.thu@gmail.com', universityId: 'sfu', gender: 'female', look: 0, major: 'Business IT', year: 'Year 1' }),
  ] as StoredUser[],

  listings: [
    // TUKSE: the hoodie and calculator the demo student has on hold.
    item({ id: 'l-hoodie', title: 'Campus hoodie, size M', price: 18, category: 'clothes', condition: 'Like new', description: 'Official TU hoodie, worn twice. No stains or pilling. Fits true to size.', sellerId: 'u-zaw', universityId: 'tukse', status: 'reserved', createdAt: ago(3), views: 48, meetup: 'Main library steps' }),
    item({ id: 'l-calc', title: 'TI-84 Plus calculator', price: 50, category: 'tech', condition: 'Good', description: 'Works perfectly, new batteries. Cover included.', sellerId: 'u-zaw', universityId: 'tukse', status: 'reserved', createdAt: ago(40), views: 31 }),
    item({ id: 'l-shelf', title: 'Bookshelf, 3 tier', price: 15, category: 'dorm', condition: 'Good', description: 'Sturdy, fits a hostel corner. Easy to carry.', sellerId: 'u-nwe', universityId: 'tukse', status: 'reserved', createdAt: ago(48), views: 20, meetup: 'Hostel A lobby' }),
    // TUKSE: what the demo student is selling.
    item({ id: 'l-fridge', title: 'Mini fridge, 3.1 cu ft', price: 60, category: 'dorm', condition: 'Used', description: 'Quiet, keeps drinks cold. Moving out of the hostel.', sellerId: 'u-demo', universityId: 'tukse', status: 'reserved', createdAt: ago(60), views: 64, meetup: 'Hostel B gate' }),
    item({ id: 'l-lamp', title: 'Adjustable LED desk lamp', price: 12, category: 'dorm', condition: 'Like new', description: 'Three brightness levels, USB powered.', sellerId: 'u-demo', universityId: 'tukse', createdAt: ago(9), views: 11 }),
    item({ id: 'l-hoodie-l', title: 'Campus hoodie, size L', price: 16, category: 'clothes', condition: 'Good', description: 'Grew out of it. Washed and folded.', sellerId: 'u-demo', universityId: 'tukse', createdAt: ago(30), views: 9 }),
    item({ id: 'l-bike', title: 'City bike', price: 65, category: 'bikes', condition: 'Good', sellerId: 'u-demo', universityId: 'tukse', status: 'sold', createdAt: ago(24 * 9) }),
    item({ id: 'l-drawing', title: 'Engineering drawing set', price: 19, category: 'other', condition: 'Fair', sellerId: 'u-demo', universityId: 'tukse', status: 'sold', createdAt: ago(24 * 14) }),
    // TUKSE: the rest of the campus market.
    item({ id: 'l-calculus', title: 'Calculus: Early Transcendentals', price: 14, category: 'books', condition: 'Good', description: '8th edition. Some highlighting in chapters 2 and 3.', sellerId: 'u-kyaw', universityId: 'tukse', createdAt: ago(1), views: 22 }),
    item({ id: 'l-headphones', title: 'Wireless headphones', price: 25, category: 'tech', condition: 'Like new', description: 'Noise cancelling, 20h battery. Box included.', sellerId: 'u-nwe', universityId: 'tukse', createdAt: ago(2), views: 40 }),
    item({ id: 'l-fan', title: 'Desk fan', price: 9, category: 'dorm', condition: 'Good', sellerId: 'u-kyaw', universityId: 'tukse', createdAt: ago(6) }),
    item({ id: 'l-casio', title: 'Casio fx-991ES Plus', price: 11, category: 'tech', condition: 'Like new', description: 'Allowed in exams.', sellerId: 'u-nwe', universityId: 'tukse', createdAt: ago(7), views: 17 }),
    item({ id: 'l-engmath', title: 'Engineering Mathematics', price: 10, category: 'books', condition: 'Used', sellerId: 'u-aung', universityId: 'tukse', createdAt: ago(12) }),
    item({ id: 'l-uniform', title: 'Uniform longyi, blue', price: 6, category: 'clothes', condition: 'Good', sellerId: 'u-nwe', universityId: 'tukse', createdAt: ago(20) }),
    item({ id: 'l-ricecooker', title: 'Mini rice cooker', price: 22, category: 'dorm', condition: 'Like new', sellerId: 'u-kyaw', universityId: 'tukse', createdAt: ago(26) }),
    item({ id: 'l-bike2', title: 'Mountain bike, 26"', price: 70, category: 'bikes', condition: 'Good', sellerId: 'u-aung', universityId: 'tukse', createdAt: ago(34), views: 55 }),
    item({ id: 'l-physics', title: 'University Physics, vol. 1', price: 0, category: 'books', condition: 'Fair', description: 'Free to a first year. Cover is torn.', sellerId: 'u-zaw', universityId: 'tukse', createdAt: ago(50) }),
    // Other campuses.
    item({ id: 'l-w1', title: 'Drafting table lamp', price: 13, category: 'dorm', sellerId: 'u-koko', universityId: 'wytu', createdAt: ago(2) }),
    item({ id: 'l-w2', title: 'Arduino starter kit', price: 28, category: 'tech', condition: 'Like new', sellerId: 'u-wytu', universityId: 'wytu', createdAt: ago(8) }),
    item({ id: 'l-w3', title: 'WYTU hoodie, size S', price: 15, category: 'clothes', sellerId: 'u-koko', universityId: 'wytu', createdAt: ago(18) }),
    item({ id: 'l-u1', title: 'Mechanical keyboard', price: 35, category: 'tech', condition: 'Like new', sellerId: 'u-pyae', universityId: 'utycc', createdAt: ago(3) }),
    item({ id: 'l-u2', title: 'Data Structures in C', price: 9, category: 'books', sellerId: 'u-pyae', universityId: 'utycc', createdAt: ago(15) }),
    item({ id: 'l-m1', title: 'Clean Code (paperback)', price: 12, category: 'books', sellerId: 'u-hsu', universityId: 'miit', createdAt: ago(4) }),
    item({ id: 'l-m2', title: 'USB-C monitor, 15.6"', price: 80, category: 'tech', condition: 'Like new', sellerId: 'u-hsu', universityId: 'miit', createdAt: ago(22) }),
    item({ id: 'l-s1', title: 'Business Statistics', price: 14, category: 'books', sellerId: 'u-may', universityId: 'sfu', createdAt: ago(5) }),
    item({ id: 'l-s2', title: 'Standing desk fan', price: 18, category: 'dorm', sellerId: 'u-may', universityId: 'sfu', createdAt: ago(28) }),
  ] as Listing[],

  reservations: [
    { id: 'r-hoodie', listingId: 'l-hoodie', buyerId: 'u-demo', sellerId: 'u-zaw', createdAt: ago(1), expiresAt: fromNow(71), status: 'active', priceChange: null, sellerConfirmedAt: null, buyerConfirmedAt: null },
    { id: 'r-calc', listingId: 'l-calc', buyerId: 'u-demo', sellerId: 'u-zaw', createdAt: ago(30), expiresAt: fromNow(42), status: 'active', priceChange: { from: 45, to: 50, respondBy: fromNow(12) }, sellerConfirmedAt: null, buyerConfirmedAt: null },
    { id: 'r-fridge', listingId: 'l-fridge', buyerId: 'u-aung', sellerId: 'u-demo', createdAt: ago(30), expiresAt: fromNow(42), status: 'active', priceChange: null, sellerConfirmedAt: null, buyerConfirmedAt: null },
    // Nwe Ni says she handed over the bookshelf; the demo student still has to confirm.
    { id: 'r-shelf', listingId: 'l-shelf', buyerId: 'u-demo', sellerId: 'u-nwe', createdAt: ago(26), expiresAt: fromNow(46), status: 'active', priceChange: null, sellerConfirmedAt: ago(1.5), buyerConfirmedAt: null },
  ] as Reservation[],

  /** userId -> saved listing ids */
  saves: { 'u-demo': ['l-headphones'] } as Record<string, string[]>,

  conversations: [
    { id: 'c-hoodie', listingId: 'l-hoodie', buyerId: 'u-demo', sellerId: 'u-zaw', updatedAt: ago(0.5) },
    { id: 'c-fridge', listingId: 'l-fridge', buyerId: 'u-aung', sellerId: 'u-demo', updatedAt: ago(2) },
  ] as Conversation[],

  messages: [
    { id: 'm-1', conversationId: 'c-hoodie', senderId: 'u-demo', kind: 'text', body: 'Hi! I just reserved the hoodie 🙌', createdAt: ago(0.8) },
    { id: 'm-2', conversationId: 'c-hoodie', senderId: 'u-zaw', kind: 'text', body: 'Great! Library steps after 3 pm tomorrow?', createdAt: ago(0.5) },
    { id: 'm-3', conversationId: 'c-fridge', senderId: 'u-aung', kind: 'text', body: 'Can I pick up the fridge on Saturday morning?', createdAt: ago(2) },
  ] as Message[],

  /** conversationId -> userId -> last read ISO time */
  reads: { 'c-hoodie': { 'u-demo': ago(0.7) }, 'c-fridge': {} } as Record<string, Record<string, string>>,

  notifications: {} as Record<string, AppNotification[]>,

  reports: [] as Report[],
};

export function starterNotifications(user: User): AppNotification[] {
  return [
    user.verification === 'verified'
      ? { id: `${user.id}-n1`, kind: 'verified', title: 'Student ID verified', body: 'You can now reserve and sell on your campus market.', createdAt: ago(24), read: true }
      : { id: `${user.id}-n1`, kind: 'tip', title: 'Student ID in review', body: 'We usually verify within 24 hours. Browse while you wait.', createdAt: ago(0.1), read: false },
    { id: `${user.id}-n2`, kind: 'price', title: 'Zaw Lin changed the price', body: 'TI-84 Plus calculator is now $50. Respond within 12 hours.', createdAt: ago(1), read: false },
    { id: `${user.id}-n3`, kind: 'reserved', title: 'Aung M. reserved your mini fridge', body: 'They have 72 hours to meet you and pay.', createdAt: ago(30), read: false },
    { id: `${user.id}-n4`, kind: 'tip', title: 'Sell faster with photos', body: 'Listings with 3+ photos get twice as many reservations.', createdAt: ago(48), read: true },
  ];
}

export function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
