import * as THREE from "/vendor/three/three.js";
import { OrbitControls } from "/vendor/three/OrbitControls.js";
import { GLTFLoader } from "/vendor/three/GLTFLoader.js";

const ASSETS = {
  en: { modelUrl: "/english.glb", videoUrl: "/english.mkv", htmlLang: "en" },
  hi: { modelUrl: "/hindi.glb", videoUrl: "/hindi.mkv", htmlLang: "hi" },
  pa: { modelUrl: "/punjabi.glb", videoUrl: "/punjabi.mkv", htmlLang: "pa" },
};

const LABEL_NAMES = [
  "apex",
  "aorta",
  "pulmonary_artery",
  "right_atrium",
  "left_atrium",
  "right_ventricle",
  "left_ventricle",
  "chordae_tendinae",
  "pulmonary_veins",
  "superior_vena_cava",
  "inferior_vena_cava",
  "interventricular_septum",
];
const LABEL_MAP = {
  aorta: "महाधमनी",
  pulmonary_artery: "फुफ्फुसीय_धमनी",
  pulmonary_veins: "फुफ्फुसीय_शिरा",
  left_atrium: "बायां_अलिंद",
  left_ventricle: "बायां_निलय",
  interventricular_septum: "अंतर_निलयी_पट्टिका",
  superior_vena_cava: "ऊपरी_महाशिरा",
  right_atrium: "दाहिना_अलिंद",
  chordae_tendinae: "कॉर्डे_टेंडिने",
  right_ventricle: "दाहिना_निलय",
  inferior_vena_cava: "निम्न_महाशिरा"
};
const LABEL_MAP_PUNJABI = {
  apex: "ਨੋਕ",
  aorta: "ਮਹਾਧਮਨੀ",
  pulmonary_artery: "ਫੇਫੜਾ_ਧਮਨੀ",
  pulmonary_veins: "ਫੇਫੜਾ_ਸ਼ਿਰਾ",
  left_atrium: "ਖੱਬਾ_ਆਰੀਕਲ",
  left_ventricle: "ਖੱਬਾ_ਵੈਂਟਰੀਕਲ",
  interventricular_septum: "ਇੰਟਰਵੈਂਟਰੀਕੁਲਰ_ਸੈਪਟਮ",
  superior_vena_cava: "ਉੱਪਰੀ_ਮਹਾਸ਼ਿਰਾ",
  right_atrium: "ਸੱਜਾ_ਆਰੀਕਲ",
  chordae_tendinae: "ਕੋਰਡੀਏ_ਟੈਂਡੀਨੇ",
  right_ventricle: "ਸੱਜਾ_ਵੈਂਟਰੀਕਲ",
  inferior_vena_cava: "ਹੇਠਲੀ_ਮਹਾਸ਼ਿਰਾ"
};
const LABEL_NAMES_HINDI = [
  "महाधमनी",
  "फुफ्फुसीय_धमनी",
  "फुफ्फुसीय_शिरा",
  "बायां अलिंद",
  "बायां निलय",
  "अंतर_निलयी_पट्टिका",
  "ऊपरी_महाशिरा",
  "दाहिना_अलिंद",
  "कॉर्डे_टेंडिने",
  "दाहिना_निलय",
  "निम्न_महाशिरा"

];
const LABEL_NAMES_PUNJABI = [
  "ਨੋਕ",
  "ਮਹਾਧਮਨੀ",
  "ਫੇਫੜਾ_ਧਮਨੀ",
  "ਫੇਫੜਾ_ਸ਼ਿਰਾ",
  "ਖੱਬਾ_ਆਰੀਕਲ",
  "ਖੱਬਾ_ਵੈਂਟਰੀਕਲ",
  "ਇੰਟਰਵੈਂਟਰੀਕੁਲਰ_ਸੈਪਟਮ",
  "ਉੱਪਰੀ_ਮਹਾਸ਼ਿਰਾ",
  "ਸੱਜਾ_ਆਰੀਕਲ",
  "ਕੋਰਡੀਏ_ਟੈਂਡੀਨੇ",
  "ਸੱਜਾ_ਵੈਂਟਰੀਕਲ",
  "ਹੇਠਲੀ_ਮਹਾਸ਼ਿਰਾ"
];
const LABEL_CONTENT_HINDI = {
  महाधमनी: {
    category: "Outgoing Vessel",
    description: "बाएं निलय से ऑक्सीजन युक्त रक्त को पूरे शरीर में ले जाती है।",
    question: "महाधमनी किस प्रकार के परिसंचरण में भाग लेती है?",
    options: ["सिस्टमिक परिसंचरण", "फुफ्फुसीय परिसंचरण"],
    correctAnswer: "सिस्टमिक परिसंचरण"
  },

  फुफ्फुसीय_धमनी: {
    category: "Outgoing Vessel",
    description: "दाएं निलय से ऑक्सीजन रहित रक्त को फेफड़ों तक ले जाती है।",
    question: "फुफ्फुसीय धमनी को अपवाद क्यों कहा जाता है?",
    options: [
      "यह ऑक्सीजन युक्त रक्त ले जाती है",
      "यह ऑक्सीजन रहित रक्त ले जाती है"
    ],
    correctAnswer: "यह ऑक्सीजन रहित रक्त ले जाती है"
  },

  फुफ्फुसीय_शिरा: {
    category: "Returning Vessel",
    description: "फेफड़ों से ऑक्सीजन युक्त रक्त को हृदय तक लाती है।",
    question: "फुफ्फुसीय शिराएं किस कक्ष में खुलती हैं?",
    options: ["दायां अलिंद", "बायां अलिंद"],
    correctAnswer: "बायां अलिंद"
  },

  बायां_अलिंद: {
    category: "Receiving Chamber",
    description: "फेफड़ों से ऑक्सीजन युक्त रक्त प्राप्त करता है।",
    question: "मानव में बाएं अलिंद में कितनी फुफ्फुसीय शिराएं खुलती हैं?",
    options: ["दो", "चार"],
    correctAnswer: "चार"
  },

  बायां_निलय: {
    category: "Pumping Chamber",
    description: "ऑक्सीजन युक्त रक्त को पूरे शरीर में पंप करता है।",
    question: "बाएं निलय और महाधमनी के बीच कौन-सा वाल्व होता है?",
    options: ["माइट्रल वाल्व", "एओर्टिक सेमील्यूनर वाल्व"],
    correctAnswer: "एओर्टिक सेमील्यूनर वाल्व"
  },

  अंतर_निलयी_पट्टिका: {
    category: "Heart Wall",
    description: "बाएं और दाएं निलय को अलग करती है।",
    question: "यदि अंतर निलयी पट्टिका में दोष हो तो क्या होगा?",
    options: [
      "ऑक्सीजन युक्त और ऑक्सीजन रहित रक्त का मिश्रण",
      "परिसंचरण पर कोई प्रभाव नहीं"
    ],
    correctAnswer: "ऑक्सीजन युक्त और ऑक्सीजन रहित रक्त का मिश्रण"
  },

  ऊपरी_महाशिरा: {
    category: "Returning Vessel",
    description: "ऊपरी शरीर से ऑक्सीजन रहित रक्त को दाएं अलिंद में लाती है।",
    question: "ऊपरी महाशिरा शरीर के किस भाग से रक्त नहीं लाती है?",
    options: ["सिर और भुजाएं", "निचले अंग"],
    correctAnswer: "निचले अंग"
  },

  दाहिना_अलिंद: {
    category: "Receiving Chamber",
    description: "शरीर से ऑक्सीजन रहित रक्त प्राप्त करता है।",
    question: "हृदय की धड़कन को नियंत्रित करने वाला कौन-सा नोड दाएं अलिंद में होता है?",
    options: ["साइनोएट्रियल नोड", "एट्रियोवेंट्रिकुलर नोड "],
    correctAnswer: "साइनोएट्रियल नोड"
  },

  चॉर्डे_टेंडिने: {
    category: "Support Structure",
    description: "रेशेदार डोरियां जो वाल्व को सहारा देती हैं और उन्हें उलटने से रोकती हैं।",
    question: "कॉर्डे टेंडिने किस मांसपेशियों से जुड़ी होती हैं?",
    options: ["पेपिलरी मसल्स", "कार्डियक सेप्टम"],
    correctAnswer: "पेपिलरी मसल्स"
  },

  दाहिना_निलय: {
    category: "Pumping Chamber",
    description: "ऑक्सीजन रहित रक्त को फेफड़ों तक पंप करता है।",
    question: "दाएं निलय और फुफ्फुसीय धमनी के बीच कौन-सा वाल्व होता है?",
    options: ["ट्राइकस्पिड वाल्व", "पल्मोनरी सेमील्यूनर वाल्व"],
    correctAnswer: "पल्मोनरी सेमील्यूनर वाल्व"
  },

  निम्न_महाशिरा: {
    category: "Returning Vessel",
    description: "निचले शरीर से ऑक्सीजन रहित रक्त को दाएं अलिंद में लाती है।",
    question: "निम्न महाशिरा डायफ्राम के किस छिद्र से गुजरती है?",
    options: ["वेना कैवल ओपनिंग", "एओर्टिक ओपनिंग"],
    correctAnswer: "वेना कैवल ओपनिंग"
  }
};
const LABEL_CONTENT_PUNJABI = {
  ਨੋਕ: {
    category: "Heart Tip",
    description: "ਦਿਲ ਦਾ ਨੁਕੀਲਾ ਹੇਠਲਾ ਹਿੱਸਾ ਜੋ ਮੁੱਖ ਤੌਰ ਤੇ ਖੱਬੇ ਨਿਲਯ ਤੋਂ ਬਣਿਆ ਹੁੰਦਾ ਹੈ।",
    question: "ਮਨੁੱਖ ਦੇ ਸਰੀਰ ਵਿੱਚ ਦਿਲ ਦੀ ਨੋਕ ਕਿਸ ਦਿਸ਼ਾ ਵੱਲ ਹੁੰਦੀ ਹੈ?",
    options: ["ਖੱਬੇ ਪਾਸੇ", "ਸੱਜੇ ਪਾਸੇ"],
    correctAnswer: "ਖੱਬੇ ਪਾਸੇ"
  },
  
  ਮਹਾਧਮਨੀ: {
    category: "Outgoing Vessel",
    description: "ਖੱਬੇ ਵੈਂਟਰੀਕਲ ਤੋਂ ਆਕਸੀਜਨ ਭਰਪੂਰ ਖੂਨ ਨੂੰ ਸਰੀਰ ਦੇ ਹਰ ਹਿੱਸੇ ਤੱਕ ਲੈ ਜਾਂਦੀ ਹੈ।",
    question: "ਮਹਾਧਮਨੀ ਕਿਹੜੇ ਪ੍ਰਕਾਰ ਦੇ ਸਰਕੂਲੇਸ਼ਨ ਵਿੱਚ ਸ਼ਾਮਲ ਹੁੰਦੀ ਹੈ?",
    options: ["ਸਿਸਟਮਿਕ ਸਰਕੂਲੇਸ਼ਨ", "ਪਲਮੋਨਰੀ ਸਰਕੂਲੇਸ਼ਨ"],
    correctAnswer: "ਸਿਸਟਮਿਕ ਸਰਕੂਲੇਸ਼ਨ"
  },

  ਫੇਫੜਾ_ਧਮਨੀ: {
    category: "Outgoing Vessel",
    description: "ਸੱਜੇ ਵੈਂਟਰੀਕਲ ਤੋਂ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਫੇਫੜਿਆਂ ਤੱਕ ਲੈ ਜਾਂਦੀ ਹੈ।",
    question: "ਫੇਫੜਾ ਧਮਨੀ ਨੂੰ ਅਪਵਾਦ ਕਿਉਂ ਕਿਹਾ ਜਾਂਦਾ ਹੈ?",
    options: [
      "ਇਹ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਲੈ ਜਾਂਦੀ ਹੈ",
      "ਇਹ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਲੈ ਜਾਂਦੀ ਹੈ"
    ],
    correctAnswer: "ਇਹ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਲੈ ਜਾਂਦੀ ਹੈ"
  },

  ਫੇਫੜਾ_ਸ਼ਿਰਾ: {
    category: "Returning Vessel",
    description: "ਫੇਫੜਿਆਂ ਤੋਂ ਆਕਸੀਜਨ ਭਰਪੂਰ ਖੂਨ ਦਿਲ ਤੱਕ ਲਿਆਉਂਦੀ ਹੈ।",
    question: "ਫੇਫੜਾ ਸ਼ਿਰਾਵਾਂ ਕਿਹੜੇ ਕਮਰੇ ਵਿੱਚ ਖੁਲਦੀਆਂ ਹਨ?",
    options: ["ਸੱਜਾ ਆਰੀਕਲ", "ਖੱਬਾ ਆਰੀਕਲ"],
    correctAnswer: "ਖੱਬਾ ਆਰੀਕਲ"
  },

  ਖੱਬਾ_ਆਰੀਕਲ: {
    category: "Receiving Chamber",
    description: "ਫੇਫੜਿਆਂ ਤੋਂ ਆਕਸੀਜਨ ਭਰਪੂਰ ਖੂਨ ਪ੍ਰਾਪਤ ਕਰਦਾ ਹੈ।",
    question: "ਇਨਸਾਨ ਵਿੱਚ ਖੱਬੇ ਆਰੀਕਲ ਵਿੱਚ ਕਿੰਨੀ ਫੇਫੜਾ ਸ਼ਿਰਾਵਾਂ ਖੁਲਦੀਆਂ ਹਨ?",
    options: ["ਦੋ", "ਚਾਰ"],
    correctAnswer: "ਚਾਰ"
  },

  ਖੱਬਾ_ਵੈਂਟਰੀਕਲ: {
    category: "Pumping Chamber",
    description: "ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਪੂਰੇ ਸਰੀਰ ਵਿੱਚ ਪੰਪ ਕਰਦਾ ਹੈ।",
    question: "ਖੱਬੇ ਵੈਂਟਰੀਕਲ ਅਤੇ ਮਹਾਧਮਨੀ ਵਿਚਕਾਰ ਕਿਹੜਾ ਵਾਲਵ ਹੁੰਦਾ ਹੈ?",
    options: ["ਮਾਇਟਰਲ ਵਾਲਵ", "ਏਓਰਟਿਕ ਸੈਮੀਲੂਨਰ ਵਾਲਵ"],
    correctAnswer: "ਏਓਰਟਿਕ ਸੈਮੀਲੂਨਰ ਵਾਲਵ"
  },

  ਇੰਟਰਵੈਂਟਰੀਕੁਲਰ_ਸੈਪਟਮ: {
    category: "Heart Wall",
    description: "ਖੱਬੇ ਅਤੇ ਸੱਜੇ ਵੈਂਟਰੀਕਲ ਨੂੰ ਵੱਖ ਕਰਦਾ ਹੈ।",
    question: "ਜੇ ਇੰਟਰਵੈਂਟਰੀਕੁਲਰ ਸੈਪਟਮ ਵਿੱਚ ਖਾਮੀ ਹੋਵੇ ਤਾਂ ਕੀ ਹੋਵੇਗਾ?",
    options: [
      "ਆਕਸੀਜਨ ਵਾਲੇ ਅਤੇ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲੇ ਖੂਨ ਦਾ ਮਿਲਾਪ",
      "ਕੋਈ ਅਸਰ ਨਹੀਂ ਪਵੇਗਾ"
    ],
    correctAnswer: "ਆਕਸੀਜਨ ਵਾਲੇ ਅਤੇ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲੇ ਖੂਨ ਦਾ ਮਿਲਾਪ"
  },

  ਉੱਪਰੀ_ਮਹਾਸ਼ਿਰਾ: {
    category: "Returning Vessel",
    description: "ਉੱਪਰੀ ਸਰੀਰ ਤੋਂ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਸੱਜੇ ਆਰੀਕਲ ਵਿੱਚ ਲਿਆਉਂਦੀ ਹੈ।",
    question: "ਉੱਪਰੀ ਮਹਾਸ਼ਿਰਾ ਸਰੀਰ ਦੇ ਕਿਹੜੇ ਹਿੱਸੇ ਤੋਂ ਖੂਨ ਨਹੀਂ ਲਿਆਉਂਦੀ?",
    options: ["ਸਿਰ ਅਤੇ ਬਾਂਹਾਂ", "ਹੇਠਲੇ ਅੰਗ"],
    correctAnswer: "ਹੇਠਲੇ ਅੰਗ"
  },

  ਸੱਜਾ_ਆਰੀਕਲ: {
    category: "Receiving Chamber",
    description: "ਸਰੀਰ ਤੋਂ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਪ੍ਰਾਪਤ ਕਰਦਾ ਹੈ।",
    question: "ਦਿਲ ਦੀ ਧੜਕਣ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਨ ਵਾਲਾ ਕਿਹੜਾ ਨੋਡ ਸੱਜੇ ਆਰੀਕਲ ਵਿੱਚ ਹੁੰਦਾ ਹੈ?",
    options: ["ਸਾਈਨੋਏਟ੍ਰੀਅਲ ਨੋਡ", "ਐਟ੍ਰੀਓਵੈਂਟ੍ਰਿਕੁਲਰ ਨੋਡ"],
    correctAnswer: "ਸਾਈਨੋਏਟ੍ਰੀਅਲ ਨੋਡ"
  },

  ਕੋਰਡੀਏ_ਟੈਂਡੀਨੇ: {
    category: "Support Structure",
    description: "ਰੇਸ਼ੇਦਾਰ ਡੋਰਾਂ ਜੋ ਵਾਲਵ ਨੂੰ ਸਹਾਰਾ ਦਿੰਦੀਆਂ ਹਨ ਅਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਉਲਟਣ ਤੋਂ ਰੋਕਦੀਆਂ ਹਨ।",
    question: "ਕੋਰਡੀਏ ਟੈਂਡੀਨੇ ਕਿਹੜੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਨਾਲ ਜੁੜੀਆਂ ਹੁੰਦੀਆਂ ਹਨ?",
    options: ["ਪੈਪਿਲਰੀ ਮਾਸਪੇਸ਼ੀਆਂ", "ਕਾਰਡਿਯਕ ਸੈਪਟਮ"],
    correctAnswer: "ਪੈਪਿਲਰੀ ਮਾਸਪੇਸ਼ੀਆਂ"
  },

  ਸੱਜਾ_ਵੈਂਟਰੀਕਲ: {
    category: "Pumping Chamber",
    description: "ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਫੇਫੜਿਆਂ ਤੱਕ ਪੰਪ ਕਰਦਾ ਹੈ।",
    question: "ਸੱਜੇ ਵੈਂਟਰੀਕਲ ਅਤੇ ਫੇਫੜਾ ਧਮਨੀ ਵਿਚਕਾਰ ਕਿਹੜਾ ਵਾਲਵ ਹੁੰਦਾ ਹੈ?",
    options: ["ਟ੍ਰਾਈਕਸਪਿਡ ਵਾਲਵ", "ਪਲਮੋਨਰੀ ਸੈਮੀਲੂਨਰ ਵਾਲਵ"],
    correctAnswer: "ਪਲਮੋਨਰੀ ਸੈਮੀਲੂਨਰ ਵਾਲਵ"
  },

  ਹੇਠਲੀ_ਮਹਾਸ਼ਿਰਾ: {
    category: "Returning Vessel",
    description: "ਹੇਠਲੇ ਸਰੀਰ ਤੋਂ ਬਿਨਾਂ ਆਕਸੀਜਨ ਵਾਲਾ ਖੂਨ ਸੱਜੇ ਆਰੀਕਲ ਵਿੱਚ ਲਿਆਉਂਦੀ ਹੈ।",
    question: "ਹੇਠਲੀ ਮਹਾਸ਼ਿਰਾ ਡਾਯਾਫ੍ਰੇਮ ਦੇ ਕਿਹੜੇ ਛਿਦਰ ਵਿੱਚੋਂ ਲੰਘਦੀ ਹੈ?",
    options: ["ਵੇਨਾ ਕੈਵਲ ਓਪਨਿੰਗ", "ਏਓਰਟਿਕ ਓਪਨਿੰਗ"],
    correctAnswer: "ਵੇਨਾ ਕੈਵਲ ਓਪਨਿੰਗ"
  }
};
const LABEL_CONTENT = {
  apex: {
  category: "Heart Tip",
  description: "The pointed lower end of the heart formed mainly by the left ventricle.",
  question: "In which direction does the apex of the heart point in the human body?",
  options: ["Left side", "Right side"],
  correctAnswer: "Left side"
},

  aorta: {
  category: "Outgoing Vessel",
  description: "Carries oxygen-rich blood from the left ventricle to the body.",
  question: "Which type of circulation involves the aorta?",
  options: ["Systemic circulation", "Pulmonary circulation"],
  correctAnswer: "Systemic circulation"
},

  pulmonary_artery: {
  category: "Outgoing Vessel",
  description: "Carries deoxygenated blood from the right ventricle to the lungs.",
  question: "Why is pulmonary artery called an exception among arteries?",
  options: [
    "It carries oxygenated blood",
    "It carries deoxygenated blood"
  ],
  correctAnswer: "It carries deoxygenated blood"
},

  right_atrium: {
  category: "Receiving Chamber",
  description: "Receives deoxygenated blood from the body.",
  question: "Which node that regulates heartbeat is located in the right atrium?",
  options: ["SA node", "AV node"],
  correctAnswer: "SA node"
},

  left_atrium: {
  category: "Receiving Chamber",
  description: "Receives oxygenated blood from the lungs.",
  question: "How many pulmonary veins open into the left atrium in humans?",
  options: ["Two", "Four"],
  correctAnswer: "Four"
},

  right_ventricle: {
  category: "Pumping Chamber",
  description: "Pumps deoxygenated blood to the lungs.",
  question: "Which valve guards the opening between right ventricle and pulmonary artery?",
  options: ["Tricuspid valve", "Pulmonary semilunar valve"],
  correctAnswer: "Pulmonary semilunar valve"
},

  left_ventricle: {
  category: "Pumping Chamber",
  description: "Pumps oxygen-rich blood to the entire body.",
  question: "Which valve is present between left ventricle and aorta?",
  options: ["Mitral valve", "Aortic semilunar valve"],
  correctAnswer: "Aortic semilunar valve"
},

  chordae_tendinae: {
  category: "Support Structure",
  description: "Fibrous cords that anchor valves and prevent their inversion.",
  question: "Chordae tendineae are attached to which muscles?",
  options: ["Papillary muscles", "Cardiac septum"],
  correctAnswer: "Papillary muscles"
},

  pulmonary_veins: {
  category: "Returning Vessel",
  description: "Carry oxygen-rich blood from lungs to the heart.",
  question: "Pulmonary veins open into which chamber?",
  options: ["Right atrium", "Left atrium"],
  correctAnswer: "Left atrium"
},

  superior_vena_cava: {
  category: "Returning Vessel",
  description: "Brings deoxygenated blood from upper body to right atrium.",
  question: "Which part of the body does superior vena cava NOT drain?",
  options: ["Head and arms", "Lower limbs"],
  correctAnswer: "Lower limbs"
},

  inferior_vena_cava: {
  category: "Returning Vessel",
  description: "Brings deoxygenated blood from lower body to right atrium.",
  question: "Inferior vena cava passes through which diaphragm opening?",
  options: ["Vena caval opening", "Aortic opening"],
  correctAnswer: "Vena caval opening"
},

  interventricular_septum: {
  category: "Heart Wall",
  description: "Separates the left and right ventricles.",
  question: "What would happen if the interventricular septum had a defect?",
  options: [
    "Mixing of oxygenated and deoxygenated blood",
    "No effect on circulation"
  ],
  correctAnswer: "Mixing of oxygenated and deoxygenated blood"
}
};

const HINDI_LABEL_MAP_CLEAN = {
  apex: "\u0905\u0917\u094d\u0930\u092d\u093e\u0917",
  aorta: "\u092e\u0939\u093e\u0927\u092e\u0928\u0940",
  pulmonary_artery: "\u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f_\u0927\u092e\u0928\u0940",
  right_atrium: "\u0926\u093e\u0939\u093f\u0928\u093e_\u0905\u0932\u093f\u0902\u0926",
  left_atrium: "\u092c\u093e\u092f\u093e\u0901_\u0905\u0932\u093f\u0902\u0926",
  right_ventricle: "\u0926\u093e\u0939\u093f\u0928\u093e_\u0928\u093f\u0932\u092f",
  left_ventricle: "\u092c\u093e\u092f\u093e\u0901_\u0928\u093f\u0932\u092f",
  chordae_tendinae: "\u0915\u0949\u0930\u094d\u0921\u0947_\u091f\u0947\u0902\u0921\u093f\u0928\u0940",
  pulmonary_veins: "\u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f_\u0936\u093f\u0930\u093e",
  superior_vena_cava: "\u090a\u092a\u0930\u0940_\u092e\u0939\u093e\u0936\u093f\u0930\u093e",
  inferior_vena_cava: "\u0928\u093f\u092e\u094d\u0928_\u092e\u0939\u093e\u0936\u093f\u0930\u093e",
  interventricular_septum: "\u0905\u0902\u0924\u0930_\u0928\u093f\u0932\u092f\u0940_\u092a\u091f\u094d\u091f\u093f\u0915\u093e",
};

const LABEL_CONTENT_HINDI_CLEAN = {
  [HINDI_LABEL_MAP_CLEAN.apex]: {
    category: "\u0939\u0943\u0926\u092f \u0915\u093e \u091b\u094b\u0930",
    description: "\u0939\u0943\u0926\u092f \u0915\u093e \u0928\u0941\u0915\u0940\u0932\u093e \u0928\u093f\u091a\u0932\u093e \u092d\u093e\u0917, \u091c\u094b \u092e\u0941\u0916\u094d\u092f \u0930\u0942\u092a \u0938\u0947 \u092c\u093e\u092f\u0947\u0901 \u0928\u093f\u0932\u092f \u0938\u0947 \u092c\u0928\u0924\u093e \u0939\u0948\u0964",
    question: "\u092e\u093e\u0928\u0935 \u0936\u0930\u0940\u0930 \u092e\u0947\u0902 \u0939\u0943\u0926\u092f \u0915\u093e \u0905\u0917\u094d\u0930\u092d\u093e\u0917 \u0915\u093f\u0938 \u0926\u093f\u0936\u093e \u0915\u0940 \u0913\u0930 \u0939\u094b\u0924\u093e \u0939\u0948?",
    options: ["\u092c\u093e\u0908\u0902 \u0913\u0930", "\u0926\u093e\u0908\u0902 \u0913\u0930"],
    correctAnswer: "\u092c\u093e\u0908\u0902 \u0913\u0930"
  },
  [HINDI_LABEL_MAP_CLEAN.aorta]: {
    category: "\u092c\u093e\u0939\u0930 \u0932\u0947 \u091c\u093e\u0928\u0947 \u0935\u093e\u0932\u0940 \u0927\u092e\u0928\u0940",
    description: "\u092c\u093e\u092f\u0947\u0901 \u0928\u093f\u0932\u092f \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u092a\u0942\u0930\u0947 \u0936\u0930\u0940\u0930 \u092e\u0947\u0902 \u0932\u0947 \u091c\u093e\u0924\u0940 \u0939\u0948\u0964",
    question: "\u092e\u0939\u093e\u0927\u092e\u0928\u0940 \u0915\u093f\u0938 \u092a\u094d\u0930\u0915\u093e\u0930 \u0915\u0947 \u092a\u0930\u093f\u0938\u0902\u091a\u0930\u0923 \u092e\u0947\u0902 \u092d\u093e\u0917 \u0932\u0947\u0924\u0940 \u0939\u0948?",
    options: ["\u0924\u0902\u0924\u094d\u0930\u0940\u092f \u092a\u0930\u093f\u0938\u0902\u091a\u0930\u0923", "\u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f \u092a\u0930\u093f\u0938\u0902\u091a\u0930\u0923"],
    correctAnswer: "\u0924\u0902\u0924\u094d\u0930\u0940\u092f \u092a\u0930\u093f\u0938\u0902\u091a\u0930\u0923"
  },
  [HINDI_LABEL_MAP_CLEAN.pulmonary_artery]: {
    category: "\u092c\u093e\u0939\u0930 \u0932\u0947 \u091c\u093e\u0928\u0947 \u0935\u093e\u0932\u0940 \u0927\u092e\u0928\u0940",
    description: "\u0926\u093e\u0939\u093f\u0928\u0947 \u0928\u093f\u0932\u092f \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u092b\u0947\u092b\u0921\u094b\u0902 \u0924\u0915 \u0932\u0947 \u091c\u093e\u0924\u0940 \u0939\u0948\u0964",
    question: "\u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f \u0927\u092e\u0928\u0940 \u0915\u094b \u0905\u092a\u0935\u093e\u0926 \u0915\u094d\u092f\u094b\u0902 \u0915\u0939\u093e \u091c\u093e\u0924\u093e \u0939\u0948?",
    options: ["\u092f\u0939 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0930\u0915\u094d\u0924 \u0932\u0947 \u091c\u093e\u0924\u0940 \u0939\u0948", "\u092f\u0939 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0932\u0947 \u091c\u093e\u0924\u0940 \u0939\u0948"],
    correctAnswer: "\u092f\u0939 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0932\u0947 \u091c\u093e\u0924\u0940 \u0939\u0948"
  },
  [HINDI_LABEL_MAP_CLEAN.right_atrium]: {
    category: "\u0917\u094d\u0930\u0939\u0923 \u0915\u0915\u094d\u0937",
    description: "\u0936\u0930\u0940\u0930 \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0917\u094d\u0930\u0939\u0923 \u0915\u0930\u0924\u093e \u0939\u0948\u0964",
    question: "\u0939\u0943\u0926\u092f \u0915\u0940 \u0927\u0921\u093c\u0915\u0928 \u0915\u094b \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u093f\u0924 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e \u0915\u094c\u0928-\u0938\u093e \u0928\u094b\u0921 \u0926\u093e\u0939\u093f\u0928\u0947 \u0905\u0932\u093f\u0902\u0926 \u092e\u0947\u0902 \u0939\u094b\u0924\u093e \u0939\u0948?",
    options: ["\u0938\u093e\u0907\u0928\u094b\u090f\u091f\u094d\u0930\u093f\u092f\u0932 \u0928\u094b\u0921", "\u090f\u091f\u094d\u0930\u093f\u092f\u094b\u0935\u0947\u0902\u091f\u094d\u0930\u093f\u0915\u0941\u0932\u0930 \u0928\u094b\u0921"],
    correctAnswer: "\u0938\u093e\u0907\u0928\u094b\u090f\u091f\u094d\u0930\u093f\u092f\u0932 \u0928\u094b\u0921"
  },
  [HINDI_LABEL_MAP_CLEAN.left_atrium]: {
    category: "\u0917\u094d\u0930\u0939\u0923 \u0915\u0915\u094d\u0937",
    description: "\u092b\u0947\u092b\u0921\u094b\u0902 \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0930\u0915\u094d\u0924 \u0917\u094d\u0930\u0939\u0923 \u0915\u0930\u0924\u093e \u0939\u0948\u0964",
    question: "\u092e\u093e\u0928\u0935 \u092e\u0947\u0902 \u092c\u093e\u092f\u0947\u0901 \u0905\u0932\u093f\u0902\u0926 \u092e\u0947\u0902 \u0915\u093f\u0924\u0928\u0940 \u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f \u0936\u093f\u0930\u093e\u090f\u0901 \u0916\u0941\u0932\u0924\u0940 \u0939\u0948\u0902?",
    options: ["\u0926\u094b", "\u091a\u093e\u0930"],
    correctAnswer: "\u091a\u093e\u0930"
  },
  [HINDI_LABEL_MAP_CLEAN.right_ventricle]: {
    category: "\u092a\u0902\u092a \u0915\u0915\u094d\u0937",
    description: "\u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u092b\u0947\u092b\u0921\u094b\u0902 \u0924\u0915 \u092a\u0902\u092a \u0915\u0930\u0924\u093e \u0939\u0948\u0964",
    question: "\u0926\u093e\u0939\u093f\u0928\u0947 \u0928\u093f\u0932\u092f \u0914\u0930 \u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f \u0927\u092e\u0928\u0940 \u0915\u0947 \u092c\u0940\u091a \u0915\u094c\u0928-\u0938\u093e \u0935\u093e\u0932\u094d\u0935 \u0939\u094b\u0924\u093e \u0939\u0948?",
    options: ["\u091f\u094d\u0930\u093e\u0907\u0915\u0938\u094d\u092a\u093f\u0921 \u0935\u093e\u0932\u094d\u0935", "\u092a\u0932\u094d\u092e\u094b\u0928\u0930\u0940 \u0938\u0947\u092e\u0940\u0932\u094d\u092f\u0942\u0928\u0930 \u0935\u093e\u0932\u094d\u0935"],
    correctAnswer: "\u092a\u0932\u094d\u092e\u094b\u0928\u0930\u0940 \u0938\u0947\u092e\u0940\u0932\u094d\u092f\u0942\u0928\u0930 \u0935\u093e\u0932\u094d\u0935"
  },
  [HINDI_LABEL_MAP_CLEAN.left_ventricle]: {
    category: "\u092a\u0902\u092a \u0915\u0915\u094d\u0937",
    description: "\u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u092a\u0942\u0930\u0947 \u0936\u0930\u0940\u0930 \u092e\u0947\u0902 \u092a\u0902\u092a \u0915\u0930\u0924\u093e \u0939\u0948\u0964",
    question: "\u092c\u093e\u092f\u0947\u0901 \u0928\u093f\u0932\u092f \u0914\u0930 \u092e\u0939\u093e\u0927\u092e\u0928\u0940 \u0915\u0947 \u092c\u0940\u091a \u0915\u094c\u0928-\u0938\u093e \u0935\u093e\u0932\u094d\u0935 \u0939\u094b\u0924\u093e \u0939\u0948?",
    options: ["\u092e\u093e\u0907\u091f\u094d\u0930\u0932 \u0935\u093e\u0932\u094d\u0935", "\u090f\u0913\u0930\u094d\u091f\u093f\u0915 \u0938\u0947\u092e\u0940\u0932\u094d\u092f\u0942\u0928\u0930 \u0935\u093e\u0932\u094d\u0935"],
    correctAnswer: "\u090f\u0913\u0930\u094d\u091f\u093f\u0915 \u0938\u0947\u092e\u0940\u0932\u094d\u092f\u0942\u0928\u0930 \u0935\u093e\u0932\u094d\u0935"
  },
  [HINDI_LABEL_MAP_CLEAN.chordae_tendinae]: {
    category: "\u0938\u0939\u093e\u092f\u0915 \u0938\u0902\u0930\u091a\u0928\u093e",
    description: "\u0930\u0947\u0936\u0947\u0926\u093e\u0930 \u0921\u094b\u0930\u093f\u092f\u093e\u0901 \u091c\u094b \u0935\u093e\u0932\u094d\u0935\u094b\u0902 \u0915\u094b \u0938\u0939\u093e\u0930\u093e \u0926\u0947\u0924\u0940 \u0939\u0948\u0902 \u0914\u0930 \u0909\u0928\u094d\u0939\u0947\u0902 \u0909\u0932\u091f\u0928\u0947 \u0938\u0947 \u0930\u094b\u0915\u0924\u0940 \u0939\u0948\u0902\u0964",
    question: "\u0915\u0949\u0930\u094d\u0921\u0947 \u091f\u0947\u0902\u0921\u093f\u0928\u0940 \u0915\u093f\u0938 \u092e\u093e\u0902\u0938\u092a\u0947\u0936\u093f\u092f\u094b\u0902 \u0938\u0947 \u091c\u0941\u0921\u093c\u0940 \u0939\u094b\u0924\u0940 \u0939\u0948\u0902?",
    options: ["\u092a\u0947\u092a\u093f\u0932\u0930\u0940 \u092e\u0938\u0932\u094d\u0938", "\u0915\u093e\u0930\u094d\u0921\u093f\u092f\u0915 \u0938\u0947\u092a\u094d\u091f\u092e"],
    correctAnswer: "\u092a\u0947\u092a\u093f\u0932\u0930\u0940 \u092e\u0938\u0932\u094d\u0938"
  },
  [HINDI_LABEL_MAP_CLEAN.pulmonary_veins]: {
    category: "\u0932\u094c\u091f\u0928\u0947 \u0935\u093e\u0932\u0940 \u0936\u093f\u0930\u093e",
    description: "\u092b\u0947\u092b\u0921\u094b\u0902 \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u0939\u0943\u0926\u092f \u0924\u0915 \u0932\u093e\u0924\u0940 \u0939\u0948\u0964",
    question: "\u092b\u0941\u092b\u094d\u092b\u0941\u0938\u0940\u092f \u0936\u093f\u0930\u093e\u090f\u0901 \u0915\u093f\u0938 \u0915\u0915\u094d\u0937 \u092e\u0947\u0902 \u0916\u0941\u0932\u0924\u0940 \u0939\u0948\u0902?",
    options: ["\u0926\u093e\u0939\u093f\u0928\u093e \u0905\u0932\u093f\u0902\u0926", "\u092c\u093e\u092f\u093e\u0901 \u0905\u0932\u093f\u0902\u0926"],
    correctAnswer: "\u092c\u093e\u092f\u093e\u0901 \u0905\u0932\u093f\u0902\u0926"
  },
  [HINDI_LABEL_MAP_CLEAN.superior_vena_cava]: {
    category: "\u0932\u094c\u091f\u0928\u0947 \u0935\u093e\u0932\u0940 \u0936\u093f\u0930\u093e",
    description: "\u0936\u0930\u0940\u0930 \u0915\u0947 \u090a\u092a\u0930\u0940 \u092d\u093e\u0917 \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u0926\u093e\u0939\u093f\u0928\u0947 \u0905\u0932\u093f\u0902\u0926 \u0924\u0915 \u0932\u093e\u0924\u0940 \u0939\u0948\u0964",
    question: "\u090a\u092a\u0930\u0940 \u092e\u0939\u093e\u0936\u093f\u0930\u093e \u0936\u0930\u0940\u0930 \u0915\u0947 \u0915\u093f\u0938 \u092d\u093e\u0917 \u0938\u0947 \u0930\u0915\u094d\u0924 \u0928\u0939\u0940\u0902 \u0932\u093e\u0924\u0940 \u0939\u0948?",
    options: ["\u0938\u093f\u0930 \u0914\u0930 \u092d\u0941\u091c\u093e\u090f\u0901", "\u0928\u093f\u091a\u0932\u0947 \u0905\u0902\u0917"],
    correctAnswer: "\u0928\u093f\u091a\u0932\u0947 \u0905\u0902\u0917"
  },
  [HINDI_LABEL_MAP_CLEAN.inferior_vena_cava]: {
    category: "\u0932\u094c\u091f\u0928\u0947 \u0935\u093e\u0932\u0940 \u0936\u093f\u0930\u093e",
    description: "\u0936\u0930\u0940\u0930 \u0915\u0947 \u0928\u093f\u091a\u0932\u0947 \u092d\u093e\u0917 \u0938\u0947 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u094b \u0926\u093e\u0939\u093f\u0928\u0947 \u0905\u0932\u093f\u0902\u0926 \u0924\u0915 \u0932\u093e\u0924\u0940 \u0939\u0948\u0964",
    question: "\u0928\u093f\u092e\u094d\u0928 \u092e\u0939\u093e\u0936\u093f\u0930\u093e \u0921\u093e\u092f\u092b\u094d\u0930\u093e\u092e \u0915\u0947 \u0915\u093f\u0938 \u091b\u093f\u0926\u094d\u0930 \u0938\u0947 \u0917\u0941\u091c\u0930\u0924\u0940 \u0939\u0948?",
    options: ["\u0935\u0947\u0928\u093e \u0915\u0948\u0935\u0932 \u0913\u092a\u0928\u093f\u0902\u0917", "\u090f\u0913\u0930\u094d\u091f\u093f\u0915 \u0913\u092a\u0928\u093f\u0902\u0917"],
    correctAnswer: "\u0935\u0947\u0928\u093e \u0915\u0948\u0935\u0932 \u0913\u092a\u0928\u093f\u0902\u0917"
  },
  [HINDI_LABEL_MAP_CLEAN.interventricular_septum]: {
    category: "\u0939\u0943\u0926\u092f \u0915\u0940 \u0926\u0940\u0935\u093e\u0930",
    description: "\u092c\u093e\u092f\u0947\u0901 \u0914\u0930 \u0926\u093e\u0939\u093f\u0928\u0947 \u0928\u093f\u0932\u092f \u0915\u094b \u0905\u0932\u0917 \u0915\u0930\u0924\u0940 \u0939\u0948\u0964",
    question: "\u092f\u0926\u093f \u0905\u0902\u0924\u0930-\u0928\u093f\u0932\u092f\u0940 \u092a\u091f\u094d\u091f\u093f\u0915\u093e \u092e\u0947\u0902 \u0926\u094b\u0937 \u0939\u094b \u0924\u094b \u0915\u094d\u092f\u093e \u0939\u094b\u0917\u093e?",
    options: ["\u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0914\u0930 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u093e \u092e\u093f\u0936\u094d\u0930\u0923", "\u092a\u0930\u093f\u0938\u0902\u091a\u0930\u0923 \u092a\u0930 \u0915\u094b\u0908 \u092a\u094d\u0930\u092d\u093e\u0935 \u0928\u0939\u0940\u0902"],
    correctAnswer: "\u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u092f\u0941\u0915\u094d\u0924 \u0914\u0930 \u0911\u0915\u094d\u0938\u0940\u091c\u0928-\u0930\u0939\u093f\u0924 \u0930\u0915\u094d\u0924 \u0915\u093e \u092e\u093f\u0936\u094d\u0930\u0923"
  }
};

const HINDI_UI_TEXT = {
  neutralMessage: "\u0909\u0924\u094d\u0924\u0930 \u091a\u0941\u0928\u0915\u0930 \u0905\u092a\u0928\u0940 \u0938\u092e\u091d \u091c\u093e\u0901\u091a\u0947\u0902\u0964",
  correctPrefix: "\u0938\u0939\u0940!",
  wrongPrefix: "\u0917\u0932\u0924\u0964",
  wrongMiddle: "\u0938\u0939\u0940 \u091c\u0935\u093e\u092c",
  wrongSuffix: "\u0939\u0948\u0964",
  correctSuffix: "\u0938\u0939\u0940 \u091c\u0935\u093e\u092c \u0939\u0948\u0964",
  fallbackCategory: "\u0939\u0943\u0926\u092f \u0915\u0940 \u0938\u0902\u0930\u091a\u0928\u093e",
  fallbackDescription: "\u0907\u0938 \u0939\u0943\u0926\u092f \u0938\u0902\u0930\u091a\u0928\u093e \u0915\u094b \u0926\u0947\u0916\u0947\u0902 \u0914\u0930 \u0907\u0938\u0915\u0947 \u0915\u093e\u0930\u094d\u092f \u0915\u094b \u0938\u092e\u091d\u0947\u0902\u0964",
  fallbackQuestion: "\u0907\u0938 \u0939\u0943\u0926\u092f \u0938\u0902\u0930\u091a\u0928\u093e \u0938\u0947 \u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u092e\u0947\u0932 \u0916\u093e\u0928\u0947 \u0935\u093e\u0932\u093e \u0915\u0925\u0928 \u0915\u094c\u0928-\u0938\u093e \u0939\u0948?",
  fallbackOptions: ["\u0935\u093f\u0915\u0932\u094d\u092a A", "\u0935\u093f\u0915\u0932\u094d\u092a B"],
  fallbackCorrectAnswer: "\u0935\u093f\u0915\u0932\u094d\u092a A",
};

const PUNJABI_UI_TEXT = {
  neutralMessage: "\u0a09\u0a71\u0a24\u0a30 \u0a1a\u0a41\u0a23 \u0a15\u0a47 \u0a06\u0a2a\u0a23\u0a40 \u0a38\u0a2e\u0a1d \u0a1c\u0a3e\u0a02\u0a1a\u0a4b\u0964",
  correctPrefix: "\u0a38\u0a39\u0a40!",
  wrongPrefix: "\u0a17\u0a32\u0a24\u0964",
  wrongMiddle: "\u0a38\u0a39\u0a40 \u0a1c\u0a35\u0a3e\u0a2c",
  wrongSuffix: "\u0a39\u0a48\u0964",
  correctSuffix: "\u0a38\u0a39\u0a40 \u0a1c\u0a35\u0a3e\u0a2c \u0a39\u0a48\u0964",
  fallbackCategory: "\u0a26\u0a3f\u0a32 \u0a26\u0a40 \u0a38\u0a70\u0a30\u0a1a\u0a28\u0a3e",
  fallbackDescription: "\u0a07\u0a38 \u0a26\u0a3f\u0a32 \u0a26\u0a40 \u0a38\u0a70\u0a30\u0a1a\u0a28\u0a3e \u0a28\u0a42\u0a70 \u0a26\u0a47\u0a16\u0a4b \u0a05\u0a24\u0a47 \u0a07\u0a38 \u0a26\u0a47 \u0a15\u0a3e\u0a30\u0a1c \u0a28\u0a42\u0a70 \u0a38\u0a2e\u0a1d\u0a4b\u0964",
  fallbackQuestion: "\u0a07\u0a38 \u0a26\u0a3f\u0a32 \u0a26\u0a40 \u0a38\u0a70\u0a30\u0a1a\u0a28\u0a3e \u0a32\u0a08 \u0a38\u0a2d \u0a24\u0a4b\u0a02 \u0a20\u0a40\u0a15 \u0a15\u0a25\u0a28 \u0a15\u0a3f\u0a39\u0a5c\u0a3e \u0a39\u0a48?",
  fallbackOptions: ["\u0a35\u0a3f\u0a15\u0a32\u0a2a A", "\u0a35\u0a3f\u0a15\u0a32\u0a2a B"],
  fallbackCorrectAnswer: "\u0a35\u0a3f\u0a15\u0a32\u0a2a A",
};

const NEUTRAL_MESSAGE = "Pick an answer to check your understanding of this label.";
const LANG_STORAGE_KEY = "bloodflow_lang";

const viewer = document.getElementById("viewer");
const canvas = document.getElementById("sceneCanvas");
const heartSafeZone = document.getElementById("heartSafeZone");
const hotspotLayer = document.getElementById("hotspotLayer");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const languageSwitcher = document.getElementById("languageSwitcher");
const labelCard = document.getElementById("labelCard");
const closeCardBtn = document.getElementById("closeCardBtn");
const cardCategory = document.getElementById("cardCategory");
const chamberTitle = document.getElementById("chamberTitle");
const chamberDescription = document.getElementById("chamberDescription");
const quizPrompt = document.getElementById("quizPrompt");
const feedbackBox = document.getElementById("feedbackBox");
const answerButtons = Array.from(document.querySelectorAll(".answer-btn"));
const videoOverlay = document.getElementById("videoOverlay");
const videoOpenButton = document.getElementById("videoOpenButton");
const videoCloseButton = document.getElementById("videoCloseButton");
const heartVideo = document.getElementById("heartVideo");
const videoPlayPauseBtn = document.getElementById("videoPlayPauseBtn");
const videoRewindBtn = document.getElementById("videoRewindBtn");
const videoForwardBtn = document.getElementById("videoForwardBtn");
const videoSpeedButtons = Array.from(document.querySelectorAll(".video-speed-btn"));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
camera.position.set(0, 1.4, 5.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.minDistance = 0.01;
controls.maxDistance = Infinity;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const loader = new GLTFLoader();

scene.add(new THREE.HemisphereLight(0xffffff, 0xd7c5b7, 1.3));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
keyLight.position.set(5, 6, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffdfd1, 0.85);
fillLight.position.set(-4, 3, -3);
scene.add(fillLight);

let currentLang = getInitialLanguage();
let currentModelRoot = null;
let currentCardData = null;
let pointerDown = null;
let labelEntries = [];
let currentViewOffsetX = 0;
let targetViewOffsetX = 0;
const CAMERA_CHANGE_TOLERANCE = 0.0005;
const HEART_SAFE_ZONE_RATIO = 0.72;
const controlStartPosition = new THREE.Vector3();
const controlStartTarget = new THREE.Vector3();
let controlInteractionMoved = false;

window.addEventListener("error", (event) => {
  showOverlay(`App error: ${event?.error?.message || event.message || "Unknown error"}`);
});

window.addEventListener("unhandledrejection", (event) => {
  showOverlay(`App error: ${event?.reason?.message || String(event.reason || "Unknown async error")}`);
});

init();
animate();

function init() {
  bindUi();
  resizeRenderer();
  resetQuizState();
  setLanguage(currentLang, { persist: false, updateUrl: true });
  window.addEventListener("resize", resizeRenderer);
}

function bindUi() {
  languageSwitcher.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest(".lang-btn");
    if (!button) return;
    setLanguage(button.dataset.lang || "en");
  });

  closeCardBtn.addEventListener("click", hideCard);

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAnswerState(button.dataset.answer || "low");
    });
  });

  videoOpenButton.addEventListener("click", showVideoOverlay);
  videoCloseButton.addEventListener("click", hideVideoOverlay);

  videoPlayPauseBtn.addEventListener("click", () => {
    if (heartVideo.paused) {
      heartVideo.play().catch(() => {});
    } else {
      heartVideo.pause();
    }
  });

  videoRewindBtn.addEventListener("click", () => {
    seekVideoBy(-10);
  });

  videoForwardBtn.addEventListener("click", () => {
    seekVideoBy(10);
  });

  videoSpeedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const rate = Number(button.dataset.rate || "1");
      if (Number.isFinite(rate)) {
        heartVideo.playbackRate = rate;
      }
      videoSpeedButtons.forEach((entry) => entry.classList.toggle("is-active", entry === button));
    });
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (moved > 6) return;

    const hit = pickLabelEntry(event.clientX, event.clientY);
    if (hit) {
      showCard(hit.labelKey);
      setStatus(`Selected: ${hit.label}`);
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    const hit = pickLabelEntry(event.clientX, event.clientY);
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
  });

  controls.addEventListener("start", () => {
    controlStartPosition.copy(camera.position);
    controlStartTarget.copy(controls.target);
    controlInteractionMoved = false;
  });

  controls.addEventListener("change", () => {
    if (controlInteractionMoved) return;

    const positionDelta = camera.position.distanceToSquared(controlStartPosition);
    const targetDelta = controls.target.distanceToSquared(controlStartTarget);
    controlInteractionMoved = positionDelta > CAMERA_CHANGE_TOLERANCE || targetDelta > CAMERA_CHANGE_TOLERANCE;
  });

  controls.addEventListener("end", () => {
    if (!controlInteractionMoved) return;
    updateHeartSafeZoneState();
  });
}

function getInitialLanguage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang && ASSETS[urlLang]) return urlLang;

  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && ASSETS[saved]) return saved;
  } catch (_) {
    return "en";
  }

  return "en";
}

function setLanguage(lang, { persist = true, updateUrl = true } = {}) {
  if (!ASSETS[lang]) return;

  currentLang = lang;
  document.documentElement.lang = ASSETS[lang].htmlLang;
  updateLanguageButtons(lang);
  setVideoSource(ASSETS[lang].videoUrl);

  if (persist) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (_) {}
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);
  }

  loadModel(ASSETS[lang].modelUrl);
}

function updateLanguageButtons(lang) {
  Array.from(languageSwitcher.querySelectorAll(".lang-btn")).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

function setVideoSource(videoUrl) {
  hideVideoOverlay();
  heartVideo.pause();
  heartVideo.src = videoUrl;
  heartVideo.load();
  heartVideo.playbackRate = 1;
  videoSpeedButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.rate === "1");
  });
}

function seekVideoBy(seconds) {
  const currentTime = Number.isFinite(heartVideo.currentTime) ? heartVideo.currentTime : 0;
  let minTime = 0;
  let maxTime = Number.isFinite(heartVideo.duration) && heartVideo.duration > 0
    ? heartVideo.duration
    : Number.POSITIVE_INFINITY;

  if (heartVideo.seekable && heartVideo.seekable.length > 0) {
    minTime = heartVideo.seekable.start(0);
    maxTime = heartVideo.seekable.end(heartVideo.seekable.length - 1);
  }

  const targetTime = Math.max(minTime, Math.min(maxTime, currentTime + seconds));

  try {
    heartVideo.currentTime = targetTime;
  } catch (_) {
    if (typeof heartVideo.fastSeek === "function") {
      heartVideo.fastSeek(targetTime);
    }
  }
}

function loadModel(modelUrl) {
  showOverlay("Loading 3D model...");
  setStatus(`Loading ${currentLang.toUpperCase()} model...`);
  hideCard();
  clearModel();

  loader.load(
    modelUrl,
    (gltf) => {
      currentModelRoot = gltf.scene;
      scene.add(currentModelRoot);
      prepareModel(currentModelRoot);
      setStatus(`Ready: ${labelEntries.length} labels available`);
      hideOverlay();
    },
    (progress) => {
      if (!progress.total) {
        setStatus(`Loading ${currentLang.toUpperCase()} model...`);
        return;
      }
      const percent = Math.round((progress.loaded / progress.total) * 100);
      setStatus(`Loading ${currentLang.toUpperCase()} model... ${percent}%`);
    },
    () => {
      showOverlay(`Failed to load model: ${modelUrl}`);
      setStatus("Model failed to load");
    }
  );
}

function prepareModel(root) {
  root.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
  });

  fitCameraToObject(root);
  rebuildHotspots(root);
  resizeRenderer();
}

function clearModel() {
  hotspotLayer.innerHTML = "";
  labelEntries = [];

  if (!currentModelRoot) return;

  scene.remove(currentModelRoot);
  currentModelRoot.traverse((object) => {
    if (!object.isMesh) return;
    if (object.geometry) object.geometry.dispose();
    disposeMaterial(object.material);
  });
  currentModelRoot = null;
}

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  Object.values(material).forEach((value) => {
    if (value && value.isTexture) value.dispose();
  });
  material.dispose();
}

function rebuildHotspots(root) {
  hotspotLayer.innerHTML = "";
  labelEntries = LABEL_NAMES
    .map((name) => {
      const object = findNamedObject(root, name);
      if (!object) return null;
      const labelText = getDisplayLabel(name);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "label-hotspot";
      button.setAttribute("aria-label", `Open ${labelText}`);
      button.dataset.label = labelText;
      button.addEventListener("click", () => {
        showCard(name);
      });
      hotspotLayer.appendChild(button);

      return {
        label: labelText,
        labelKey: name,
        object,
        button,
      };
    })
    .filter(Boolean);

  updateHotspots();
}

function findNamedObject(root, name) {
  const candidateNames = new Set([
    normalizeName(name),
    normalizeName(HINDI_LABEL_MAP_CLEAN[name]),
    normalizeName(LABEL_MAP_PUNJABI[name]),
  ]);

  let match = null;
  root.traverse((object) => {
    if (match) return;
    if (candidateNames.has(normalizeName(object.name))) match = object;
  });
  return match;
}

function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const distance = (maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)))) * 1.2;

  camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.15, distance));
  camera.near = 0.001;
  camera.far = Math.max(5000, distance * 1000);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.minDistance = 0.001;
  controls.maxDistance = Infinity;
  controls.update();
}

function resizeRenderer() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  if (!width || !height) return;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  syncHeartSafeZone(width);
  updateHeartSafeZoneState();
  applyCameraViewOffset(width, height, currentViewOffsetX);
  updateHotspots();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateHeartSafeZoneLayout();
  updateHotspots();
  renderer.render(scene, camera);
}

function updateHotspots() {
  if (currentModelRoot) currentModelRoot.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  const width = viewer.clientWidth;
  const height = viewer.clientHeight;

  labelEntries.forEach((entry) => {
    const screenBox = getProjectedScreenBox(entry.object, width, height);
    const visible = Boolean(screenBox);

    if (!visible) {
      entry.button.style.display = "none";
      return;
    }

    const labelText = entry.button.dataset.label || entry.label;
    const estimatedTextWidth = labelText.length * 10 + 28;
    const projectedWidth = Math.max(estimatedTextWidth, screenBox.width + 20);
    const projectedHeight = Math.max(34, screenBox.height + 14);

    entry.button.style.display = "";
    entry.button.style.left = `${screenBox.centerX}px`;
    entry.button.style.top = `${screenBox.centerY}px`;
    entry.button.style.width = `${projectedWidth}px`;
    entry.button.style.height = `${projectedHeight}px`;
    entry.button.classList.toggle("is-active", currentCardData?.key === entry.labelKey);
  });
}

function getProjectedScreenBox(object, width, height) {
  object.updateWorldMatrix(true, true);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasVisiblePoint = false;
  const worldPoint = new THREE.Vector3();

  object.traverse((node) => {
    if (!node.geometry) return;

    const position = node.geometry.getAttribute?.("position");
    if (!position || position.count === 0) return;

    const step = Math.max(1, Math.ceil(position.count / 120));
    for (let index = 0; index < position.count; index += step) {
      worldPoint.fromBufferAttribute(position, index).applyMatrix4(node.matrixWorld);
      const projected = worldPoint.clone().project(camera);
      if (projected.z < -1 || projected.z > 1) continue;

      hasVisiblePoint = true;
      const screenX = ((projected.x + 1) * 0.5) * width;
      const screenY = ((-projected.y + 1) * 0.5) * height;
      minX = Math.min(minX, screenX);
      minY = Math.min(minY, screenY);
      maxX = Math.max(maxX, screenX);
      maxY = Math.max(maxY, screenY);
    }
  });

  if (!hasVisiblePoint) {
    const fallbackBox = new THREE.Box3().setFromObject(object);
    if (fallbackBox.isEmpty()) return null;

    const corners = [
      new THREE.Vector3(fallbackBox.min.x, fallbackBox.min.y, fallbackBox.min.z),
      new THREE.Vector3(fallbackBox.min.x, fallbackBox.min.y, fallbackBox.max.z),
      new THREE.Vector3(fallbackBox.min.x, fallbackBox.max.y, fallbackBox.min.z),
      new THREE.Vector3(fallbackBox.min.x, fallbackBox.max.y, fallbackBox.max.z),
      new THREE.Vector3(fallbackBox.max.x, fallbackBox.min.y, fallbackBox.min.z),
      new THREE.Vector3(fallbackBox.max.x, fallbackBox.min.y, fallbackBox.max.z),
      new THREE.Vector3(fallbackBox.max.x, fallbackBox.max.y, fallbackBox.min.z),
      new THREE.Vector3(fallbackBox.max.x, fallbackBox.max.y, fallbackBox.max.z),
    ];

    corners.forEach((corner) => {
      const projected = corner.project(camera);
      if (projected.z < -1 || projected.z > 1) return;

      hasVisiblePoint = true;
      const screenX = ((projected.x + 1) * 0.5) * width;
      const screenY = ((-projected.y + 1) * 0.5) * height;
      minX = Math.min(minX, screenX);
      minY = Math.min(minY, screenY);
      maxX = Math.max(maxX, screenX);
      maxY = Math.max(maxY, screenY);
    });
  }

  if (!hasVisiblePoint) return null;

  return {
    centerX: (minX + maxX) * 0.5,
    centerY: (minY + maxY) * 0.5,
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function getWorldCenter(object) {
  const box = new THREE.Box3().setFromObject(object);
  return box.getCenter(new THREE.Vector3());
}

function pickLabelEntry(clientX, clientY) {
  if (!labelEntries.length) return null;

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(labelEntries.map((entry) => entry.object), true);
  if (!hits.length) return null;

  let current = hits[0].object;
  while (current) {
    const entry = labelEntries.find((candidate) => candidate.object.uuid === current.uuid);
    if (entry) return entry;
    current = current.parent;
  }

  return null;
}

function showCard(labelKey) {
  const wasHidden = labelCard.classList.contains("is-hidden");
  const content = getLabelContent(labelKey);
  currentCardData = { ...content, key: labelKey };
  cardCategory.textContent = content.category;
  chamberTitle.textContent = content.title;
  chamberDescription.textContent = content.description;
  quizPrompt.innerHTML = `<span aria-hidden="true">&#9889;</span> ${content.question}`;

  answerButtons.forEach((button, index) => {
    const option = content.options[index];
    button.dataset.answer = option || "";
    button.style.display = option ? "" : "none";

    const labelSpan = button.querySelector("span:last-child");
    if (labelSpan) {
      labelSpan.textContent = option || "";
    } else {
      button.textContent = option || "";
    }
  });

  labelCard.classList.remove("is-hidden");
  resetQuizState();
  if (wasHidden) {
    updateHeartSafeZoneState();
  }
  updateHotspots();
}

function hideCard() {
  labelCard.classList.add("is-hidden");
  currentCardData = null;
  resetQuizState();
  updateHeartSafeZoneState();
  updateHotspots();
}

function getLabelContent(labelKey) {
  const normalized = normalizeName(labelKey);
  const isHindi = currentLang === "hi";
  const isPunjabi = currentLang === "pa";
  const mappedHindiKey = HINDI_LABEL_MAP_CLEAN[normalized];
  const mappedPunjabiKey = LABEL_MAP_PUNJABI[normalized];
  const localizedUiText = isHindi ? HINDI_UI_TEXT : isPunjabi ? PUNJABI_UI_TEXT : null;
  const content = isHindi
    ? LABEL_CONTENT_HINDI_CLEAN[mappedHindiKey]
    : isPunjabi
      ? LABEL_CONTENT_PUNJABI[mappedPunjabiKey]
      : LABEL_CONTENT[normalized];

  return {
    category: content?.category || localizedUiText?.fallbackCategory || "Heart Structure",
    description: content?.description || localizedUiText?.fallbackDescription || "Explore this heart structure and identify its function.",
    question: content?.question || localizedUiText?.fallbackQuestion || "Which statement best matches this heart structure?",
    options: content?.options || localizedUiText?.fallbackOptions || ["Option A", "Option B"],
    correctAnswer: content?.correctAnswer || localizedUiText?.fallbackCorrectAnswer || "Option A",
    title: getDisplayLabel(normalized),
  };
}

function resetQuizState() {
  answerButtons.forEach((button) => {
    button.classList.remove("is-correct", "is-wrong", "is-reveal-correct");
    button.setAttribute("aria-pressed", "false");
  });
  feedbackBox.textContent = currentLang === "hi"
    ? HINDI_UI_TEXT.neutralMessage
    : currentLang === "pa"
      ? PUNJABI_UI_TEXT.neutralMessage
      : NEUTRAL_MESSAGE;
  feedbackBox.classList.remove("is-success", "is-error");
  feedbackBox.classList.add("is-neutral");
}

function setAnswerState(answer) {
  if (!currentCardData) return;

  const isCorrect = answer === currentCardData.correctAnswer;

  answerButtons.forEach((button) => {
    const isSelected = button.dataset.answer === answer;
    const isActualCorrect = button.dataset.answer === currentCardData.correctAnswer;
    button.classList.remove("is-correct", "is-wrong", "is-reveal-correct");
    button.setAttribute("aria-pressed", String(isSelected));

    if (isSelected) {
      button.classList.add(isCorrect ? "is-correct" : "is-wrong");
      return;
    }

    if (!isCorrect && isActualCorrect) {
      button.classList.add("is-reveal-correct");
    }
  });

  feedbackBox.classList.remove("is-neutral", "is-success", "is-error");
  feedbackBox.classList.add(isCorrect ? "is-success" : "is-error");
  if (currentLang === "hi") {
    feedbackBox.textContent = isCorrect
      ? `${HINDI_UI_TEXT.correctPrefix} ${currentCardData.correctAnswer} ${HINDI_UI_TEXT.correctSuffix}`
      : `${HINDI_UI_TEXT.wrongPrefix} ${HINDI_UI_TEXT.wrongMiddle} ${currentCardData.correctAnswer} ${HINDI_UI_TEXT.wrongSuffix}`;
    return;
  }

  if (currentLang === "pa") {
    feedbackBox.textContent = isCorrect
      ? `${PUNJABI_UI_TEXT.correctPrefix} ${currentCardData.correctAnswer} ${PUNJABI_UI_TEXT.correctSuffix}`
      : `${PUNJABI_UI_TEXT.wrongPrefix} ${PUNJABI_UI_TEXT.wrongMiddle} ${currentCardData.correctAnswer} ${PUNJABI_UI_TEXT.wrongSuffix}`;
    return;
  }

  feedbackBox.textContent = isCorrect
    ? `Correct! ${currentCardData.correctAnswer} is the right answer.`
    : `Incorrect. The correct answer is ${currentCardData.correctAnswer}.`;
}

function showOverlay(text) {
  overlayText.textContent = text;
  overlay.classList.remove("is-hidden");
}

function hideOverlay() {
  overlay.classList.add("is-hidden");
}

function setStatus(text) {
  return text;
}

function showVideoOverlay() {
  videoOverlay.classList.remove("is-hidden");
  videoOverlay.setAttribute("aria-hidden", "false");
  heartVideo.play().catch(() => {});
}

function hideVideoOverlay() {
  videoOverlay.classList.add("is-hidden");
  videoOverlay.setAttribute("aria-hidden", "true");
  heartVideo.pause();
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\.\d+$/, "")
    .replace(/\s+/g, "_")
    .trim();
}

function prettifyLabelName(name) {
  return String(name || "")
    .replace(/_/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function getDisplayLabel(name) {
  const normalized = normalizeName(name);

  if (currentLang === "hi") {
    return String(HINDI_LABEL_MAP_CLEAN[normalized] || normalized).replace(/_/g, " ");
  }

  if (currentLang === "pa") {
    return String(LABEL_MAP_PUNJABI[normalized] || normalized).replace(/_/g, " ");
  }

  return prettifyLabelName(normalized);
}

function isHeartSafeZoneActive() {
  return Boolean(currentCardData) && viewer.clientWidth > 700;
}

function updateHeartSafeZoneState() {
  const isActive = isHeartSafeZoneActive();
  heartSafeZone.classList.toggle("is-active", isActive);

  if (!isActive) {
    targetViewOffsetX = 0;
    return;
  }

  const width = viewer.clientWidth;
  if (!width || !currentModelRoot) {
    targetViewOffsetX = 0;
    return;
  }

  const safeZoneWidth = width * HEART_SAFE_ZONE_RATIO;
  const reservedWidth = Math.max(width - safeZoneWidth, (labelCard.offsetWidth || width / 3) + 20);
  const cardWidth = labelCard.offsetWidth || width / 3;
  const maxOffset = Math.max(0, safeZoneWidth - cardWidth - 28);
  const desiredOffset = reservedWidth * 0.44;
  targetViewOffsetX = THREE.MathUtils.clamp(desiredOffset, 0, maxOffset);
}

function updateHeartSafeZoneLayout() {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;
  if (!width || !height) return;

  syncHeartSafeZone(width);

  const nextOffset = THREE.MathUtils.lerp(currentViewOffsetX, targetViewOffsetX, 0.12);
  currentViewOffsetX = Math.abs(nextOffset - targetViewOffsetX) < 0.35 ? targetViewOffsetX : nextOffset;
  applyCameraViewOffset(width, height, currentViewOffsetX);
}

function syncHeartSafeZone(width) {
  heartSafeZone.style.width = `${Math.round(width * HEART_SAFE_ZONE_RATIO)}px`;
}

function applyCameraViewOffset(width, height, offsetX) {
  const roundedOffset = Math.round(offsetX);

  if (Math.abs(roundedOffset) < 1) {
    if (camera.view !== null) {
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    currentViewOffsetX = 0;
    return;
  }

  camera.setViewOffset(width, height, roundedOffset, 0, width, height);
  camera.updateProjectionMatrix();
}
