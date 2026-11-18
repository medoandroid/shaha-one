export interface Category {
  id: string;
  nameAr: string;
  icon: string;
  descriptionAr: string;
  order: number;
  isActive: boolean;
  subcategories: string[];
  featured?: boolean;
}

export type ListingEntityType = 'person' | 'shop' | 'service' | 'place' | 'company';

export interface ListingSocialLink {
  title: string;
  url: string;
  icon?: string;
}

export type VerificationBadgeShape =
  | 'scalloped_circle'
  | 'shield'
  | 'star'
  | 'diamond'
  | 'hex'
  | 'circle'
  | 'rosette';

export interface VerificationBadge {
  id: string;
  nameAr: string;
  descriptionAr: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'gold' | 'cyan';
  icon: string;
  shape?: VerificationBadgeShape;
  customSvgUrl?: string;
  customImageUrl?: string;
  targetEntityTypes?: ListingEntityType[];
  priority?: number;
  isActive: boolean;
  isOfficial?: boolean;
  createdAt?: string;
}

export interface VerificationAuditEntry {
  badgeId: string;
  badgeName?: string;
  grantedBy: string;
  grantedAt: string;
  reason?: string;
}

export interface Listing {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  name: string;
  entityType?: ListingEntityType;
  titleOrSpecialty?: string;
  phone: string;
  whatsapp?: string;
  secondaryPhone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  socialLinks?: ListingSocialLink[];
  address: string;
  latitude?: number;
  longitude?: number;
  showMap?: boolean;
  workingHours?: string;
  isOpenNow?: boolean;
  availabilityStatus?: 'open_now' | 'closed' | 'out_of_hours' | 'accepting_requests';
  experienceYears?: number | string;
  servicesProvided?: string[];
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  photos?: string[];
  googleMapsUrl?: string;
  isVerified?: boolean;
  primaryBadgeId?: string;
  verificationBadges?: string[];
  verificationHistory?: VerificationAuditEntry[];
  isFeatured?: boolean;
  deliveryAvailable?: boolean;
  viewsCount?: number;
  callsCount?: number;
  sharesCount?: number;
  qrScansCount?: number;
  rating?: number;
  ratingsCount?: number;
  status: 'active' | 'hidden';
  // Next-Gen Attributes
  qualityScore?: number;
  completenessLevel?: 'high' | 'medium' | 'low';
  qualityIssues?: string[];
  ownerUserId?: string;
  claimStatus?: 'unclaimed' | 'pending' | 'claimed';
  publishAt?: string;
  expireAt?: string;
  customAttributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimListingRequest {
  id: string;
  listingId: string;
  listingName: string;
  ownerName: string;
  contactPhone: string;
  proofNotes: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  applicantUserId?: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface CommunitySuggestion {
  id: string;
  type: 'service' | 'category' | 'improvement';
  title: string;
  description: string;
  suggestedBy: string;
  contactPhone?: string;
  upvotes: number;
  votedUsers?: string[];
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  applicantUserId?: string;
  createdAt: string;
}

export interface FeatureFlagsConfig {
  enableClaims: boolean;
  enableReviews: boolean;
  enableCommunityVoting: boolean;
  enableDataQualityScanner: boolean;
  enableDirectMessaging: boolean;
  enableSmartNotifications: boolean;
  enableScheduledPublishing: boolean;
  enableCSVImport: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'claim_update' | 'message_reply';
  targetUserId?: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface DuplicatePair {
  listingA: Listing;
  listingB: Listing;
  reason: string;
  similarityScore: number;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  area: string;
  isAvailable: boolean;
  consentGiven: boolean;
  lastDonatedDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodRequest {
  id: string;
  patientName?: string;
  bloodGroup: string;
  unitsNeeded?: number;
  hospital: string;
  contactPhone: string;
  status: 'urgent' | 'fulfilled' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  applicantName?: string;
  applicantPhone: string;
  categoryId: string;
  subcategoryId?: string;
  serviceName: string;
  specialty?: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  workingHours?: string;
  notes?: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  listingName?: string;
  reportType: 'wrong_number' | 'closed' | 'changed_owner' | 'remove_request' | 'other';
  details: string;
  contactPhone?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  userName: string;
  userId?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  rejectionReason?: string;
  createdAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
  reportsCount?: number;
}

export type HumanitarianCategory =
  | 'medical_aid'
  | 'food_aid'
  | 'financial_aid'
  | 'medical_equipment'
  | 'debt_relief'
  | 'clothing'
  | 'other';

export type HumanitarianStatus =
  | 'new'
  | 'under_review'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type HumanitarianRequestType = 'need' | 'donor_offer';
export type HumanitarianPrivacy = 'private' | 'public' | 'anonymous';

export interface HumanitarianRequest {
  id: string;
  title: string;
  requestType?: HumanitarianRequestType;
  category: HumanitarianCategory;
  beneficiaryName: string;
  contactPhone: string;
  areaOrVillage: string;
  description: string;
  donorDetails?: string;
  amountNeeded?: number;
  amountRaised?: number;
  urgency: 'critical' | 'high' | 'normal';
  privacy?: HumanitarianPrivacy;
  documents?: string[];
  status: HumanitarianStatus;
  statusUpdateNote?: string;
  adminNotes?: string;
  isPubliclyVisible?: boolean;
  applicantUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DonorCategory = 'money' | 'clothes' | 'food' | 'medicine' | 'equipment' | 'other';
export type SafeContactMethod = 'via_admin' | 'direct_phone' | 'direct_whatsapp';

export interface DonorEntry {
  id: string;
  donorName: string;
  donorType: 'individual' | 'group' | 'business';
  donationCategory: DonorCategory;
  donationDetails: string;
  area: string;
  isPublic: boolean;
  isAnonymous: boolean;
  status: 'available' | 'paused' | 'fulfilled';
  safeContactMethod: SafeContactMethod;
  phone?: string;
  whatsapp?: string;
  userId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminMessageTopic =
  | 'inquiry'
  | 'suggestion'
  | 'complaint'
  | 'help_request'
  | 'edit_delete_data'
  | 'owner_contact';

export type AdminMessageStatus = 'new' | 'under_review' | 'replied' | 'closed';

export interface AdminMessage {
  id: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  userId?: string;
  topic: AdminMessageTopic;
  subject: string;
  message: string;
  status: AdminMessageStatus;
  adminReply?: string;
  repliedBy?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
}

export interface CommunityFacebookPage {
  id: string;
  name: string;
  url: string;
  description: string;
  followers?: string;
  category?: string;
  isVerified: boolean;
  verifiedBadgeId?: string;
  isActive: boolean;
  order: number;
  addedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CharityInitiative {
  id: string;
  title: string;
  type: string;
  description: string;
  contactPerson?: string;
  phone: string;
  address?: string;
  privacyNotice?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface EmergencyNumber {
  id: string;
  titleAr: string;
  phone: string;
  category: 'medical' | 'security' | 'utilities' | 'local';
  descriptionAr: string;
  order: number;
}

export type AdPlacement = 'top_banner' | 'hero_slider' | 'popup_modal' | 'feed_interstitial' | 'category_page' | 'floating_widget' | 'deals_stories';
export type AdBadgeType = 'offer' | 'discount' | 'announcement' | 'urgent' | 'featured' | 'sponsored' | 'pinned' | 'exclusive';
export type AdDisplayFormat = 'card' | 'banner' | 'story_circle' | 'floating_bar' | 'interstitial' | 'badge_ribbon';
export type AdTemplateType = 'image_banner' | 'text_announcement' | 'deal_card' | 'badge_ribbon' | 'ticker_bar' | 'compact_badge';

export type NewsCategory = 'general' | 'emergency' | 'services' | 'projects' | 'events' | 'community';

export interface VillageNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  categoryLabel?: string;
  imageUrl?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  isUrgent?: boolean;
  viewsCount?: number;
  authorName?: string;
  publisherName?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  placement: AdPlacement;
  placements?: AdPlacement[];
  displayFormat?: AdDisplayFormat;
  templateType?: AdTemplateType;
  badgeType?: AdBadgeType;
  badgeText?: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain';
  linkUrl?: string;
  ctaText?: string;
  phone?: string;
  whatsapp?: string;
  discountPercent?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isPinned?: boolean;
  priority?: number;
  order?: number;
  displayRotation?: 'pinned' | 'priority' | 'random' | 'scheduled';
  viewsCount?: number;
  clicksCount?: number;
  backgroundColor?: string;
  targetCategory?: string;
  allowSkip?: boolean;
  skipTimerSeconds?: number;
  displayDurationSeconds?: number;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  adminUser: string;
  target?: string;
  timestamp: string;
  details?: string;
}

export type AdminPermission =
  | 'manage_overview'
  | 'manage_listings'
  | 'manage_categories'
  | 'manage_requests'
  | 'manage_reports'
  | 'manage_blood'
  | 'manage_charity'
  | 'manage_emergency'
  | 'manage_users'
  | 'manage_admins'
  | 'manage_settings'
  | 'manage_audit'
  | 'manage_texts'
  | 'manage_ads'
  | 'manage_badges'
  | 'manage_reviews'
  | 'manage_aid'
  | 'manage_messages'
  | 'manage_community_pages'
  | 'manage_claims'
  | 'manage_suggestions'
  | 'manage_quality'
  | 'manage_import'
  | 'manage_news';

export interface AdminMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  isBanned?: boolean;
  banReason?: string;
  bannedUntil?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface PlatformCredit {
  id: string;
  name: string;
  role: string;
  description?: string;
  link?: string;
  linkUrl?: string;
  avatarUrl?: string;
  badge?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DayScheduleEntry {
  dayName: string;
  dayKey: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  hospitalName: string;
  phone: string;
  notes?: string;
}

export interface EmergencyHospitalSchedule {
  id: string;
  title?: string;
  titleAr?: string;
  descriptionAr?: string;
  lastUpdated?: string;
  lastUpdatedText?: string;
  days: DayScheduleEntry[];
  importantPhones: {
    label: string;
    phone: string;
  }[];
  hospitalContacts?: {
    hospitalName: string;
    phone: string;
    address?: string;
  }[];
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}


