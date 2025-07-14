import React, { useState } from 'react';
import { MapPin, Heart, Star, TrendingUp, Shield, Award } from 'lucide-react';

const LocalDialect = ({ 
  type = 'badge', // badge, text, button, modal
  dialect = 'swahili', // swahili, sheng, english
  context = 'general'
}) => {
  const [showTranslation, setShowTranslation] = useState(false);

  // Local dialect translations
  const translations = {
    swahili: {
      // Pricing & Negotiation
      'negotiable': 'Bei ya mwisho?',
      'best_price': 'Bei ya mwisho?',
      'make_offer': 'Juu ya bei?',
      'urgent_sale': 'Mauzo ya haraka',
      'price_reduced': 'Bei imepunguzwa',
      
      // Item Conditions
      'like_new': 'Kama mpya',
      'excellent_condition': 'Hali nzuri sana',
      'good_condition': 'Hali nzuri',
      'fair_condition': 'Hali ya kawaida',
      'needs_repair': 'Inahitaji matengenezo',
      
      // Location & Meeting
      'view_location': 'Ona mahali',
      'meet_seller': 'Kutana na muuzaji',
      'pickup_available': 'Unaweza kuchukua',
      'delivery_available': 'Tuma kwa gari',
      'near_you': 'Karibu na wewe',
      
      // Trust & Verification
      'verified_seller': 'Muuzaji aliyethibitishwa',
      'trusted_seller': 'Muuzaji wa kuaminika',
      'local_seller': 'Muuzaji wa hapa',
      'made_in_kiambu': 'Imetengenezwa Kiambu',
      
      // Engagement
      'contact_seller': 'Wasiliana na muuzaji',
      'ask_question': 'Uliza swali',
      'save_ad': 'Hifadhi tangazo',
      'share_ad': 'Shiriki tangazo',
      'report_ad': 'Ripoti tangazo',
      
      // Categories
      'electronics': 'Vifaa vya umeme',
      'vehicles': 'Magari',
      'property': 'Nyumba na ardhi',
      'furniture': 'Samani',
      'fashion': 'Nguo',
      'services': 'Huduma',
      
      // Status
      'available': 'Inapatikana',
      'sold': 'Imeuzwa',
      'reserved': 'Imehifadhiwa',
      'expired': 'Imekwisha',
      
      // Time
      'just_now': 'Sasa hivi',
      'few_minutes_ago': 'Dakika chache zilizopita',
      'hours_ago': 'Saa zilizopita',
      'days_ago': 'Siku zilizopita',
      
      // Quality
      'original': 'Asili',
      'genuine': 'Halisi',
      'authentic': 'Kweli',
      'brand_new': 'Mpya kabisa',
      
      // Urgency
      'urgent': 'Haraka',
      'quick_sale': 'Mauzo ya haraka',
      'must_go': 'Lazima liende',
      'price_drop': 'Bei imepunguzwa'
    },
    
    sheng: {
      // Pricing & Negotiation
      'negotiable': 'Bei ya mwisho?',
      'best_price': 'Bei ya mwisho?',
      'make_offer': 'Juu ya bei?',
      'urgent_sale': 'Mauzo ya haraka',
      'price_reduced': 'Bei imepunguzwa',
      
      // Item Conditions
      'like_new': 'Kama mpya',
      'excellent_condition': 'Hali nzuri sana',
      'good_condition': 'Hali nzuri',
      'fair_condition': 'Hali ya kawaida',
      'needs_repair': 'Inahitaji matengenezo',
      
      // Location & Meeting
      'view_location': 'Ona mahali',
      'meet_seller': 'Kutana na muuzaji',
      'pickup_available': 'Unaweza kuchukua',
      'delivery_available': 'Tuma kwa gari',
      'near_you': 'Karibu na wewe',
      
      // Trust & Verification
      'verified_seller': 'Muuzaji aliyethibitishwa',
      'trusted_seller': 'Muuzaji wa kuaminika',
      'local_seller': 'Muuzaji wa hapa',
      'made_in_kiambu': 'Imetengenezwa Kiambu',
      
      // Engagement
      'contact_seller': 'Wasiliana na muuzaji',
      'ask_question': 'Uliza swali',
      'save_ad': 'Hifadhi tangazo',
      'share_ad': 'Shiriki tangazo',
      'report_ad': 'Ripoti tangazo',
      
      // Categories
      'electronics': 'Vifaa vya umeme',
      'vehicles': 'Magari',
      'property': 'Nyumba na ardhi',
      'furniture': 'Samani',
      'fashion': 'Nguo',
      'services': 'Huduma',
      
      // Status
      'available': 'Inapatikana',
      'sold': 'Imeuzwa',
      'reserved': 'Imehifadhiwa',
      'expired': 'Imekwisha',
      
      // Time
      'just_now': 'Sasa hivi',
      'few_minutes_ago': 'Dakika chache zilizopita',
      'hours_ago': 'Saa zilizopita',
      'days_ago': 'Siku zilizopita',
      
      // Quality
      'original': 'Asili',
      'genuine': 'Halisi',
      'authentic': 'Kweli',
      'brand_new': 'Mpya kabisa',
      
      // Urgency
      'urgent': 'Haraka',
      'quick_sale': 'Mauzo ya haraka',
      'must_go': 'Lazima liende',
      'price_drop': 'Bei imepunguzwa'
    }
  };

  // Context-specific phrases
  const contextPhrases = {
    ad_card: {
      swahili: {
        'price_label': 'Bei:',
        'location_label': 'Mahali:',
        'condition_label': 'Hali:',
        'seller_label': 'Muuzaji:',
        'views_label': 'Tazamwa:',
        'time_label': 'Wakati:'
      },
      sheng: {
        'price_label': 'Bei:',
        'location_label': 'Mahali:',
        'condition_label': 'Hali:',
        'seller_label': 'Muuzaji:',
        'views_label': 'Tazamwa:',
        'time_label': 'Wakati:'
      }
    },
    
    negotiation: {
      swahili: {
        'offer_prompt': 'Toa bei yako:',
        'negotiate_button': 'Pata bei ya mwisho',
        'best_offer': 'Bei bora',
        'counter_offer': 'Toa bei tofauti',
        'accept_offer': 'Kubali bei'
      },
      sheng: {
        'offer_prompt': 'Toa bei yako:',
        'negotiate_button': 'Pata bei ya mwisho',
        'counter_offer': 'Toa bei tofauti',
        'accept_offer': 'Kubali bei'
      }
    },
    
    trust: {
      swahili: {
        'verified_badge': 'Alithibitishwa',
        'local_badge': 'Wa hapa',
        'trusted_badge': 'Wa kuaminika',
        'kiambu_made': 'Imetengenezwa Kiambu'
      },
      sheng: {
        'verified_badge': 'Alithibitishwa',
        'local_badge': 'Wa hapa',
        'trusted_badge': 'Wa kuaminika',
        'kiambu_made': 'Imetengenezwa Kiambu'
      }
    }
  };

  const getTranslation = (key) => {
    const dialectData = translations[dialect] || translations.swahili;
    const contextData = contextPhrases[context] || contextPhrases.ad_card;
    
    return dialectData[key] || contextData?.[dialect]?.[key] || key;
  };

  // Badge component
  if (type === 'badge') {
    return (
      <div className="inline-flex items-center space-x-1">
        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs font-medium">
          {getTranslation('made_in_kiambu')}
        </span>
        {showTranslation && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Made in Kiambu)
          </span>
        )}
      </div>
    );
  }

  // Text component
  if (type === 'text') {
    return (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {getTranslation('negotiable')}
      </span>
    );
  }

  // Button component
  if (type === 'button') {
    return (
      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
        {getTranslation('contact_seller')}
      </button>
    );
  }

  // Modal component
  if (type === 'modal') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getTranslation('negotiate_button')}
          </h3>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showTranslation ? 'Hide' : 'Show'} English
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getTranslation('offer_prompt')}
            </label>
            <input
              type="number"
              placeholder="Toa bei yako..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              {getTranslation('counter_offer')}
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              {getTranslation('accept_offer')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: return a simple text
  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {getTranslation('negotiable')}
    </span>
  );
};

// Local dialect utility functions
export const getLocalPhrase = (key, dialect = 'swahili') => {
  const translations = {
    swahili: {
      'welcome_message': 'Karibu Kiambu Classifieds!',
      'search_placeholder': 'Tafuta bidhaa...',
      'post_ad_button': 'Tangaza bidhaa',
      'view_all': 'Ona zote',
      'filter_by': 'Chuja kwa',
      'sort_by': 'Panga kwa',
      'price_range': 'Mbalimbali ya bei',
      'location_filter': 'Chuja kwa mahali',
      'condition_filter': 'Chuja kwa hali',
      'verified_only': 'Wathibitishwa tu',
      'contact_seller': 'Wasiliana na muuzaji',
      'ask_question': 'Uliza swali',
      'save_ad': 'Hifadhi tangazo',
      'share_ad': 'Shiriki tangazo',
      'report_ad': 'Ripoti tangazo',
      'negotiable': 'Bei ya mwisho?',
      'urgent_sale': 'Mauzo ya haraka',
      'like_new': 'Kama mpya',
      'excellent_condition': 'Hali nzuri sana',
      'good_condition': 'Hali nzuri',
      'fair_condition': 'Hali ya kawaida',
      'needs_repair': 'Inahitaji matengenezo',
      'made_in_kiambu': 'Imetengenezwa Kiambu',
      'local_seller': 'Muuzaji wa hapa',
      'verified_seller': 'Muuzaji aliyethibitishwa',
      'trusted_seller': 'Muuzaji wa kuaminika',
      'pickup_available': 'Unaweza kuchukua',
      'delivery_available': 'Tuma kwa gari',
      'near_you': 'Karibu na wewe',
      'available': 'Inapatikana',
      'sold': 'Imeuzwa',
      'reserved': 'Imehifadhiwa',
      'expired': 'Imekwisha',
      'just_now': 'Sasa hivi',
      'few_minutes_ago': 'Dakika chache zilizopita',
      'hours_ago': 'Saa zilizopita',
      'days_ago': 'Siku zilizopita',
      'original': 'Asili',
      'genuine': 'Halisi',
      'authentic': 'Kweli',
      'brand_new': 'Mpya kabisa',
      'urgent': 'Haraka',
      'quick_sale': 'Mauzo ya haraka',
      'must_go': 'Lazima liende',
      'price_drop': 'Bei imepunguzwa'
    }
  };
  
  return translations[dialect]?.[key] || key;
};

export default LocalDialect; 