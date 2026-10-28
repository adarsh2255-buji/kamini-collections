// ==============================================================================
// KAMINI COLLECTIONS - CURATED CATALOG DATA
// Used as fallback when database is initializing, and for local offline workflows
// ==============================================================================

import { Category, Product } from '@/types';

const SEED_DATE = '2026-10-23T00:00:00.000Z';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Banarasi Silk',
    slug: 'banarasi-silk',
    description:
      'Pure handwoven Banarasi sarees featuring intricate zari work, royal brocades, and timeless royal motifs from Varanasi.',
    image_url: '/saree.jpg',
    is_active: true,
    display_order: 1,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    product_count: 2,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Kanchipuram Silk',
    slug: 'kanchipuram-silk',
    description:
      'Authentic temple border South Indian silk sarees crafted with heavy gold zari for auspicious weddings and festivities.',
    image_url: '/kanchipuram.jpg',
    is_active: true,
    display_order: 2,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    product_count: 2,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Chanderi & Organza',
    slug: 'chanderi-organza',
    description:
      'Breezy, lightweight, and sheer elegance with delicate floral motifs and fine scalloped tissue borders.',
    image_url: '/organza.jpg',
    is_active: true,
    display_order: 3,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    product_count: 1,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Pure Cotton & Linen',
    slug: 'cotton-linen',
    description:
      'Breathable, hand-spun artisanal cotton and Jamdani sarees for graceful everyday wear and office elegance.',
    image_url: '/jamdani.jpg',
    is_active: true,
    display_order: 4,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    product_count: 1,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Royal Crimson Kadwa Banarasi Silk Saree',
    slug: 'royal-crimson-kadwa-banarasi-silk-saree',
    sku: 'KC-BAN-001',
    description:
      'A majestic bridal masterpiece in deep crimson red, handwoven on traditional pit-looms in pure katan silk. Embellished with all-over intricate gold zari floral butis and an opulent temple border that cascades into a magnificent gold brocade pallu.',
    fabric: 'Pure Katan Silk',
    color: 'Crimson Red & Antique Gold',
    occasion: 'Bridal, Wedding, Grand Festive',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched matching crimson blouse piece (0.8 Meter) with zari border',
    care_instructions: 'Dry clean only. Store wrapped in soft muslin cloth away from direct sunlight.',
    price_paise: 1250000, // Rs. 12,500.00
    compare_at_price_paise: 1550000, // Rs. 15,500.00
    stock_quantity: 8,
    is_active: true,
    is_featured: true,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[0],
    images: [
      {
        id: 'img-1',
        product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        image_url: '/saree.jpg',
        alt_text: 'Royal Crimson Kadwa Banarasi Silk Saree Front Drape',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Emerald Gold Kanchipuram Bridal Pattu Saree',
    slug: 'emerald-gold-kanchipuram-bridal-pattu-saree',
    sku: 'KC-KAN-002',
    description:
      'Woven in the temple city of Kanchipuram with pure mulberry silk and heavy gold zari. The royal emerald green body is illuminated by intricate floral medallions and flanked by authentic korvai broad temple borders featuring traditional peacock and yali motifs.',
    fabric: 'Pure Mulberry Silk (Kanchipuram)',
    color: 'Emerald Green & Rich Gold',
    occasion: 'Wedding, Traditional Ceremonies, Muhurtham',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched contrasting emerald brocade blouse piece (0.8 Meter)',
    care_instructions: 'Dry clean only. Roll in cotton saree bag. Do not spray fragrance on zari.',
    price_paise: 1890000, // Rs. 18,900.00
    compare_at_price_paise: 2200000, // Rs. 22,000.00
    stock_quantity: 5,
    is_active: true,
    is_featured: true,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[1],
    images: [
      {
        id: 'img-2',
        product_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        image_url: '/kanchipuram.jpg',
        alt_text: 'Emerald Gold Kanchipuram Bridal Pattu Saree Full View',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    category_id: '33333333-3333-3333-3333-333333333333',
    name: 'Rose Quartz Handcrafted Floral Organza Silk Saree',
    slug: 'rose-quartz-handcrafted-floral-organza-silk-saree',
    sku: 'KC-ORG-003',
    description:
      'Breathtakingly sheer pastel pink organza silk adorned with handcrafted floral resham embroidery and delicate scalloped borders. Ethereal, lightweight, and effortlessly glamorous for day celebrations and soirées.',
    fabric: 'Pure Organza Silk',
    color: 'Rose Quartz Pink',
    occasion: 'Engagement, Reception, Day Wedding, Festive Soiree',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched raw silk blouse piece in rose pink (0.8 Meter) with embroidery',
    care_instructions: 'Dry clean only. Iron on reverse using lowest heat setting.',
    price_paise: 849000, // Rs. 8,490.00
    compare_at_price_paise: 1050000, // Rs. 10,500.00
    stock_quantity: 12,
    is_active: true,
    is_featured: true,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[2],
    images: [
      {
        id: 'img-3',
        product_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        image_url: '/organza.jpg',
        alt_text: 'Rose Quartz Handcrafted Floral Organza Silk Saree',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    category_id: '44444444-4444-4444-4444-444444444444',
    name: 'Artisanal Midnight Blue Jamdani Handloom Cotton Saree',
    slug: 'artisanal-midnight-blue-jamdani-cotton-saree',
    sku: 'KC-JAM-004',
    description:
      'Woven with heritage craftsmanship in fine hand-spun cotton. Features geometric supplementary weft Jamdani motifs in lustrous silver zari against a deep midnight navy base. Incredibly breathable and featherlight.',
    fabric: 'Fine Handloom Bengal Cotton',
    color: 'Midnight Blue & Silver Zari',
    occasion: 'Festive, Formal Gatherings, Artisanal Casual',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched running handloom cotton blouse piece (0.8 Meter)',
    care_instructions: 'Dry clean recommended for first wash; subsequently gentle hand wash with mild detergent.',
    price_paise: 425000, // Rs. 4,250.00
    compare_at_price_paise: 520000, // Rs. 5,200.00
    stock_quantity: 15,
    is_active: true,
    is_featured: false,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[3],
    images: [
      {
        id: 'img-4',
        product_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        image_url: '/jamdani.jpg',
        alt_text: 'Artisanal Midnight Blue Jamdani Handloom Cotton Saree',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Vintage Marigold Banarasi Meenakari Silk Saree',
    slug: 'vintage-marigold-banarasi-meenakari-silk-saree',
    sku: 'KC-BAN-005',
    description:
      'Luminous festive marigold yellow katan silk enriched with intricate multi-color Meenakari resham work and antique gold zari weave across the body and heavy pallu.',
    fabric: 'Pure Katan Silk',
    color: 'Marigold Yellow & Multi Meenakari',
    occasion: 'Haldi, Sangeet, Puja, Diwali',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched contrasting ruby red blouse piece (0.8 Meter) with zari border',
    care_instructions: 'Dry clean only.',
    price_paise: 1420000, // Rs. 14,200.00
    compare_at_price_paise: 1700000, // Rs. 17,000.00
    stock_quantity: 6,
    is_active: true,
    is_featured: true,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[0],
    images: [
      {
        id: 'img-5',
        product_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        image_url: '/saree.jpg',
        alt_text: 'Vintage Marigold Banarasi Meenakari Silk Saree',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Peacock Teal Dual-Tone Kanchipuram Silk Saree',
    slug: 'peacock-teal-dual-tone-kanchipuram-silk-saree',
    sku: 'KC-KAN-006',
    description:
      'A rare dual-tone shot silk saree in deep peacock teal shifting to royal purple under light. Finished with signature korvai woven temple borders and an opulent golden brocade pallu.',
    fabric: 'Pure Mulberry Silk',
    color: 'Peacock Teal & Royal Purple',
    occasion: 'Wedding Reception, Festive Soiree, Sangeet',
    saree_length: '5.5 Meters',
    blouse_details: 'Includes unstitched rich brocade blouse piece (0.8 Meter)',
    care_instructions: 'Dry clean only.',
    price_paise: 1680000, // Rs. 16,800.00
    compare_at_price_paise: 1950000, // Rs. 19,500.00
    stock_quantity: 4,
    is_active: true,
    is_featured: false,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
    category: INITIAL_CATEGORIES[1],
    images: [
      {
        id: 'img-6',
        product_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        image_url: '/kanchipuram.jpg',
        alt_text: 'Peacock Teal Dual-Tone Kanchipuram Silk Saree',
        sort_order: 1,
        is_primary: true,
        created_at: SEED_DATE,
      },
    ],
  },
];
