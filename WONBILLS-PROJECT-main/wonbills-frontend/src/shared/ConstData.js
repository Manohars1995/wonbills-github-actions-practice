// COMPANY TYPES LIST ARRAY RAZORPAY
// export const companyTypes = [
//     { label: 'LLP', value: 'llp' },
//     { label: 'NGO', value: 'ngo' },
//     { label: 'Other', value: 'other' },
//     { label: 'Individual', value: 'individual' },
//     { label: 'Partnership', value: 'partnership' },
//     { label: 'Proprietorship', value: 'proprietorship' },
//     { label: 'Public Limited', value: 'public_limited' },
//     { label: 'Private Limited', value: 'private_limited' },
//     { label: 'Trust, Society', value: 'trust_society' },
//     { label: 'Not Yet Registered', value: 'not_yet_registered' },
//     { label: 'Educational Institutes', value: 'educational_institutes' }
// ];

export const companyTypes = [
    { label: 'Public Limited', value: 'public_limited' },
    { label: 'Private Limited', value: 'private_limited' },
];

// BUSINESS CATEGORIES RAZORPAY
export const industryTypes = [
    { label: 'Financial Services', value: 'financial_services' },
    { label: 'Education', value: 'education' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Government', value: 'government' },
    { label: 'Logistics', value: 'logistics' },
    { label: 'Tours and Travel', value: 'tours_and_travel' },
    { label: 'Transport', value: 'transport' },
    { label: 'Ecommerce', value: 'ecommerce' },
    { label: 'Food', value: 'food' },
    { label: 'IT and Software', value: 'it_and_software' },
    { label: 'Gaming', value: 'gaming' },
    { label: 'Media and Entertainment', value: 'media_and_entertainment' },
    { label: 'Services', value: 'services' },
    { label: 'Housing', value: 'housing' },
    { label: 'Not for Profit', value: 'not_for_profit' },
    { label: 'Social', value: 'social' },
    { label: 'Others', value: 'others' }
];

// BUSINESS SUB-CATEGORIES RAZORPAY
export const allSubCategories = {
    financial_services: [
        { label: 'Mutual Fund', value: 'mutual_fund' },
        { label: 'Lending', value: 'lending' },
        { label: 'Cryptocurrency', value: 'cryptocurrency' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'NBFC', value: 'nbfc' },
        { label: 'Cooperatives', value: 'cooperatives' },
        { label: 'Pension Fund', value: 'pension_fund' },
        { label: 'Forex', value: 'forex' },
        { label: 'Securities', value: 'securities' },
        { label: 'Commodities', value: 'commodities' },
        { label: 'Accounting', value: 'accounting' },
        { label: 'Financial Advisor', value: 'financial_advisor' },
        { label: 'Crowdfunding', value: 'crowdfunding' },
        { label: 'Trading', value: 'trading' },
        { label: 'Betting', value: 'betting' },
        { label: 'Get Rich Schemes', value: 'get_rich_schemes' },
        { label: 'MoneySend Funding', value: 'moneysend_funding' },
        { label: 'Wire Transfers & Money Orders', value: 'wire_transfers_and_money_orders' },
        { label: 'Tax Preparation Services', value: 'tax_preparation_services' },
        { label: 'Tax Payments', value: 'tax_payments' },
        { label: 'Digital Goods', value: 'digital_goods' },
        { label: 'ATMs', value: 'atms' },
    ],

    education: [
        { label: 'College', value: 'college' },
        { label: 'Schools', value: 'schools' },
        { label: 'University', value: 'university' },
        { label: 'Professional Courses', value: 'professional_courses' },
        { label: 'Distance Learning', value: 'distance_learning' },
        { label: 'Day Care', value: 'day_care' },
        { label: 'Coaching', value: 'coaching' },
        { label: 'E-learning', value: 'elearning' },
        { label: 'Vocational and Trade Schools', value: 'vocational_and_trade_schools' },
        { label: 'Sporting Clubs', value: 'sporting_clubs' },
        { label: 'Dance Halls, Studios, and Schools', value: 'dance_halls_studios_and_schools' },
        { label: 'Correspondence Schools', value: 'correspondence_schools' },
    ],

    healthcare: [
        { label: 'Pharmacy', value: 'pharmacy' },
        { label: 'Clinic', value: 'clinic' },
        { label: 'Hospital', value: 'hospital' },
        { label: 'Lab', value: 'lab' },
        { label: 'Dietician', value: 'dietician' },
        { label: 'Fitness', value: 'fitness' },
        { label: 'Health Coaching', value: 'health_coaching' },
        { label: 'Health Products', value: 'health_products' },
        { label: 'Drug Stores', value: 'drug_stores' },
        { label: 'Healthcare Marketplace', value: 'healthcare_marketplace' },
        { label: 'Osteopaths', value: 'osteopaths' },
        { label: 'Medical Equipment & Supply Stores', value: 'medical_equipment_and_supply_stores' },
        { label: 'Podiatrists & Chiropodists', value: 'podiatrists_and_chiropodists' },
        { label: 'Dentists & Orthodontists', value: 'dentists_and_orthodontists' },
        { label: 'Hardware Stores', value: 'hardware_stores' },
        { label: 'Ophthalmologists', value: 'ophthalmologists' },
        { label: 'Orthopedic Goods Stores', value: 'orthopedic_goods_stores' },
        { label: 'Testing Laboratories', value: 'testing_laboratories' },
        { label: 'Doctors', value: 'doctors' },
        { label: 'Health Practitioners Medical Services', value: 'health_practitioners_medical_services' },
    ],

    ecommerce: [
        { label: 'Ecommerce Marketplace', value: 'ecommerce_marketplace' },
        { label: 'Agriculture', value: 'agriculture' },
        { label: 'Books', value: 'books' },
        { label: 'Electronics and Furniture', value: 'electronics_and_furniture' },
        { label: 'Coupons', value: 'coupons' },
        { label: 'Rental', value: 'rental' },
        { label: 'Fashion and Lifestyle', value: 'fashion_and_lifestyle' },
        { label: 'Gifting', value: 'gifting' },
        { label: 'Grocery', value: 'grocery' },
        { label: 'Baby Products', value: 'baby_products' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Wholesale', value: 'wholesale' },
        { label: 'Religious Products', value: 'religious_products' },
        { label: 'Pet Products', value: 'pet_products' },
        { label: 'Sports Products', value: 'sports_products' },
        { label: 'Arts and Collectibles', value: 'arts_and_collectibles' },
        { label: 'Sexual Wellness Products', value: 'sexual_wellness_products' },
        { label: 'Drop Shipping', value: 'drop_shipping' },
        { label: 'Crypto Machinery', value: 'crypto_machinery' },
        { label: 'Tobacco', value: 'tobacco' },
        { label: 'Weapons and Ammunitions', value: 'weapons_and_ammunitions' },
        { label: 'Stamps and Coins Stores', value: 'stamps_and_coins_stores' },
        { label: 'Office Equipment', value: 'office_equipment' },
        { label: 'Automobile Parts and Equipment', value: 'automobile_parts_and_equipment' },
        { label: 'Garden Supply Stores', value: 'garden_supply_stores' },
        { label: 'Household Appliance Stores', value: 'household_appliance_stores' },
        { label: 'Non-durable Goods', value: 'non_durable_goods' },
        { label: 'Pawn Shops', value: 'pawn_shops' },
        { label: 'Electrical Parts and Equipment', value: 'electrical_parts_and_equipment' },
        { label: 'Wig and Toupee Shops', value: 'wig_and_toupee_shops' },
        { label: 'Gift, Novelty, and Souvenir Shops', value: 'gift_novelty_and_souvenir_shops' },
        { label: 'Duty Free Stores', value: 'duty_free_stores' },
        { label: 'Office and Commercial Furniture', value: 'office_and_commercial_furniture' },
        { label: 'Dry Goods', value: 'dry_goods' },
        { label: 'Books and Publications', value: 'books_and_publications' },
        { label: 'Camera and Photographic Stores', value: 'camera_and_photographic_stores' },
        { label: 'Record Shops', value: 'record_shops' },
        { label: 'Meat Supply Stores', value: 'meat_supply_stores' },
        { label: 'Leather Goods and Luggage', value: 'leather_goods_and_luggage' },
        { label: 'Snowmobile Dealers', value: 'snowmobile_dealers' },
        { label: 'Men and Boys Clothing Stores', value: 'men_and_boys_clothing_stores' },
        { label: 'Paint Supply Stores', value: 'paint_supply_stores' },
        { label: 'Automotive Parts', value: 'automotive_parts' },
        { label: 'Jewellery and Watch Stores', value: 'jewellery_and_watch_stores' },
        { label: 'Auto Store & Home Supply Stores', value: 'auto_store_home_supply_stores' },
        { label: 'Tent Stores', value: 'tent_stores' },
        { label: 'Shoe Stores Retail', value: 'shoe_stores_retail' },
        { label: 'Petroleum and Petroleum Products', value: 'petroleum_and_petroleum_products' },
        { label: 'Department Stores', value: 'department_stores' },
        { label: 'Automotive Tire Stores', value: 'automotive_tire_stores' },
        { label: 'Sport Apparel Stores', value: 'sport_apparel_stores' },
        { label: 'Variety Stores', value: 'variety_stores' },
        { label: 'Chemicals and Allied Products', value: 'chemicals_and_allied_products' },
        { label: 'Commercial Equipment', value: 'commercial_equipments' },
        { label: 'Fireplace Parts and Accessories', value: 'fireplace_parts_and_accessories' },
        { label: 'Family Clothing Stores', value: 'family_clothing_stores' },
        { label: 'Fabric and Sewing Stores', value: 'fabric_and_sewing_stores' },
        { label: 'Home Heating Oil', value: 'home_heating_oil' },
        { label: 'Fertility Stores', value: 'fertility_stores' },
        { label: 'Medical Supply Stores', value: 'medical_supply_stores' },
        { label: 'Motorcycles', value: 'motorcycles' },
        { label: 'Travel Accessories', value: 'travel_accessories' },
        { label: 'General Merchandise', value: 'general_merchandise' },
        { label: 'Discount Stores', value: 'discount_stores' },
        { label: 'Pet Foods & Supplies', value: 'pet_foods_and_supplies' },
    ],

    services: [
        { label: 'Repair and Cleaning', value: 'repair_and_cleaning' },
        { label: 'Interior Design and Architecture', value: 'interior_design_and_architect' },
        { label: 'Movers and Packers', value: 'movers_and_packers' },
        { label: 'Legal Services', value: 'legal' },
        { label: 'Event Planning', value: 'event_planning' },
        { label: 'Service Centres', value: 'service_centre' },
        { label: 'Consulting', value: 'consulting' },
        { label: 'Advertising and Marketing', value: 'ad_and_marketing' },
        { label: 'Services Classifieds', value: 'services_classifieds' },
        { label: 'Multi-Level Marketing', value: 'multi_level_marketing' },
        { label: 'Construction Services', value: 'construction_services' },
        { label: 'Architectural Services', value: 'architectural_services' },
        { label: 'Car Washes', value: 'car_washes' },
        { label: 'Motor Home Rentals', value: 'motor_home_rentals' },
        { label: 'Stenographic and Secretarial Support Services', value: 'stenographic_and_secretarial_support_services' },
        { label: 'Chiropractors', value: 'chiropractors' },
        { label: 'Automotive Service Shops', value: 'automotive_service_shops' },
        { label: 'Shoe Repair Shops', value: 'shoe_repair_shops' },
        { label: 'Telecommunication Services', value: 'telecommunication_service' },
        { label: 'Fines', value: 'fines' },
        { label: 'Security Agencies', value: 'security_agencies' },
        { label: 'Tailors', value: 'tailors' },
        { label: 'Type Setting and Engraving Services', value: 'type_setting_and_engraving_services' },
        { label: 'Small Appliance Repair Shops', value: 'small_appliance_repair_shops' },
        { label: 'Photography Labs', value: 'photography_labs' },
        { label: 'Dry Cleaners', value: 'dry_cleaners' },
        { label: 'Massage Parlors', value: 'massage_parlors' },
        { label: 'Electronic Repair Shops', value: 'electronic_repair_shops' },
        { label: 'Cleaning and Sanitation Services', value: 'cleaning_and_sanitation_services' },
        { label: 'Nursing Care Facilities', value: 'nursing_care_facilities' },
        { label: 'Direct Marketing', value: 'direct_marketing' },
        { label: 'Lottery', value: 'lottery' },
        { label: 'Veterinary Services', value: 'veterinary_services' },
        { label: 'Affiliated Auto Rental', value: 'affliated_auto_rental' },
        { label: 'Alimony and Child Support', value: 'alimony_and_child_support' },
        { label: 'Airport Flying Fields', value: 'airport_flying_fields' },
        { label: 'Golf Courses', value: 'golf_courses' },
        { label: 'Tire Retreading and Repair Shops', value: 'tire_retreading_and_repair_shops' },
        { label: 'Television Cable Services', value: 'television_cable_services' },
        { label: 'Recreational and Sporting Camps', value: 'recreational_and_sporting_camps' },
        { label: 'Barber and Beauty Shops', value: 'barber_and_beauty_shops' },
        { label: 'Agricultural Cooperatives', value: 'agricultural_cooperatives' },
        { label: 'Carpentry Contractors', value: 'carpentry_contractors' },
        { label: 'Wrecking and Salvaging Services', value: 'wrecking_and_salvaging_services' },
        { label: 'Automobile Towing Services', value: 'automobile_towing_services' },
        { label: 'Video Tape Rental Stores', value: 'video_tape_rental_stores' },
        { label: 'Miscellaneous Repair Shops', value: 'miscellaneous_repair_shops' },
        { label: 'Motor Homes and Parts', value: 'motor_homes_and_parts' },
        { label: 'Horse or Dog Racing', value: 'horse_or_dog_racing' },
        { label: 'Laundry Services', value: 'laundry_services' },
        { label: 'Electrical Contractors', value: 'electrical_contractors' },
        { label: 'Debt, Marriage and Personal Counseling Services', value: 'debt_marriage_personal_counseling_service' },
        { label: 'Air Conditioning and Refrigeration Repair Shops', value: 'air_conditioning_and_refrigeration_repair_shops' },
        { label: 'Credit Reporting Agencies', value: 'credit_reporting_agencies' },
        { label: 'Heating and Plumbing Contractors', value: 'heating_and_plumbing_contractors' },
        { label: 'Carpet and Upholstery Cleaning Services', value: 'carpet_and_upholstery_cleaning_services' },
        { label: 'Swimming Pools', value: 'swimming_pools' },
        { label: 'Roofing and Metal Work Contractors', value: 'roofing_and_metal_work_contractors' },
        { label: 'Internet Service Providers', value: 'internet_service_providers' },
        { label: 'Recreational Camps', value: 'recreational_camps' },
        { label: 'Masonry Contractors', value: 'masonry_contractors' },
        { label: 'Exterminating and Disinfecting Services', value: 'exterminating_and_disinfecting_services' },
        { label: 'Ambulance Services', value: 'ambulance_services' },
        { label: 'Funeral Services and Crematories', value: 'funeral_services_and_crematories' },
        { label: 'Metal Service Centres', value: 'metal_service_centres' },
        { label: 'Copying and Blueprinting Services', value: 'copying_and_blueprinting_services' },
        { label: 'Fuel Dispensers', value: 'fuel_dispensers' },
        { label: 'Welding Repair', value: 'welding_repair' },
        { label: 'Mobile Home Dealers', value: 'mobile_home_dealers' },
        { label: 'Concrete Work Contractors', value: 'concrete_work_contractors' },
        { label: 'Boat Rentals', value: 'boat_rentals' },
        { label: 'Personal Shoppers and Shopping Clubs', value: 'personal_shoppers_and_shopping_clubs' },
        { label: 'Door to Door Sales', value: 'door_to_door_sales' },
        { label: 'Travel Related Direct Marketing', value: 'travel_related_direct_marketing' },
        { label: 'Lottery and Betting', value: 'lottery_and_betting' },
        { label: 'Bands, Orchestras and Miscellaneous Entertainers', value: 'bands_orchestras_and_miscellaneous_entertainers' },
        { label: 'Furniture Repair and Refinishing', value: 'furniture_repair_and_refinishing' },
        { label: 'Contractors', value: 'contractors' },
        { label: 'Direct Marketing and Subscription Merchants', value: 'direct_marketing_and_subscription_merchants' },
        { label: 'Typewriter Stores, Sales, Service and Rentals', value: 'typewriter_stores_sales_service_and_rentals' },
        { label: 'Recreation Services', value: 'recreation_services' },
        { label: 'Direct Marketing Insurance Services', value: 'direct_marketing_insurance_services' },
        { label: 'Business Services', value: 'business_services' },
        { label: 'Inbound Telemarketing Merchants', value: 'inbound_telemarketing_merchants' },
        { label: 'Public Warehousing', value: 'public_warehousing' },
        { label: 'Outbound Telemarketing Merchants', value: 'outbound_telemarketing_merchants' },
        { label: 'Clothing Rental Stores', value: 'clothing_rental_stores' },
        { label: 'Transportation Services', value: 'transportation_services' },
        { label: 'Electric Razor Stores', value: 'electric_razor_stores' },
        { label: 'Service Stations', value: 'service_stations' },
        { label: 'Photographic Studio', value: 'photographic_studio' },
        { label: 'Professional Services', value: 'professional_services' }
    ],

    housing: [
        { label: 'Developer', value: 'developer' },
        { label: 'Facility Management', value: 'facility_management' },
        { label: 'RWA (Resident Welfare Association)', value: 'rwa' },
        { label: 'Coworking Spaces', value: 'coworking' },
        { label: 'Real Estate Classifieds', value: 'realestate_classifieds' },
        { label: 'Space Rental', value: 'space_rental' }
    ],

    not_for_profit: [
        { label: 'Charity', value: 'charity' },
        { label: 'Educational', value: 'educational' },
        { label: 'Religious', value: 'religious' },
        { label: 'Personal', value: 'personal' }
    ],

    social: [
        { label: 'Matchmaking', value: 'matchmaking' },
        { label: 'Social Network', value: 'social_network' },
        { label: 'Messaging', value: 'messaging' },
        { label: 'Professional Network', value: 'professional_network' },
        { label: 'Neighbourhood Network', value: 'neighbourhood_network' },
        { label: 'Political Organizations', value: 'political_organizations' },
        { label: 'Automobile Associations and Clubs', value: 'automobile_associations_and_clubs' },
        { label: 'Country and Athletic Clubs', value: 'country_and_athletic_clubs' },
        { label: 'Associations and Membership', value: 'associations_and_membership' }
    ],

    media_and_entertainment: [
        { label: 'Video on Demand', value: 'video_on_demand' },
        { label: 'Music Streaming', value: 'music_streaming' },
        { label: 'Multiplex', value: 'multiplex' },
        { label: 'Content and Publishing', value: 'content_and_publishing' },
        { label: 'Ticketing', value: 'ticketing' },
        { label: 'News', value: 'news' },
        { label: 'Video Game Arcades', value: 'video_game_arcades' },
        { label: 'Video Tape Production and Distribution', value: 'video_tape_production_and_distribution' },
        { label: 'Bowling Alleys', value: 'bowling_alleys' },
        { label: 'Billiard and Pool Establishments', value: 'billiard_and_pool_establishments' },
        { label: 'Amusement Parks and Circuses', value: 'amusement_parks_and_circuses' },
        { label: 'Ticket Agencies', value: 'ticket_agencies' }
    ],

    gaming: [
        { label: 'Game Developer', value: 'game_developer' },
        { label: 'Esports', value: 'esports' },
        { label: 'Online Casino', value: 'online_casino' },
        { label: 'Fantasy Sports', value: 'fantasy_sports' },
        { label: 'Gaming Marketplace', value: 'gaming_marketplace' }
    ],

    it_and_software: [
        { label: 'SaaS', value: 'saas' },
        { label: 'PaaS', value: 'paas' },
        { label: 'IaaS', value: 'iaas' },
        { label: 'Consulting and Outsourcing', value: 'consulting_and_outsourcing' },
        { label: 'Web Development', value: 'web_development' },
        { label: 'Technical Support', value: 'technical_support' },
        { label: 'Data Processing', value: 'data_processing' }
    ],

    food: [
        { label: 'Online Food Ordering', value: 'online_food_ordering' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Food Court', value: 'food_court' },
        { label: 'Catering', value: 'catering' },
        { label: 'Alcohol', value: 'alcohol' },
        { label: 'Restaurant Search and Booking', value: 'restaurant_search_and_booking' },
        { label: 'Dairy Products', value: 'dairy_products' },
        { label: 'Bakeries', value: 'bakeries' }
    ],

    utilities: [
        { label: 'Electricity', value: 'electricity' },
        { label: 'Gas', value: 'gas' },
        { label: 'Telecom', value: 'telecom' },
        { label: 'Water', value: 'water' },
        { label: 'Cable', value: 'cable' },
        { label: 'Broadband', value: 'broadband' },
        { label: 'DTH', value: 'dth' },
        { label: 'Internet Provider', value: 'internet_provider' },
        { label: 'Bill and Recharge Aggregators', value: 'bill_and_recharge_aggregators' }
    ],

    government: [
        { label: 'Central', value: 'central' },
        { label: 'State', value: 'state' },
        { label: 'Intra-Government Purchases', value: 'intra_government_purchases' },
        { label: 'Government Postal Services', value: 'goverment_postal_services' }
    ],

    logistics: [
        { label: 'Freight', value: 'freight' },
        { label: 'Courier', value: 'courier' },
        { label: 'Warehousing', value: 'warehousing' },
        { label: 'Distribution', value: 'distribution' },
        { label: 'End-to-End Logistics', value: 'end_to_end_logistics' },
        { label: 'Courier Services', value: 'courier_services' }
    ],

    tours_and_travel: [
        { label: 'Aviation', value: 'aviation' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'OTA', value: 'ota' },
        { label: 'Travel Agency', value: 'travel_agency' },
        { label: 'Tourist Attractions and Exhibits', value: 'tourist_attractions_and_exhibits' },
        { label: 'Timeshares', value: 'timeshares' },
        { label: 'Aquariums, Dolphinariums, and Seaquariums', value: 'aquariums_dolphinariums_and_seaquariums' }
    ],

    transport: [
        { label: 'Cab Hailing', value: 'cab_hailing' },
        { label: 'Bus', value: 'bus' },
        { label: 'Train and Metro', value: 'train_and_metro' },
        { label: 'Automobile Rentals', value: 'automobile_rentals' },
        { label: 'Cruise Lines', value: 'cruise_lines' },
        { label: 'Parking Lots and Garages', value: 'parking_lots_and_garages' },
        { label: 'Transportation', value: 'transportation' },
        { label: 'Bridge and Road Tolls', value: 'bridge_and_road_tolls' },
        { label: 'Freight Transport', value: 'freight_transport' },
        { label: 'Truck and Utility Trailer Rentals', value: 'truck_and_utility_trailer_rentals' }
    ]

}

export const currencySymbols = {
    AED: 'د.إ',   // United Arab Emirates Dirham
    AFN: '؋',     // Afghan Afghani
    ALL: 'Lek',   // Albanian Lek
    AMD: '֏',     // Armenian Dram
    ANG: 'ƒ',     // Netherlands Antillean Guilder
    AOA: 'Kz',    // Angolan Kwanza
    ARS: '$',     // Argentine Peso
    AUD: 'A$',    // Australian Dollar
    AWG: 'ƒ',     // Aruban Florin
    AZN: '₼',     // Azerbaijani Manat
    BAM: 'KM',    // Bosnia and Herzegovina Convertible Mark
    BBD: 'Bds$',  // Barbadian Dollar
    BDT: '৳',     // Bangladeshi Taka
    BGN: 'лв',    // Bulgarian Lev
    BHD: '.د.ب',  // Bahraini Dinar
    BIF: 'Fr',    // Burundian Franc
    BMD: 'BD$',   // Bermudian Dollar
    BND: 'B$',    // Brunei Dollar
    BOB: 'Bs.',   // Bolivian Boliviano
    BRL: 'R$',    // Brazilian Real
    BSD: 'B$',    // Bahamian Dollar
    BTN: 'Nu.',   // Bhutanese Ngultrum
    BWP: 'P',     // Botswanan Pula
    BYN: 'Br',    // Belarusian Ruble
    BZD: 'BZ$',   // Belize Dollar
    CAD: 'C$',    // Canadian Dollar
    CDF: 'FC',    // Congolese Franc
    CHF: 'CHF',   // Swiss Franc
    CLP: '$',     // Chilean Peso
    CNY: '¥',     // Chinese Yuan
    COP: '$',     // Colombian Peso
    CRC: '₡',     // Costa Rican Colón
    CUP: '₱',     // Cuban Peso
    CVE: '$',     // Cape Verdean Escudo
    CZK: 'Kč',    // Czech Koruna
    DJF: 'Fdj',   // Djiboutian Franc
    DKK: 'kr',    // Danish Krone
    DOP: 'RD$',   // Dominican Peso
    DZD: 'د.ج',   // Algerian Dinar
    EGP: '£',     // Egyptian Pound
    ERN: 'Nfk',   // Eritrean Nakfa
    ETB: 'Br',    // Ethiopian Birr
    EUR: '€',     // Euro
    FJD: 'FJ$',   // Fijian Dollar
    FKP: '£',     // Falkland Islands Pound
    GBP: '£',     // British Pound Sterling
    GEL: '₾',     // Georgian Lari
    GGP: '£',     // Guernsey Pound
    GHS: '₵',     // Ghanaian Cedi
    GIP: '£',     // Gibraltar Pound
    GMD: 'D',     // Gambian Dalasi
    GNF: 'Fr',    // Guinean Franc
    GTQ: 'Q',     // Guatemalan Quetzal
    GYD: '$',     // Guyanese Dollar
    HKD: 'HK$',   // Hong Kong Dollar
    HNL: 'L',     // Honduran Lempira
    HRK: 'kn',    // Croatian Kuna
    HTG: 'G',     // Haitian Gourde
    HUF: 'Ft',    // Hungarian Forint
    IDR: 'Rp',    // Indonesian Rupiah
    ILS: '₪',     // Israeli New Shekel
    IMP: '£',     // Isle of Man Pound
    INR: '₹',     // Indian Rupee
    IQD: 'ع.د',   // Iraqi Dinar
    IRR: '﷼',     // Iranian Rial
    ISK: 'kr',    // Icelandic Króna
    JMD: 'J$',    // Jamaican Dollar
    JOD: 'د.ا',   // Jordanian Dinar
    JPY: '¥',     // Japanese Yen
    KES: 'KSh',   // Kenyan Shilling
    KGS: 'с',     // Kyrgyzstani Som
    KHR: '៛',     // Cambodian Riel
    KMF: 'Fr',    // Comorian Franc
    KPW: '₩',     // North Korean Won
    KRW: '₩',     // South Korean Won
    KWD: 'د.ك',   // Kuwaiti Dinar
    KYD: 'KY$',   // Cayman Islands Dollar
    KZT: '₸',     // Kazakhstani Tenge
    LAK: '₭',     // Laotian Kip
    LBP: 'ل.ل',   // Lebanese Pound
    LKR: 'Rs',    // Sri Lankan Rupee
    LRD: '$',     // Liberian Dollar
    LSL: 'M',     // Lesotho Loti
    LTL: 'Lt',    // Lithuanian Litas (former)
    LVL: 'Ls',    // Latvian Lats (former)
    LYD: 'ل.د',   // Libyan Dinar
    MAD: 'د.م.',  // Moroccan Dirham
    MDL: 'lei',   // Moldovan Leu
    MGA: 'Ar',    // Malagasy Ariary
    MKD: 'ден',   // Macedonian Denar
    MMK: 'K',     // Myanmar Kyat
    MNT: '₮',     // Mongolian Tugrik
    MOP: 'P',     // Macanese Pataca
    MUR: '₨',     // Mauritian Rupee
    MVR: 'Rf',    // Maldivian Rufiyaa
    MWK: 'MK',    // Malawian Kwacha
    MXN: '$',     // Mexican Peso
    MYR: 'RM',    // Malaysian Ringgit
    MZN: 'MTn',   // Mozambican Metical
    NAD: '$',     // Namibian Dollar
    NGN: '₦',     // Nigerian Naira
    NIO: 'C$',    // Nicaraguan Córdoba
    NOK: 'kr',    // Norwegian Krone
    NPR: '₨',     // Nepalese Rupee
    NZD: 'NZ$',   // New Zealand Dollar
    OMR: 'ر.ع.',  // Omani Rial
    PAB: 'B/.',   // Panamanian Balboa
    PEN: 'S/',    // Peruvian Nuevo Sol
    PGK: 'K',     // Papua New Guinean Kina
    PHP: '₱',     // Philippine Peso
    PKR: 'Rs',    // Pakistani Rupee
    PLN: 'zł',    // Polish Złoty
    PYG: 'Gs',    // Paraguayan Guarani
    QAR: 'ر.ق',   // Qatari Rial
    RON: 'lei',   // Romanian Leu
    RSD: 'Рс',    // Serbian Dinar
    RUB: '₽',     // Russian Ruble
    RWF: 'Fr',    // Rwandan Franc
    SAR: 'ر.س',   // Saudi Riyal
    SBD: '$',     // Solomon Islands Dollar
    SCR: '₨',     // Seychellois Rupee
    SDG: 'ج.س.',  // Sudanese Pound
    SEK: 'kr',    // Swedish Krona
    SGD: 'S$',    // Singapore Dollar
    SHP: '£',     // Saint Helena Pound
    SLL: 'Le',    // Sierra Leonean Leone
    SOS: 'Sh',    // Somali Shilling
    SRD: '$',     // Surinamese Dollar
    SSP: '£',     // South Sudanese Pound
    STN: 'Db',    // São Tomé and Príncipe Dobra
    SVC: '$',     // Salvadoran Colón
    SYP: '£',     // Syrian Pound
    SZL: 'L',     // Swazi Lilangeni
    THB: '฿',     // Thai Baht
    TJS: 'SM',    // Tajikistani Somoni
    TMT: 'm',     // Turkmenistani Manat
    TND: 'د.ت',   // Tunisian Dinar
    TOP: 'T$',    // Tongan Paʻanga
    TRY: '₺',     // Turkish Lira
    TTD: '$',     // Trinidad and Tobago Dollar
    TWD: 'NT$',   // New Taiwan Dollar
    TZS: 'Sh',    // Tanzanian Shilling
    UAH: '₴',     // Ukrainian Hryvnia
    UGX: 'Sh',    // Ugandan Shilling
    USD: '$',     // US Dollar
    UYU: '$',     // Uruguayan Peso
    UZS: 'лв',    // Uzbekistani Som
    VEF: 'Bs.F.', // Venezuelan Bolívar (former)
    VND: '₫',     // Vietnamese đồng
    VUV: 'Vt',    // Vanuatu Vatu
    WST: 'T',     // Samoan Tala
    XAF: 'Fr',    // Central African CFA Franc
    XOF: 'Fr',    // West African CFA Franc
    YER: 'ر.ي',   // Yemeni Rial
    ZAR: 'R',     // South African Rand
    ZMK: 'ZK',    // Zambian Kwacha (former)
    ZWL: '$',     // Zimbabwean Dollar
};