import {
  Category,
  EmergencyNumber,
  Listing,
  CharityInitiative,
  Advertisement,
  VerificationBadge,
  HumanitarianRequest,
  DonorEntry,
  CommunityFacebookPage,
  AdminMessage,
  VillageNews,
  PlatformCredit,
  EmergencyHospitalSchedule
} from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'doctors',
    nameAr: 'أطباء شها',
    icon: 'Stethoscope',
    descriptionAr: 'عيادات ومراكز الأطباء بجميع التخصصات الطبية داخل شها ومحيطها',
    order: 1,
    isActive: true,
    featured: true,
    subcategories: [
      'أطباء الباطنة',
      'أطباء الأطفال',
      'أطباء القلب والأوعية',
      'أطباء الأسنان',
      'أطباء النساء والتوليد',
      'أطباء العظام والمفاصل',
      'أطباء العيون والليزك',
      'أطباء الأنف والأذن والحنجرة',
      'أطباء الجلدية والتجميل',
      'أطباء المخ والأعصاب',
      'أطباء المسالك البولية',
      'أطباء الجراحة العامة',
      'أطباء العلاج الطبيعي والتأهيل',
      'جميع التخصصات الأخرى'
    ]
  },
  {
    id: 'pharmacies',
    nameAr: 'صيدليات شها',
    icon: 'Pill',
    descriptionAr: 'صيدليات القرية مع أرقام الطوارئ الليلية وخدمات توصيل العلاج للمنازل',
    order: 2,
    isActive: true,
    featured: true,
    subcategories: [
      'صيدليات تعمل 24 ساعة',
      'خدمة توصيل أدوية',
      'قياس ضغط وسكر وتركيب كانيولا',
      'مستلزمات طبية وأطفال'
    ]
  },
  {
    id: 'teachers',
    nameAr: 'مدرسين شها',
    icon: 'GraduationCap',
    descriptionAr: 'نخبة من معلمي ومعلمات المراحل الابتدائية والإعدادية والثانوية والجامعية',
    order: 3,
    isActive: true,
    featured: true,
    subcategories: [
      'مدرسين اللغة العربية',
      'مدرسين اللغة الإنجليزية',
      'مدرسين اللغة الفرنسية',
      'مدرسين الرياضيات',
      'مدرسين العلوم',
      'مدرسين الفيزياء',
      'مدرسين الكيمياء',
      'مدرسين الأحياء والجيولوجيا',
      'مدرسين الدراسات الاجتماعية',
      'مدرسين المرحلة الابتدائية',
      'مدرسين المرحلة الإعدادية',
      'مدرسين المرحلة الثانوية',
      'مدرسين التأسيس والقراءة ونور البيان',
      'مدرسين الجامعات والمعاهد'
    ]
  },
  {
    id: 'groceries',
    nameAr: 'محلات البقالة والتموين',
    icon: 'ShoppingCart',
    descriptionAr: 'محلات البقالة والسوبر ماركت والجزارة والدواجن والخضار والألبان',
    order: 4,
    isActive: true,
    featured: true,
    subcategories: [
      'سوبر ماركت',
      'بقالة ومواد غذائية',
      'محلات منظفات وأدوات منزلية',
      'محلات ألبان وأجبان',
      'محلات خضار وفاكهة',
      'محلات جزارة ولحوم بلدية',
      'محلات دواجن وطيور',
      'محلات مجمدات وأسماك'
    ]
  },
  {
    id: 'restaurants',
    nameAr: 'مطاعم وكافيهات شها',
    icon: 'UtensilsCrossed',
    descriptionAr: 'مطاعم الوجبات السريعة والمشويات والفطائر والكشري والكافيهات والمخابز',
    order: 5,
    isActive: true,
    featured: true,
    subcategories: [
      'مطاعم وجبات جاهزة',
      'مشويات وكباب',
      'محلات بيتزا وفطائر',
      'محلات كشري',
      'سندوتشات وشاورما',
      'مخابز وأفران عيش بلدي وفينو',
      'محلات حلويات شرقية وغربية',
      'كافيهات ومقاهي'
    ]
  },
  {
    id: 'schools',
    nameAr: 'مدارس ومعاهد شها',
    icon: 'School',
    descriptionAr: 'المدارس الحكومية والأزهرية والحضانات الخاصة والمعاهد التعليمية',
    order: 6,
    isActive: true,
    subcategories: [
      'المدارس الابتدائية',
      'المدارس الإعدادية',
      'المدارس الثانوية',
      'المعاهد الأزهرية',
      'الحضانات النموذجية',
      'المدارس التجريبية والخاصة',
      'مراكز الدروس والمجموعات'
    ]
  },
  {
    id: 'laboratories',
    nameAr: 'معامل التحاليل والأشعة',
    icon: 'FlaskConical',
    descriptionAr: 'معامل الفحوصات والتحاليل الطبية الدقيقة ومراكز الأشعة',
    order: 7,
    isActive: true,
    subcategories: [
      'معامل التحاليل الطبية',
      'سحب عينات منزلي',
      'معامل الأشعة التشخيصية',
      'مراكز السونار ورسم القلب'
    ]
  },
  {
    id: 'lawyers',
    nameAr: 'محامين واستشارات قانونية',
    icon: 'Scale',
    descriptionAr: 'مكاتب المحاماة والاستشارات القانونية المتخصصة في القضايا المختلفة',
    order: 8,
    isActive: true,
    subcategories: [
      'محامون مدني وتعويضات',
      'محامون جنائي',
      'محامون محكمة الأسرة',
      'محامون تجاري وقضايا شركات',
      'قضايا عمالية وتأمينات',
      'استشارات قانونية وتوثيق عقود'
    ]
  },
  {
    id: 'stationery',
    nameAr: 'مكتبات وخدمات طلابية',
    icon: 'BookOpen',
    descriptionAr: 'المكتبات المدرسية وتصوير المستندات والطباعة والخدمات الطلابية',
    order: 9,
    isActive: true,
    subcategories: [
      'مكتبات أدوات ومستلزمات مدرسية',
      'تصوير وطباعة مستندات',
      'خدمات طلابية وأبحاث',
      'مستلزمات كمبيوتر وتصميم ودعاية',
      'تجليد وتغليف كتب'
    ]
  },
  {
    id: 'mosques',
    nameAr: 'مساجد شها والأنشطة الدينية',
    icon: 'Landmark',
    descriptionAr: 'مساجد القرية ومواقيت خطب الجمعة ومقارئ تحفيظ القرآن الكريم',
    order: 10,
    isActive: true,
    subcategories: [
      'المساجد الكبرى والمنابر',
      'مقارئ ومكاتب تحفيظ القرآن',
      'أنشطة ودروس دينية',
      'أماكن مصليات السيدات',
      'لجان مصالحات وتوزيع زكاة'
    ]
  },
  {
    id: 'transport',
    nameAr: 'سواقين ونقل ومشاوير',
    icon: 'Car',
    descriptionAr: 'خدمات التاكسي والملاكي والميكروباص ونقل البضائع والمشاوير الخاصة',
    order: 11,
    isActive: true,
    subcategories: [
      'سيارات ملاكي مشاوير خاصة',
      'تاكسي المنصورة وشها',
      'ميكروباص ونقل جماعي',
      'نقل بضائع وعفش',
      'توصيل طلبات ومشاوير سريعة'
    ]
  },
  {
    id: 'craftsmen',
    nameAr: 'مهن حرة وصنايعية شها',
    icon: 'Wrench',
    descriptionAr: 'سباكين، كهربائيين، نجارين، نقاشين، وفنيين لجميع أعمال الصيانة المنزلية',
    order: 12,
    isActive: true,
    featured: true,
    subcategories: [
      'سباكين وأعمال صحية',
      'كهربائيين تأسيس وصيانة',
      'نجارين باب وشباك وموبيليا',
      'نقاشين ودهانات وديكور',
      'حدادين وأعمال كريتال',
      'فنيي تكييف وتبريد',
      'صيانة غسالات وثلاجات وأجهزة منزلية',
      'عمال بناء ومحارة وسيراميك',
      'مصورين وفوتوغرافر',
      'حلاقين وكوافير رجالي',
      'ترزية وخياطين',
      'صيانة كمبيوتر وموبايل'
    ]
  },
  {
    id: 'delivery',
    nameAr: 'توصيل طلبات ودليفري',
    icon: 'PackageCheck',
    descriptionAr: 'مناديب توصيل الطلبات السريعة من المطاعم والصيدليات والمتاجر',
    order: 13,
    isActive: true,
    subcategories: [
      'مندوبين توصيل مستقلين',
      'دليفري مطاعم ومأكولات',
      'توصيل علاج ومستلزمات صيدلية',
      'شحن وطرود داخلية'
    ]
  },
  {
    id: 'charity',
    nameAr: 'تواصل الخيرية ومساعدات',
    icon: 'HeartHandshake',
    descriptionAr: 'الجمعيات الخيرية ومبادرات الإطعام وكفالة الأسر والأيتام في شها',
    order: 14,
    isActive: true,
    featured: true,
    subcategories: [
      'جمعيات خيرية مشهرة',
      'مبادرات كفالة الأيتام',
      'مساعدات علاج وعمليات جراحية',
      'توزيع سلع غذائية وأطعمة',
      'تجهيز عرائس أيتام'
    ]
  },
  {
    id: 'blood_bank',
    nameAr: 'فصائل الدم وبنك الطوارئ',
    icon: 'Droplet',
    descriptionAr: 'سجل المتبرعين بالدم في شها وطلبات التبرع العاجلة لحفظ الأرواح',
    order: 15,
    isActive: true,
    featured: true,
    subcategories: [
      'فصيلة A+',
      'فصيلة A-',
      'فصيلة B+',
      'فصيلة B-',
      'فصيلة O+',
      'فصيلة O- (فصيلة كريمة ونادرة)',
      'فصيلة AB+',
      'فصيلة AB-'
    ]
  }
];

export const INITIAL_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    id: 'em-1',
    titleAr: 'إسعاف مصر وطوارئ شها',
    phone: '123',
    category: 'medical',
    descriptionAr: 'طوارئ الإسعاف المركزي لنقل الحالات الحرجة والحوادث مجاناً على مدار 24 ساعة',
    order: 1
  },
  {
    id: 'em-2',
    titleAr: 'شرطة النجدة',
    phone: '122',
    category: 'security',
    descriptionAr: 'بلاغات الطوارئ الأمنية والنجدة السريعة',
    order: 2
  },
  {
    id: 'em-3',
    titleAr: 'المطافئ والحماية المدنية',
    phone: '180',
    category: 'security',
    descriptionAr: 'طوارئ إطفاء الحرائق والإنقاذ السريع بمحافظة الدقهلية',
    order: 3
  },
  {
    id: 'em-4',
    titleAr: 'طوارئ الكهرباء وشبكة شها',
    phone: '121',
    category: 'utilities',
    descriptionAr: 'بلاغات انقطاع التيار الكهربائي والأعطال والمحولات بشركة كهرباء شمال الدلتا',
    order: 4
  },
  {
    id: 'em-5',
    titleAr: 'طوارئ مياه الشرب والصرف الصحي',
    phone: '125',
    category: 'utilities',
    descriptionAr: 'أعطال وكسور مواسير مياه الشرب وشبكة الصرف الصحي بشها',
    order: 5
  },
  {
    id: 'em-6',
    titleAr: 'طوارئ الغاز الطبيعي',
    phone: '129',
    category: 'utilities',
    descriptionAr: 'طوارئ تسريب الغاز على مدار 24 ساعة',
    order: 6
  },
  {
    id: 'em-7',
    titleAr: 'وحدة صحة وطب الأسرة بشها',
    phone: '0502750000',
    category: 'medical',
    descriptionAr: 'الوحدة الصحية لقرية شها - خدمات التطعيمات وطب الأسرة والأمومة والطفولة',
    order: 7
  },
  {
    id: 'em-8',
    titleAr: 'مستشفى الطوارئ الجامعي بالمنصورة',
    phone: '0502202020',
    category: 'medical',
    descriptionAr: 'المستشفى المرجعي الرئيسي لحالات الحوادث والطوارئ الحرجة بمحافظة الدقهلية',
    order: 8
  },
  {
    id: 'em-9',
    titleAr: 'الوحدة المحلية بشها',
    phone: '0502750100',
    category: 'local',
    descriptionAr: 'مقر الوحدة المحلية القروية بشها - مركز المنصورة',
    order: 9
  }
];

export const INITIAL_PUBLIC_LISTINGS: Listing[] = [
  {
    id: 'pub-unit-health',
    categoryId: 'doctors',
    subcategoryId: 'أطباء الباطنة',
    name: 'وحدة صحة وطب الأسرة بشها',
    titleOrSpecialty: 'مركز الرعاية الأولية والتحصينات وطب الأسرة',
    phone: '0502750000',
    whatsapp: '01000000000',
    address: 'شارع داير الناحية - بجوار مركز الشباب - قرية شها',
    workingHours: 'يومياً من 8 صباحاً حتى 2 ظهراً (قسم الاستقبال والطوارئ متاح)',
    description: 'المركز الصحي الحكومي لقرية شها، يضم عيادات طب الأسرة، الأطفال، متابعة الحوامل، ومكتب تطعيمات الأطفال والصحة الوقائية.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 4.8,
    ratingsCount: 24,
    viewsCount: 520,
    callsCount: 78
  },
  {
    id: 'pub-doc-ahmed',
    categoryId: 'doctors',
    subcategoryId: 'أطباء الأطفال وحديثي الولادة',
    name: 'د. أحمد محمود الشهاوي',
    titleOrSpecialty: 'استشاري طب الأطفال وحديثي الولادة وحساسية الصدر',
    phone: '01012345678',
    whatsapp: '01012345678',
    address: 'شارع البحر الرئيسي - عمارة الشهاوي - الدور الأول - قرية شها',
    workingHours: 'يومياً من 5:00 مساءً حتى 10:00 مساءً عدا الجمعة',
    description: 'متابعة نمو الرضع وحديثي الولادة، علاج حساسية الصدر، النزلات المعوية، وفحوصات حديثي الولادة والمبتسرين بأحدث الأجهزة.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 4.9,
    ratingsCount: 52,
    viewsCount: 840,
    callsCount: 140
  },
  {
    id: 'pub-pharmacy-amal',
    categoryId: 'pharmacies',
    subcategoryId: 'صيدليات 24 ساعة',
    name: 'صيدلية الأمل المركزية',
    titleOrSpecialty: 'دواء واستشارات صيدلانية وخدمة قياس ضغط وسكر مجاناً',
    phone: '01098765432',
    whatsapp: '01098765432',
    address: 'ميدان المحطة - مقابل موقف شها المنصورة - قرية شها',
    workingHours: 'خدمة 24 ساعة طوال أيام الأسبوع وتوصيل منازل فوري',
    description: 'صيدلية شاملة لجميع الأدوية والمستلزمات الطبية وألبان الأطفال ومستحضرات العناية، مع خدمة التوصيل المنزلي لجميع أحياء شها.',
    imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 4.9,
    ratingsCount: 67,
    viewsCount: 1120,
    callsCount: 230
  },
  {
    id: 'pub-supermarket-baraka',
    categoryId: 'stores',
    subcategoryId: 'سوبر ماركت وبقالة',
    name: 'سوبر ماركت البركة والخير',
    titleOrSpecialty: 'مواد غذائية، منتجات ألبان طازجة، وخضروات وفاكهة يومية',
    phone: '01122334455',
    whatsapp: '01122334455',
    address: 'شارع المدارس - أمام مجمع المصالح - قرية شها',
    workingHours: 'يومياً من 7:00 صباحاً حتى 1:00 بعد منتصف الليل',
    description: 'أكبر تشكيلة للمنتجات الغذائية واللحوم المبردة والأجبان البلدي والمنظفات بأسعار الجملة وخدمة توصيل سريعة.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 4.8,
    ratingsCount: 41,
    viewsCount: 670,
    callsCount: 95
  },
  {
    id: 'pub-school-prep',
    categoryId: 'schools',
    subcategoryId: 'المدارس الإعدادية',
    name: 'مدرسة شها الإعدادية المشتركة',
    titleOrSpecialty: 'التعليم الإعدادي العام - إدارة شرق المنصورة التعليمية',
    phone: '0502750150',
    address: 'المدخل القبلي لقرية شها - مركز المنصورة',
    workingHours: 'من الأحد إلى الخميس من 7:30 صباحاً إلى 2:00 ظهراً',
    description: 'المدرسة الإعدادية الرسمية لخدمة أبناء وبنات قرية شها، مجهزة بمعامل العلوم وقاعات الحاسب الآلي والأنشطة المدرسية.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: false,
    status: 'active',
    rating: 4.6,
    ratingsCount: 15,
    viewsCount: 310,
    callsCount: 35
  },
  {
    id: 'pub-school-sec',
    categoryId: 'schools',
    subcategoryId: 'المدارس الثانوية',
    name: 'مدرسة شها الثانوية المشتركة',
    titleOrSpecialty: 'التعليم الثانوي العام - مرحلة ما قبل الجامعة',
    phone: '0502750200',
    address: 'شارع المدارس - بجوار مجمع المصالح - قرية شها',
    workingHours: 'من الأحد إلى الخميس خلال العام الدراسي',
    description: 'تخدم طلاب المرحلة الثانوية بشها والقرى المجاورة، مجهزة بشبكات التعلم التكنولوجي الحديثة.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: false,
    status: 'active',
    rating: 4.7,
    ratingsCount: 19,
    viewsCount: 430,
    callsCount: 42
  },
  {
    id: 'pub-mosque-grand',
    categoryId: 'mosques',
    subcategoryId: 'المساجد الكبرى والمنابر',
    name: 'الجامع الكبير بشها (المسجد العتيق)',
    titleOrSpecialty: 'أقدم وأكبر مساجد شها - تقام به الجمع والمناسبات الدينية',
    phone: '0502750000',
    address: 'وسط البلد - الميدان الرئيسي - قرية شها',
    workingHours: 'مفتوح للصلوات الخمس وخطبة الجمعة وحلقات تحفيظ القرآن الكريم',
    description: 'منارة قرية شها الدينية والتاريخية، يضم مصلى واسعاً للرجال ومصلى مخصصاً للسيدات ومكتب لتحفيظ القرآن للأطفال.',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 5.0,
    ratingsCount: 45,
    viewsCount: 890,
    callsCount: 12
  },
  {
    id: 'pub-charity-shaha',
    categoryId: 'charity',
    subcategoryId: 'جمعيات خيرية مشهرة',
    name: 'جمعية تنمية المجتمع والعمل الخيري بشها',
    titleOrSpecialty: 'رعاية الأسر المستحقة والأيتام والمساعدات الطبية',
    phone: '0502750300',
    whatsapp: '01000000000',
    address: 'شارع الميدان - بجوار الوحدة المحلية - قرية شها',
    workingHours: 'يومياً من 9 صباحاً حتى 3 عصراً، ومن 6 مساءً حتى 9 مساءً',
    description: 'مؤسسة خيرية أهلية قائمة على مساعدة المحتاجين وتجهيز العرائس وكفالة الأيتام وتوفير أجهزة التنفس والأسرة الطبية مجاناً للمرضى.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    isFeatured: true,
    status: 'active',
    rating: 4.9,
    ratingsCount: 38,
    viewsCount: 740,
    callsCount: 110
  }
];

export const INITIAL_CHARITY_INITIATIVES: CharityInitiative[] = [
  {
    id: 'ch-1',
    title: 'صندوق إعانة المرضى والأجهزة الطبية بشها',
    type: 'medical_aid',
    description: 'توفير أنابيب الأكسجين ومولدات التنفس والكراسي المتحركة والأسرة الطبية لأهالي شها المرضى بالمنازل دون أي مقابل مالي.',
    contactPerson: 'لجنة الإغاثة الطبية بشها',
    phone: '0502750300',
    address: 'مقر جمعية تنمية المجتمع - وسط البلد بشها',
    privacyNotice: 'يتم تسليم الأجهزة فورياً مع الحفاظ على كرامة وخصوصية المريض وأسرته.',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch-2',
    title: 'مبادرة كفالة الأيتام والأسر المتعففة بشها',
    type: 'community_fund',
    description: 'صرف كفالات شهرية منتظمة وتوفير الحقيبة والكساء المدرسي والمواد التموينية لأسر الأيتام بالقرية.',
    contactPerson: 'لجنة الزكاة وكفالة اليتيم',
    phone: '0502750300',
    address: 'الجامع الكبير - قرية شها',
    privacyNotice: 'تخضع جميع الحالات لدراسة دقيقة دون نشر أسماء أو صور مراعاة للخصوصية.',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad_pinned_pharmacy_shaha',
    title: 'عرض الافتتاح الحصري: خصم 20% على الأدوية والمستلزمات – صيدلية الأمل',
    subtitle: 'خدمة 24 ساعة طوال الأسبوع وتوصيل مجاني لجميع منازل وعائلات قرية شها',
    description: 'تعلن صيدلية الأمل المركزية عن خصم فوري 20% لكافة الأهالي مع توفير قياس مجاني لضغط الدم والسكر وفحص الوزن بأحدث الأجهزة الرقمية.',
    placement: 'hero_slider',
    badgeType: 'pinned',
    badgeText: '📌 إعلان مثبت في صدارة الدليل',
    isPinned: true,
    priority: 10,
    displayRotation: 'pinned',
    discountPercent: '20%',
    ctaText: 'اطلب علاجك الآن عبر واتساب',
    imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80',
    linkUrl: 'https://wa.me/201098765432',
    phone: '01098765432',
    whatsapp: '01098765432',
    isActive: true,
    viewsCount: 1420,
    clicksCount: 285,
    backgroundColor: 'gradient_emerald',
    targetCategory: 'pharmacies',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad_top_blood_campaign',
    title: 'حملة التبرع بالدم الكبرى بشها لإنقاذ مصابي العمليات والطوارئ',
    subtitle: 'الجمعة القادمة بمركز شباب شها – شارك لإنقاذ حياة مريض في قريتنا',
    description: 'تنظم لجنة أهالي شها بالتنسيق مع بنك الدم الإقليمي حملة تبرع عاجلة لتوفير مخزون احتياطي لكافة الفصائل وخاصة الفصائل السالبة والنادرة.',
    placement: 'top_banner',
    badgeType: 'urgent',
    badgeText: '⚡ نداء إنساني عاجل',
    isPinned: true,
    priority: 9,
    displayRotation: 'pinned',
    ctaText: 'سجل متبرعاً الآن',
    linkUrl: '#page=blood',
    phone: '0502750300',
    whatsapp: '01012345678',
    isActive: true,
    viewsCount: 940,
    clicksCount: 168,
    backgroundColor: 'gradient_rose',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad_feed_supermarket_offers',
    title: 'عروض الجمعة والسبت من سوبر ماركت البركة والخير بشها',
    subtitle: 'أسعار الجملة للسلع التموينية والجبن البلدي والمنظفات وتوصيل مجاني للبيوت',
    description: 'تخفيضات تصل إلى 25% على الزيت والسكر والأرز وكرتونة البيض واللحوم المبردة لجميع أهالي القرية يومي الجمعة والسبت.',
    placement: 'feed_interstitial',
    badgeType: 'discount',
    badgeText: '🔥 عروض وتخفيضات نهاية الأسبوع',
    isPinned: false,
    priority: 8,
    displayRotation: 'priority',
    discountPercent: '25%',
    ctaText: 'اطلب طلبات البيت دليفري',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    phone: '01122334455',
    whatsapp: '01122334455',
    isActive: true,
    viewsCount: 620,
    clicksCount: 114,
    backgroundColor: 'gradient_amber',
    targetCategory: 'stores',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad_feed_education_center',
    title: 'مراجعات ليلة الامتحان للشهادة الإعدادية والثانوية – مركز النور بشها',
    subtitle: 'مع نخبة من كبار معلمي المنصورة والدقهلية – حجز مجموعات التفوق',
    description: 'مذكرات مجانية شاملة بنك الأسئلة الجديد ونماذج الوزارة. قاعات مكيفة ومتابعة دورية مع أولياء الأمور عبر تقارير واتساب الأسبوعية.',
    placement: 'feed_interstitial',
    badgeType: 'offer',
    badgeText: '⭐ مجموعات تفوق دراسي',
    isPinned: false,
    priority: 6,
    displayRotation: 'random',
    ctaText: 'احجز مقعدك للمراجعات',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    phone: '01123456789',
    whatsapp: '01123456789',
    isActive: true,
    viewsCount: 450,
    clicksCount: 88,
    backgroundColor: 'gradient_blue',
    targetCategory: 'teachers',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad_popup_specialty_clinic',
    title: 'أسبوع الكشف المجاني لأهالي شها – مجمع عيادات شها التخصصي',
    subtitle: 'كشف واستشارات باطنة وأطفال وسونار بأسعار رمزية ومجاناً للأيتام',
    description: 'بمناسبة افتتاح وحدة الأشعة التشخيصية الجديدة، كشف مجاني لأسر الأيتام وغير القادرين وخصم 40% لكافة الأهالي خلال هذا الأسبوع.',
    placement: 'popup_modal',
    badgeType: 'announcement',
    badgeText: '🩺 مبادرة طبية مجتمعية',
    isPinned: true,
    priority: 9,
    displayRotation: 'pinned',
    ctaText: 'احجز موعد الكشف الآن',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    phone: '01055554433',
    whatsapp: '01055554433',
    isActive: true,
    viewsCount: 1120,
    clicksCount: 230,
    backgroundColor: 'gradient_purple',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_VERIFICATION_BADGES: VerificationBadge[] = [
  {
    id: 'vb_official',
    nameAr: 'موثق رسمياً من إدارة شها ون',
    descriptionAr: 'تم التحقق من هوية الشخص أو النشاط ومطابقة البيانات ميدانياً من قبل إدارة شها ون.',
    color: 'blue',
    icon: 'ShieldCheck',
    priority: 10,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vb_doctor',
    nameAr: 'طبيب معتمد وعضو نقابة الأطباء',
    descriptionAr: 'طبيب بشري أو أخصائي مرخص بمزاولة المهنة والشهادات الأكاديمية موثقة.',
    color: 'emerald',
    icon: 'Stethoscope',
    targetEntityTypes: ['person'],
    priority: 9,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vb_pharmacy',
    nameAr: 'صيدلية مرخصة معتمدة',
    descriptionAr: 'صيدلية مرخصة من وزارة الصحة، توفر أدوية أصلية وخدمات طوارئ ورعاية صيدلانية.',
    color: 'emerald',
    icon: 'Pill',
    targetEntityTypes: ['shop'],
    priority: 8,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vb_shop',
    nameAr: 'متجر تجاري موثوق بشها',
    descriptionAr: 'نشاط تجاري قائم ومعروف بحسن السمعة والالتزام بجودة السلع والأسعار.',
    color: 'amber',
    icon: 'Store',
    targetEntityTypes: ['shop', 'service'],
    priority: 7,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vb_charity',
    nameAr: 'مبادرة خيرية ومجتمعية معتمدة',
    descriptionAr: 'مبادرة مسجلة أو جمعية أهلية مشهرة تعمل تحت مظلة العمل التكافلي بقريتنا.',
    color: 'purple',
    icon: 'HeartHandshake',
    targetEntityTypes: ['place', 'service'],
    priority: 9,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vb_craftsman',
    nameAr: 'حرفي وفني موثوق السمعة',
    descriptionAr: 'فني أو صاحب مهنة حرفية مشهود له بالأمانة والمهارة ودقة المواعيد بشها.',
    color: 'indigo',
    icon: 'Award',
    targetEntityTypes: ['person'],
    priority: 6,
    isActive: true,
    isOfficial: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_HUMANITARIAN_REQUESTS: HumanitarianRequest[] = [
  {
    id: 'aid_001',
    title: 'توفير جهاز توليد أكسجين منزلي لمسن يعاني من تليف رئوي حاد بشها',
    category: 'medical_equipment',
    beneficiaryName: 'حالة طبية حرجة (مسن 72 سنة)',
    contactPhone: '01000000001',
    areaOrVillage: 'شها - شارع داير الناحية',
    description: 'مريض مسن من أهالي شها يعاني من تليف رئوي وقصور بالتنفس بحاجة إلى جهاز أكسجين 10 لتر بصورة عاجلة. الحالة خضعت للتقييم الميداني من لجنة تواصل الخيرية ومثبتة بالتقارير الصادرة من مستشفى الصدر بالمنصورة.',
    amountNeeded: 4500,
    amountRaised: 3600,
    urgency: 'critical',
    status: 'approved',
    isPubliclyVisible: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aid_002',
    title: 'مساهمة في علاج شهري لطفل مصاب بأنيميا البحر المتوسط (الثلاسيميا)',
    category: 'medical_aid',
    beneficiaryName: 'طفل (7 سنوات - شها)',
    contactPhone: '01000000002',
    areaOrVillage: 'شها - منطقة المحطة',
    description: 'يحتاج الطفل إلى جلسات نقل دم دورية ومستلزمات فلاتر دقيقة وأدوية خافضة للحديد لمنع تضخم الطحال. تم فحص الحالة والتأكد من احتياج الأسرة لدعم تكاليف العلاج.',
    amountNeeded: 1800,
    amountRaised: 1250,
    urgency: 'high',
    status: 'approved',
    isPubliclyVisible: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aid_003',
    title: 'تجهيز سلات غذائية شهرية لأسر الأيتام المتعففة بشها',
    category: 'food_aid',
    beneficiaryName: '15 أسرة أيتام متعففة',
    contactPhone: '01000000003',
    areaOrVillage: 'شها - كافة الأحياء',
    description: 'مبادرة الإطعام الشهري لتوفير كراتين مواد غذائية أساسية (زيت، سكر، أرز، بقوليات، لحوم) للأسر المستحقة والأرامل بقرية شها.',
    amountNeeded: 7500,
    amountRaised: 5200,
    urgency: 'normal',
    status: 'approved',
    isPubliclyVisible: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_DONORS: DonorEntry[] = [
  {
    id: 'donor_001',
    donorName: 'فاعل خير من أهالي شها',
    donorType: 'individual',
    donationCategory: 'equipment',
    donationDetails: 'توفير سرير طبي هيدروليكي وكرسي متحرك لكبار السن والمرضى بحالة ممتازة للاستعارة المجانية.',
    area: 'شها - بحري',
    isPublic: true,
    isAnonymous: true,
    status: 'available',
    safeContactMethod: 'via_admin',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'donor_002',
    donorName: 'أ / إبراهيم عبد الرحمن',
    donorType: 'individual',
    donationCategory: 'medicine',
    donationDetails: 'التبرع بجرعات أدوية ضغط وسكر وأنسولين دورية لغير القادرين، متوفرة شهرياً.',
    area: 'شها - وسط البلد',
    isPublic: true,
    isAnonymous: false,
    status: 'available',
    safeContactMethod: 'via_admin',
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'donor_003',
    donorName: 'مبادرة كسوة وتكافل (شباب شها)',
    donorType: 'group',
    donationCategory: 'clothes',
    donationDetails: 'تجهيز وتوزيع ملابس شتوية وملابس أطفال وبطاطين للأسر الأولى بالرعاية.',
    area: 'شها - كافة النواحي',
    isPublic: true,
    isAnonymous: false,
    status: 'available',
    safeContactMethod: 'direct_whatsapp',
    whatsapp: '01000000004',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_COMMUNITY_PAGES: CommunityFacebookPage[] = [
  {
    id: 'page_001',
    name: 'الشهاوية',
    url: 'https://www.facebook.com/elshhawya',
    description: 'الصفحة المجتمعية المعنية بأخبار وفعاليات وتكافل ومناسبات أهالي قرية شها الكرام.',
    followers: '45,000+ متابع',
    category: 'مجتمعي وإخباري',
    isVerified: false,
    isActive: true,
    order: 1,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'page_002',
    name: 'الشهاوية وافيات',
    url: 'https://www.facebook.com/profile.php?id=100066717302338',
    description: 'متابعة يومية لمستجدات القرية وخدمات المواطنين والمناسبات العامة ونشر الوفيات والمواساة لأهالي شها.',
    followers: '28,000+ متابع',
    category: 'وفيات ومناسبات',
    isVerified: false,
    isActive: true,
    order: 2,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'page_003',
    name: 'الشهاوية نت',
    url: 'https://www.facebook.com/elshawya',
    description: 'ملتقى تواصل أهالي قرية شها لطرح الاستفسارات والخدمات والتعاون الخيري والاجتماعي.',
    followers: '32,000+ متابع',
    category: 'تواصل مجتمعي',
    isVerified: false,
    isActive: true,
    order: 3,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

export const INITIAL_ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: 'msg_001',
    senderName: 'محمد أحمد السعيد',
    senderPhone: '01012345678',
    senderEmail: 'mohamed@example.com',
    topic: 'inquiry',
    subject: 'استفسار عن إضافة عيادة جديدة للأطفال',
    message: 'السلام عليكم ورحمة الله، أود معرفة الأوراق المطلوبة لتوثيق عيادة دكتور أطفال جديدة بشارع البحر الصغير بالدليل.',
    status: 'new',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    isRead: false
  },
  {
    id: 'msg_002',
    senderName: 'أحد أهالي القرية',
    senderPhone: '01123456789',
    topic: 'edit_delete_data',
    subject: 'طلب تعديل رقم صيدلية مغلقة',
    message: 'نرجو تعديل رقم الصيدلية في منطقة المحطة نظراً لتغيير رقم الواتساب الرسمي واستقبال الطوارئ.',
    status: 'under_review',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true
  }
];

export const INITIAL_VILLAGE_NEWS: VillageNews[] = [
  {
    id: 'news_001',
    title: 'افتتاح أعمال صيانة وإعادة رصف طريق شها الرئيسي بالتنسيق مع مجلس المدينة',
    summary: 'بدء الأعمال الميدانية لتحسين طريق شها الرئيسي لتسهيل حركة المرور والمواطنين.',
    content: 'تعلن وحدة خدمات قرية شها البدء في رصف وصيانة القطاعات المتهالكة من طريق شها الرئيسي، مع تجهيز مسارات بديلة مؤقتة لحين الانتهاء من العمل.',
    category: 'services',
    categoryLabel: 'خدمات وتطوير',
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    publisherName: 'إدارة منصة شها ون',
    isPinned: true,
    isUrgent: false,
    viewsCount: 142
  },
  {
    id: 'news_002',
    title: 'حملة تبرع بالدم مكبرة بالتعاون مع بنك الدم الإقليمي يوم الجمعة المقبل',
    summary: 'نداء لمواطني شها للمشاركة في حملة التبرع بالدم لدعم الحالات الحرجة بمستشفيات المنصورة.',
    content: 'ندعو جميع أهالي وشباب شها الكرام للمشاركة في حملة التبرع بالدم المقرر إقامتها أمام المجمع المجتمعي بشها يوم الجمعة بعد الصلاة.',
    category: 'emergency',
    categoryLabel: 'طوارئ وإغاثة',
    publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    publisherName: 'لجنة التكافل الاجتماعي',
    isPinned: true,
    isUrgent: true,
    viewsCount: 289
  },
  {
    id: 'news_003',
    title: 'تطوير وتحديث دليل أرقام شها إلى منصة SHAHA ONE الرقمية المتكاملة',
    summary: 'إطلاق الهوية والمنظومة الجديدة لشها ون لتوفير كافة الخدمات وأرقام الطوارئ في مكان واحد.',
    content: 'في إطار التحديث الشامل لمنظومة خدمات أهالي شها، تم إطلاق منصة SHAHA ONE الرقمية بخدمات تفاعلية تشمل دليل الأرقام، نظام المساعدات الإنسانية، والتبرع بالدم، والإعلانات التفاعلية.',
    category: 'general',
    categoryLabel: 'أخبار عامة',
    publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    publisherName: 'فريق التطوير الفني',
    isPinned: false,
    isUrgent: false,
    viewsCount: 512
  }
];

export const INITIAL_PLATFORM_CREDITS: PlatformCredit[] = [
  {
    id: 'cred_001',
    name: 'Mohamed Ayman',
    role: 'التطوير والتنفيذ',
    description: 'الهندسة البرمجية والتنفيذ الفني لمنظومة شها ون',
    linkUrl: 'https://medoandroid.github.io/DevMeDoAnDrOiD/',
    badge: '👨‍💻',
    order: 1,
    isActive: true
  },
  {
    id: 'cred_002',
    name: 'M : Reda Elkhshen 🇫🇷',
    role: 'صاحب الفكرة والمشاركة والدعم',
    description: 'رؤية المنصة والرعاية والمشاركة الاجتماعية لأهالي شها',
    linkUrl: 'https://www.facebook.com/reda.elkhshen',
    badge: '🇫🇷',
    order: 2,
    isActive: true
  }
];

export const INITIAL_MANSOURA_SCHEDULE: EmergencyHospitalSchedule[] = [
  {
    id: 'mansoura_emerg_schedule_main',
    title: 'جدول استقبال الطوارئ في مستشفيات المنصورة',
    titleAr: 'جدول استقبال الطوارئ في مستشفيات المنصورة',
    descriptionAr: 'الجدول الأسبوعي المعتمد لتوزيع استقبال حالات الطوارئ العاجلة بمستشفيات مدينة المنصورة الخدمية والجامعية.',
    lastUpdatedText: 'تم التحديث والاعتماد الإداري لشهر نوفمبر 2026',
    days: [
      { dayKey: 'saturday', dayName: 'السبت', hospitalName: 'مستشفى المنصورة الدولي', phone: '0502222854', notes: 'قسم الاستقبال والدخلة الرئيسية' },
      { dayKey: 'sunday', dayName: 'الأحد', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'شارع جيهان - العيادات المجمعة' },
      { dayKey: 'monday', dayName: 'الاثنين', hospitalName: 'مستشفى المنصورة التخصصي', phone: '0502222854', notes: 'العام المباشر - قناة السويس' },
      { dayKey: 'tuesday', dayName: 'الثلاثاء', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'استقبال الحالات الحرجة' },
      { dayKey: 'wednesday', dayName: 'الأربعاء', hospitalName: 'مستشفى المنصورة الدولي', phone: '0502222854', notes: 'استقبال الجراحة والباطنة' },
      { dayKey: 'thursday', dayName: 'الخميس', hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', notes: 'استقبال طوارئ الجامعة' },
      { dayKey: 'friday', dayName: 'الجمعة', hospitalName: 'مستشفى المنصورة التخصصي', phone: '0502222854', notes: 'طوارئ عاجلة طوال 24 ساعة' }
    ],
    importantPhones: [
      { label: 'مستشفى المنصورة الدولي', phone: '0502222854' },
      { label: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472' },
      { label: 'الإسعاف الوطني', phone: '123' }
    ],
    hospitalContacts: [
      { hospitalName: 'مستشفى المنصورة الدولي', phone: '0502222854', address: 'شارع جيهان - المنصورة' },
      { hospitalName: 'مستشفى طوارئ جامعة المنصورة', phone: '0502265472', address: 'مجمع المستشفيات الجامعية - المنصورة' },
      { hospitalName: 'مستشفى المنصورة التخصصي', phone: '0502222854', address: 'شارع بنك مصر - المنصورة' },
      { hospitalName: 'هيئة الإسعاف المصرية (شها والمنصورة)', phone: '123', address: 'خط طوارئ 24 ساعة' }
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'إدارة شها ون'
  }
];



