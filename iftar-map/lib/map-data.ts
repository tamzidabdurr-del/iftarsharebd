export interface IftarSpot {
  id: number
  name: string
  location: string
  lat: number
  lng: number
  verified: boolean
  meals: number
  time: string
  contact: string
}

export interface TrafficPin {
  id: number
  lat: number
  lng: number
  type: 'jam' | 'shortcut'
  label: string
  description: string
}

export interface HelpRequest {
  id: number
  name: string
  location: string
  lat: number
  lng: number
  need: string
  people: number
  urgent: boolean
}

export interface Volunteer {
  id: number
  name: string
  area: string
  meals: number
  rank: number
}

export const iftarSpots: IftarSpot[] = [
  { id: 1, name: 'গুলশান ইফতার পয়েন্ট', location: 'গুলশান-১, ঢাকা', lat: 23.7925, lng: 90.4078, verified: true, meals: 500, time: '৬:১৫ PM', contact: '01711-XXXXXX' },
  { id: 2, name: 'মতিঝিল ইফতার মাহফিল', location: 'মতিঝিল, ঢাকা', lat: 23.7283, lng: 90.4193, verified: true, meals: 1200, time: '৬:১৫ PM', contact: '01812-XXXXXX' },
  { id: 3, name: 'চট্টগ্রাম কেন্দ্রীয় ইফতার', location: 'আগ্রাবাদ, চট্টগ্রাম', lat: 22.3264, lng: 91.8095, verified: true, meals: 800, time: '৬:১০ PM', contact: '01911-XXXXXX' },
  { id: 4, name: 'খুলনা জামে মসজিদ ইফতার', location: 'খুলনা সদর', lat: 22.8456, lng: 89.5403, verified: true, meals: 350, time: '৬:১৮ PM', contact: '01611-XXXXXX' },
  { id: 5, name: 'রাজশাহী বড়কুঠি ইফতার', location: 'রাজশাহী', lat: 24.3745, lng: 88.6042, verified: false, meals: 200, time: '৬:২০ PM', contact: '01511-XXXXXX' },
  { id: 6, name: 'সিলেট ওসমানী উদ্যান ইফতার', location: 'সিলেট', lat: 24.8949, lng: 91.8687, verified: true, meals: 600, time: '৬:০৮ PM', contact: '01311-XXXXXX' },
  { id: 7, name: 'বরিশাল নদী ঘাট ইফতার', location: 'বরিশাল', lat: 22.7010, lng: 90.3535, verified: true, meals: 450, time: '৬:১৫ PM', contact: '01411-XXXXXX' },
  { id: 8, name: 'ময়মনসিংহ কেন্দ্রীয় ইফতার', location: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203, verified: false, meals: 150, time: '৬:১৭ PM', contact: '01811-XXXXXX' },
  { id: 9, name: 'রংপুর তাজহাট ইফতার', location: 'রংপুর', lat: 25.7439, lng: 89.2752, verified: true, meals: 300, time: '৬:২২ PM', contact: '01711-YYYYYY' },
  { id: 10, name: 'কুমিল্লা টমটম ইফতার', location: 'কুমিল্লা', lat: 23.4607, lng: 91.1809, verified: true, meals: 250, time: '৬:১২ PM', contact: '01911-YYYYYY' },
  { id: 11, name: 'ধানমন্ডি লেক পাড় ইফতার', location: 'ধানমন্ডি, ঢাকা', lat: 23.7461, lng: 90.3742, verified: true, meals: 700, time: '৬:১৫ PM', contact: '01612-XXXXXX' },
  { id: 12, name: 'মিরপুর-১০ ইফতার মাহফিল', location: 'মিরপুর, ঢাকা', lat: 23.8069, lng: 90.3687, verified: true, meals: 900, time: '৬:১৫ PM', contact: '01512-XXXXXX' },
]

export const trafficPins: TrafficPin[] = [
  { id: 1, lat: 23.7509, lng: 90.3937, type: 'jam', label: 'ফার্মগেট', description: 'তীব্র যানজট - ইফতার আগে ২ ঘণ্টা' },
  { id: 2, lat: 23.7806, lng: 90.4075, type: 'jam', label: 'মহাখালী', description: 'যানজট - বিকল্প পথ ব্যবহার করুন' },
  { id: 3, lat: 23.7333, lng: 90.3974, type: 'jam', label: 'মতিঝিল', description: 'ইফতার টাইমে চরম যানজট' },
  { id: 4, lat: 23.7727, lng: 90.3598, type: 'shortcut', label: 'মিরপুর রোড শর্টকাট', description: 'কম যানবাহন - দ্রুত পৌঁছান' },
  { id: 5, lat: 23.7617, lng: 90.4255, type: 'shortcut', label: 'রামপুরা বাইপাস', description: 'বিকল্প রুট - সময় বাঁচান ১৫ মিনিট' },
  { id: 6, lat: 23.8103, lng: 90.4125, type: 'shortcut', label: 'উত্তরা লিংক রোড', description: 'ফাঁকা রাস্তা - ইফতারের আগে ভালো' },
]

export const helpRequests: HelpRequest[] = [
  { id: 1, name: 'রিকশাচালক গ্রুপ', location: 'পুরান ঢাকা', lat: 23.7104, lng: 90.4074, need: '৫০ জন রিকশাচালকের জন্য ইফতার দরকার', people: 50, urgent: true },
  { id: 2, name: 'বস্তিবাসী পরিবার', location: 'কামরাঙ্গীরচর', lat: 23.7152, lng: 90.3842, need: '৩০টি পরিবারের জন্য ইফতার প্রয়োজন', people: 120, urgent: true },
  { id: 3, name: 'পথশিশু গ্রুপ', location: 'সদরঘাট', lat: 23.7089, lng: 90.4069, need: '২৫ জন পথশিশুর জন্য ইফতার', people: 25, urgent: false },
  { id: 4, name: 'দিনমজুর পরিবার', location: 'গাজীপুর', lat: 24.0023, lng: 90.4208, need: '৪০ জন দিনমজুরের ইফতার', people: 40, urgent: true },
  { id: 5, name: 'বিধবা মহিলা গ্রুপ', location: 'নারায়ণগঞ্জ', lat: 23.6238, lng: 90.5000, need: '২০ জন বিধবা মহিলার পরিবারের জন্য ইফতার', people: 80, urgent: false },
  { id: 6, name: 'প্রতিবন্ধী সেবা কেন্দ্র', location: 'মোহাম্মদপুর', lat: 23.7662, lng: 90.3588, need: '১৫ জন প্রতিবন্ধী ব্যক্তির জন্য ইফতার', people: 15, urgent: true },
]

export const topVolunteers: Volunteer[] = [
  { id: 1, name: 'আব্দুল্লাহ আল মামুন', area: 'গুলশান', meals: 4520, rank: 1 },
  { id: 2, name: 'ফাতেমা বেগম', area: 'ধানমন্ডি', meals: 3890, rank: 2 },
  { id: 3, name: 'মোহাম্মদ রাকিব', area: 'চট্টগ্রাম', meals: 3450, rank: 3 },
  { id: 4, name: 'নুসরাত জাহান', area: 'মিরপুর', meals: 2980, rank: 4 },
  { id: 5, name: 'তানভীর আহমেদ', area: 'সিলেট', meals: 2650, rank: 5 },
  { id: 6, name: 'সামিয়া আক্তার', area: 'রাজশাহী', meals: 2340, rank: 6 },
  { id: 7, name: 'ইমরান হোসেন', area: 'খুলনা', meals: 2100, rank: 7 },
  { id: 8, name: 'রুমানা পারভীন', area: 'বরিশাল', meals: 1890, rank: 8 },
  { id: 9, name: 'কামরুল ইসলাম', area: 'রংপুর', meals: 1650, rank: 9 },
  { id: 10, name: 'সাবরিনা মোস্তাফিজ', area: 'কুমিল্লা', meals: 1420, rank: 10 },
]
