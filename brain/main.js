import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";


const LABELS = [
  "Cerebrum",
  "CorpusCallosum",
  "Thalamus",
  "Hypothalamus",
  "Pons",
  "Midbrain",
  "Medulla",
  "Cerebellum",
  "CerebralAqueduct",
];
const LABEL_TEXT = {
  en: {
    Cerebrum: "Cerebrum",
    CorpusCallosum: "Corpus Callosum",
    Thalamus: "Thalamus",
    Hypothalamus: "Hypothalamus",
    Pons: "Pons",
    Midbrain: "Midbrain",
    Medulla: "Medulla",
    Cerebellum: "Cerebellum",
    CerebralAqueduct: "Cerebral Aqueduct",
  },
  hi: {
    Cerebrum: "प्रमस्तिष्क",
    CorpusCallosum: "कार्पस केलोसम",
    Thalamus: "थेलेमस",
    Hypothalamus: "हाइपोथेलेमस",
    Pons: "पोंस",
    Midbrain: "मध्य मस्तिष्क",
    Medulla: "मेड्यूला",
    Cerebellum: "अनुमस्तिष्क",
    CerebralAqueduct: "प्रमस्तिष्क तरल नलिका",
  },
  pa: {
    Cerebrum: "ਸੈਰੀਬਰਮ",
    CorpusCallosum: "ਕੌਰਪਸ ਕੈਲੋਸਮ",
    Thalamus: "ਥੈਲਾਮਸ",
    Hypothalamus: "ਹਾਇਪੋਥੈਲਾਮਸ",
    Pons: "ਪੌਂਸ",
    Midbrain: "ਵਿਚਕਾਰਲਾ ਦਿਮਾਗ",
    Medulla: "ਮੇੈਡੁੂਲਾ",
    Cerebellum: "ਸੇਰੀਬੈਲਮ",
    CerebralAqueduct: "ਸੇਰੀਬਰਲ ਐਕਵੀਡਕਟ",
  },
};
const LABEL_MAP_HINDI_BRAIN = {
  cerebrum: "प्रमस्तिष्क",
  cerebral_hemisphere: "सेरेब्रल_हेमिस्फीयर",
  corpus_callosum: "कॉर्पस_कैलोसुम",
  thalamus: "थेलेमस",
  hypothalamus: "हाइपोथेलेमस",
  midbrain: "मध्य_मस्तिष्क",
  pons: "पोंस",
  cerebellum: "अनुमस्तिष्क",
  medulla: "मेड्यूला",
  cerebral_aqueduct: "प्रमस्तिष्क_नलिका"
};
const LABEL_MAP_PUNJABI_BRAIN = {
  cerebrum: "ਸੈਰੀਬਰਮ",
  cerebral_hemisphere: "ਸੇਰੇਬਰਲ ਹੇਮਿਸਫੇਅਰ",
  corpus_callosum: "ਕੋਰਪਸ ਕੈਲੋਸਮ",
  thalamus: "ਥੈਲਾਮਸ",
  hypothalamus: "ਹਾਇਪੋਥੈਲਾਮਸ",
  midbrain: "ਮਿਡਬ੍ਰੇਨ",
  pons: "ਪੌਂਸ",
  cerebellum: "ਸੇਰੇਬੈਲਮ",
  medulla: "ਮੇੈਡੁੂਲਾ",
  cerebral_aqueduct: "ਸੇਰੇਬਰਲ ਐਕਵੇਡਕਟ"
};
const LABEL_CONTENT_BRAIN = {

  cerebrum: {
    category: "Forebrain",
    description: "Largest part of brain responsible for thinking, memory and voluntary actions.",
    question: "Which lobe of cerebrum is mainly responsible for vision?",
    options: ["Occipital lobe", "Frontal lobe"],
    correctAnswer: "Occipital lobe"
  },

  cerebral_hemisphere: {
    category: "Brain Division",
    description: "Brain is divided into two hemispheres connected by nerve fibres.",
    question: "Which hemisphere controls the right side of the body?",
    options: ["Left hemisphere", "Right hemisphere"],
    correctAnswer: "Left hemisphere"
  },

  corpus_callosum: {
    category: "Connecting Structure",
    description: "A large bundle of myelinated nerve fibres that connects the two cerebral hemispheres.",
    question: "Damage to the corpus callosum would primarily affect:",
    options: ["Coordination between two hemispheres","Balance and posture"],
    correctAnswer: "Coordination between two hemispheres"
  },

  thalamus: {
    category: "Relay Center",
    description: "Relays sensory impulses to cerebrum.",
    question: "Which type of signals does thalamus NOT relay?",
    options: ["Olfactory signals", "Visual signals"],
    correctAnswer: "Olfactory signals"
  },

  hypothalamus: {
    category: "Regulatory Center",
    description: "Maintains homeostasis like temperature and hunger.",
    question: "Which gland is directly controlled by hypothalamus?",
    options: ["Pituitary gland", "Thyroid gland"],
    correctAnswer: "Pituitary gland"
  },

  midbrain: {
    category: "Brainstem",
    description: "Controls reflex movements of eyes and head.",
    question: "Midbrain is part of which larger structure?",
    options: ["Brainstem", "Forebrain"],
    correctAnswer: "Brainstem"
  },

  pons: {
    category: "Brainstem",
    description: "Acts as bridge between different parts of brain.",
    question: "Pons is a part of which brain region?",
    options: ["Hindbrain", "Forebrain"],
    correctAnswer: "Hindbrain"
  },

  cerebellum: {
    category: "Hindbrain",
    description: "Maintains posture and balance of the body.",
    question: "Damage to cerebellum affects:",
    options: ["Coordination", "Vision"],
    correctAnswer: "Coordination"
  },

  medulla: {
    category: "Vital Center",
    description: "Controls involuntary activities like heartbeat and breathing.",
    question: "Which action is controlled by medulla?",
    options: ["Swallowing", "Thinking"],
    correctAnswer: "Swallowing"
  },

  cerebral_aqueduct: {
    category: "Fluid Channel",
    description: "Connects third and fourth ventricles of brain.",
    question: "Cerebral aqueduct carries:",
    options: ["Cerebrospinal fluid", "Blood"],
    correctAnswer: "Cerebrospinal fluid"
  }
};
const LABEL_CONTENT_HINDI_BRAIN = {

  प्रमस्तिष्क: {
    category: "अग्र मस्तिष्क",
    description: "मस्तिष्क का सबसे बड़ा भाग, जो सोच, स्मृति और स्वैच्छिक क्रियाओं को नियंत्रित करता है।",
    question: "दृष्टि के लिए जिम्मेदार लोब कौन-सा है?",
    options: ["ऑक्सिपिटल लोब", "फ्रंटल लोब"],
    correctAnswer: "ऑक्सिपिटल लोब"
  },

  सेरेब्रल_हेमिस्फीयर: {
    category: "मस्तिष्क विभाजन",
    description: "मस्तिष्क दो गोलार्द्धों में विभाजित होता है।",
    question: "दाएं शरीर भाग को कौन-सा गोलार्द्ध नियंत्रित करता है?",
    options: ["बायां", "दायां"],
    correctAnswer: "बायां"
  },

  कॉर्पस_कैलोसुम: {
    category: "संयोजी संरचना",
    description: "दोनों गोलार्द्धों को जोड़ने वाली तंत्रिका तंतुओं की पट्टी।",
    question: "कॉर्पस कॉलोसम के क्षतिग्रस्त होने पर मुख्य रूप से क्या प्रभावित होगा?",
    options: ["दोनों गोलार्द्धों के बीच समन्वय","संतुलन और शरीर की मुद्रा"],
    correctAnswer: "दोनों गोलार्द्धों के बीच समन्वय"
  },

  थेलेमस: {
    category: "रिले केंद्र",
    description: "संवेदी आवेगों को प्रमस्तिष्क तक भेजता है।",
    question: "कौन-सा संकेत थेलेमस से नहीं गुजरता?",
    options: ["घ्राण", "दृश्य"],
    correctAnswer: "घ्राण"
  },

  हाइपोथेलेमस: {
    category: "नियामक केंद्र",
    description: "तापमान, भूख आदि का नियंत्रण करता है।",
    question: "यह किस ग्रंथि को नियंत्रित करता है?",
    options: ["पिट्यूटरी", "थायरॉयड"],
    correctAnswer: "पिट्यूटरी"
  },

  मध्य_मस्तिष्क: {
    category: "मस्तिष्क तना",
    description: "नेत्र और सिर के प्रतिवर्तों को नियंत्रित करता है।",
    question: "यह किसका भाग है?",
    options: ["हिंदब्रेन", "फोरब्रेन"],
    correctAnswer: "हिंदब्रेन"
  },

  पोंस: {
    category: "मस्तिष्क तना",
    description: "मस्तिष्क के भागों को जोड़ता है।",
    question: "पोंस मस्तिष्क के किस भाग का हिस्सा है?",
    options: ["श्वसन", "स्मृति"],
    correctAnswer: "श्वसन"
  },

  अनुमस्तिष्क: {
    category: "पश्च मस्तिष्क",
    description: "संतुलन और समन्वय बनाए रखता है।",
    question: "क्षति होने पर क्या प्रभावित होगा?",
    options: ["समन्वय", "दृष्टि"],
    correctAnswer: "समन्वय"
  },

  मेड्यूला: {
    category: "महत्वपूर्ण केंद्र",
    description: "हृदय गति और श्वसन को नियंत्रित करता है।",
    question: "कौन-सी क्रिया नियंत्रित होती है?",
    options: ["निगलना", "सोचना"],
    correctAnswer: "निगलना"
  },

  प्रमस्तिष्क_नलिका: {
    category: "द्रव मार्ग",
    description: "तीसरे और चौथे वेंट्रिकल को जोड़ती है।",
    question: "यह क्या वहन करती है?",
    options: ["CSF", "रक्त"],
    correctAnswer: "CSF"
  }
};
const LABEL_CONTENT_PUNJABI_BRAIN = {

  ਸੈਰੀਬਰਮ: {
    category: "ਅੱਗਲਾ ਦਿਮਾਗ",
    description: "ਦਿਮਾਗ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਹਿੱਸਾ ਜੋ ਸੋਚ, ਯਾਦ ਅਤੇ ਇੱਛਾਕਾਰੀ ਕਿਰਿਆਵਾਂ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਦਾ ਹੈ।",
    question: "ਦ੍ਰਿਸ਼ਟੀ ਲਈ ਕਿਹੜਾ ਲੋਬ ਜ਼ਿੰਮੇਵਾਰ ਹੈ?",
    options: ["ਆਕਸੀਪਿਟਲ ਲੋਬ", "ਫਰੰਟਲ ਲੋਬ"],
    correctAnswer: "ਆਕਸੀਪਿਟਲ ਲੋਬ"
  },

  "ਸੇਰੇਬਰਲ ਹੇਮਿਸਫੇਅਰ": {
    category: "ਦਿਮਾਗ ਵੰਡ",
    description: "ਦਿਮਾਗ ਦੋ ਹਿੱਸਿਆਂ ਵਿੱਚ ਵੰਡਿਆ ਹੁੰਦਾ ਹੈ।",
    question: "ਸੱਜੇ ਸਰੀਰ ਨੂੰ ਕਿਹੜਾ ਹਿੱਸਾ ਕੰਟਰੋਲ ਕਰਦਾ ਹੈ?",
    options: ["ਖੱਬਾ", "ਸੱਜਾ"],
    correctAnswer: "ਖੱਬਾ"
  },

  "ਕੋਰਪਸ ਕੈਲੋਸਮ": {
    category: "ਜੋੜਨ ਵਾਲੀ ਸੰਰਚਨਾ",
    description: "ਦੋਵੇਂ ਹਿੱਸਿਆਂ ਨੂੰ ਜੋੜਦਾ ਹੈ।",
    question: "ਕਾਰਪਸ ਕੈਲੋਸਮ ਨੂੰ ਨੁਕਸਾਨ ਪਹੁੰਚਣ ਨਾਲ ਮੁੱਖ ਤੌਰ ਤੇ ਕੀ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗਾ?",
    options: ["ਦੋਵੇਂ ਗੋਲਾਰਧਾਂ ਵਿਚਕਾਰ ਸਮਨਵਯ", "ਸੰਤੁਲਨ ਅਤੇ ਸਰੀਰ ਦੀ ਅਵਸਥਾ"],
    correctAnswer:"ਦੋਵੇਂ ਗੋਲਾਰਧਾਂ ਵਿਚਕਾਰ ਸਮਨਵਯ"
  },

  ਥੈਲਾਮਸ: {
    category: "ਰਿਲੇ ਕੇਂਦਰ",
    description: "ਸੈਂਸਰੀ ਸੰਕੇਤਾਂ ਨੂੰ ਸੇਰੇਬ੍ਰਮ ਤੱਕ ਭੇਜਦਾ ਹੈ।",
    question: "ਕਿਹੜਾ ਸੰਕੇਤ ਇੱਥੋਂ ਨਹੀਂ ਲੰਘਦਾ?",
    options: ["ਸੁੱਗੰਧ", "ਦ੍ਰਿਸ਼ਟੀ"],
    correctAnswer: "ਸੁੱਗੰਧ"
  },

  ਹਾਇਪੋਥੈਲਾਮਸ: {
    category: "ਨਿਯੰਤਰਣ ਕੇਂਦਰ",
    description: "ਤਾਪਮਾਨ ਅਤੇ ਭੁੱਖ ਨੂੰ ਕੰਟਰੋਲ ਕਰਦਾ ਹੈ।",
    question: "ਇਹ ਕਿਹੜੀ ਗ੍ਰੰਥੀ ਨੂੰ ਕੰਟਰੋਲ ਕਰਦਾ ਹੈ?",
    options: ["ਪਿਟਿਊਟਰੀ", "ਥਾਇਰਾਇਡ"],
    correctAnswer: "ਪਿਟਿਊਟਰੀ"
  },

  ਮਿਡਬ੍ਰੇਨ: {
    category: "ਬ੍ਰੇਨਸਟੇਮ",
    description: "ਅੱਖਾਂ ਅਤੇ ਸਿਰ ਦੇ ਰਿਫਲੈਕਸ ਨੂੰ ਕੰਟਰੋਲ ਕਰਦਾ ਹੈ।",
    question: "ਇਹ ਕਿਸ ਦਾ ਹਿੱਸਾ ਹੈ?",
    options: ["ਬ੍ਰੇਨਸਟੇਮ", "ਫੋਰਬ੍ਰੇਨ"],
    correctAnswer: "ਬ੍ਰੇਨਸਟੇਮ"
  },

  ਪੌਂਸ: {
    category: "ਬ੍ਰੇਨਸਟੇਮ",
    description: "ਦਿਮਾਗ ਦੇ ਭਾਗਾਂ ਵਿਚਕਾਰ ਪੁਲ ਵਾਂਗ ਕੰਮ ਕਰਦਾ ਹੈ।",
    question: "ਪੌਂਸ ਦਿਮਾਗ ਦੇ ਕਿਹੜੇ ਭਾਗ ਦਾ ਹਿੱਸਾ ਹੈ?",
    options: ["ਹਾਈਂਡਬ੍ਰੇਨ", "ਫੋਰਬ੍ਰੇਨ"],
    correctAnswer:"ਹਾਈਂਡਬ੍ਰੇਨ"
  },

  ਸੇਰੇਬੈਲਮ: {
    category: "ਹਾਈਂਡਬ੍ਰੇਨ",
    description: "ਸੰਤੁਲਨ ਅਤੇ ਕੋਆਰਡੀਨੇਸ਼ਨ ਬਣਾਈ ਰੱਖਦਾ ਹੈ।",
    question: "ਨੁਕਸਾਨ ਨਾਲ ਕੀ ਪ੍ਰਭਾਵਿਤ ਹੁੰਦਾ ਹੈ?",
    options: ["ਕੋਆਰਡੀਨੇਸ਼ਨ", "ਦ੍ਰਿਸ਼ਟੀ"],
    correctAnswer: "ਕੋਆਰਡੀਨੇਸ਼ਨ"
  },

  ਮੇੈਡੁੂਲਾ: {
    category: "ਮਹੱਤਵਪੂਰਨ ਕੇਂਦਰ",
    description: "ਹਿਰਦੇ ਦੀ ਧੜਕਨ ਅਤੇ ਸਾਹ ਲੈਣ ਨੂੰ ਕੰਟਰੋਲ ਕਰਦਾ ਹੈ।",
    question: "ਕਿਹੜੀ ਕਿਰਿਆ ਕੰਟਰੋਲ ਹੁੰਦੀ ਹੈ?",
    options: ["ਨਿਗਲਣਾ", "ਸੋਚਣਾ"],
    correctAnswer: "ਨਿਗਲਣਾ"
  },

  "ਸੇਰੇਬਰਲ ਐਕਵੇਡਕਟ": {
    category: "ਦ੍ਰਵ ਮਾਰਗ",
    description: "ਤੀਜੇ ਅਤੇ ਚੌਥੇ ਵੈਂਟ੍ਰਿਕਲ ਨੂੰ ਜੋੜਦਾ ਹੈ।",
    question: "ਇਹ ਕੀ ਲੈ ਜਾਂਦਾ ਹੈ?",
    options: ["CSF", "ਰਕਤ"],
    correctAnswer: "CSF"
  }
};
const LANGUAGE_CONFIG = {
  en: {
    htmlLang: "en",
    modelUrl: new URL("./Brain.glb", import.meta.url).href,
    buttonLabel: "English",
    title: "Sagital section of the human brain",
    hint: "Click a labeled component (or a label row) to toggle highlight + offset.",
    resetButton: "Reset All",
    explodeLabel: "Explode",
    loadingText: "Loading English model...",
    loadFailed: "Failed to load English model",
  },
  hi: {
    htmlLang: "hi",
    modelUrl: new URL("./Brain1.glb", import.meta.url).href,
    buttonLabel: "हिंदी",
    title: "मानव मस्तिष्क का सेजीटल काट",
    hint: "हाइलाइट और अलग करने के लिए किसी लेबल या भाग पर क्लिक करें।",
    resetButton: "रीसेट करें",
    explodeLabel: "अलग करें",
    loadingText: "हिंदी मॉडल लोड हो रहा है...",
    loadFailed: "हिंदी मॉडल लोड नहीं हुआ",  
  },
  pa: {
    htmlLang: "pa",
    modelUrl: new URL("./Brain2.glb", import.meta.url).href,
    buttonLabel: "ਪੰਜਾਬੀ",
    title: "ਮਨੁੱਖੀ ਦਿਮਾਗ ਦਾ ਕਾਟ ਚਿੱਤਰ",
    hint: "ਹਾਈਲਾਈਟ ਅਤੇ ਵੱਖ ਕਰਨ ਲਈ ਕਿਸੇ ਲੇਬਲ ਜਾਂ ਹਿੱਸੇ ਉੱਤੇ ਕਲਿਕ ਕਰੋ।",
    resetButton: "ਰੀਸੈਟ ਕਰੋ",
    explodeLabel: "ਵੱਖ ਕਰੋ",
    loadingText: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    loadFailed: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਨਹੀਂ ਹੋਇਆ",
  },
};

const PLACARD_UI = {
  en: {
    badge: "Brain Parts",
    defaultTitle: "Select a label to explore",
    defaultTopic: "Interactive learning",
    defaultDescription: "Click a brain label to reveal its role, description and a quick quiz.",
    defaultQuestion: "Tap a label to load a quiz.",
    defaultFeedback: "Choose the best answer to see instant feedback.",
    quizTitle: "Quick Quiz",
    feedback: {
      correct: "Correct! Great work - this is the right answer.",
      incorrect: "Not yet - try the other choice.",
    },
  },
  hi: {
    badge: "\u092e\u0938\u094d\u0924\u093f\u0937\u094d\u0915 \u0915\u0947 \u092d\u093e\u0917",
    defaultTitle: "\u0915\u093f\u0938\u0940 \u0932\u0947\u092c\u0932 \u0915\u094b \u091a\u0941\u0928\u0915\u0930 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0926\u0947\u0916\u0947\u0902",
    defaultTopic: "\u0907\u0902\u091f\u0930\u090f\u0915\u094d\u091f\u093f\u0935 \u0932\u0930\u094d\u0928\u093f\u0902\u0917",
    defaultDescription: "\u0915\u093f\u0938\u0940 \u092d\u0940 \u092e\u0938\u094d\u0924\u093f\u0937\u094d\u0915 \u0932\u0947\u092c\u0932 \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0909\u0938\u0915\u093e \u0915\u093e\u0930\u094d\u092f, \u0935\u093f\u0935\u0930\u0923 \u0914\u0930 \u091b\u094b\u091f\u093e \u0915\u094d\u0935\u093f\u091c\u093c \u0926\u0947\u0916\u0947\u0902\u0964",
    defaultQuestion: "\u0915\u094d\u0935\u093f\u091c\u093c \u0932\u094b\u0921 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u093f\u0938\u0940 \u0932\u0947\u092c\u0932 \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902\u0964",
    defaultFeedback: "\u0924\u0941\u0930\u0902\u0924 \u092b\u0940\u0921\u092c\u0948\u0915 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0939\u0940 \u0909\u0924\u094d\u0924\u0930 \u091a\u0941\u0928\u0947\u0902\u0964",
    quizTitle: "\u0924\u094d\u0935\u0930\u093f\u0924 \u0915\u094d\u0935\u093f\u091c\u093c",
    feedback: {
      correct: "\u0938\u0939\u0940! \u0906\u092a\u0928\u0947 \u092c\u093f\u0932\u0915\u0941\u0932 \u0938\u0939\u0940 \u091c\u0935\u093e\u092c \u091a\u0941\u0928\u093e\u0964",
      incorrect: "\u0905\u092d\u0940 \u0928\u0939\u0940\u0902 - \u0926\u0942\u0938\u0930\u093e \u0935\u093f\u0915\u0932\u094d\u092a \u0906\u091c\u092e\u093e\u090f\u0902\u0964",
    },
  },
  pa: {
    badge: "\u0a26\u0a3f\u0a2e\u0a3e\u0a17 \u0a26\u0a47 \u0a2d\u0a3e\u0a17",
    defaultTitle: "\u0a15\u0a3f\u0a38\u0a47 \u0a32\u0a47\u0a2c\u0a32 \u0a28\u0a42\u0a70 \u0a1a\u0a41\u0a23 \u0a15\u0a47 \u0a1c\u0a3e\u0a23\u0a15\u0a3e\u0a30\u0a40 \u0a26\u0a47\u0a16\u0a4b",
    defaultTopic: "\u0a07\u0a70\u0a1f\u0a30\u0a10\u0a15\u0a1f\u0a3f\u0a35 \u0a32\u0a30\u0a28\u0a3f\u0a70\u0a17",
    defaultDescription: "\u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a40 \u0a26\u0a3f\u0a2e\u0a3e\u0a17 \u0a32\u0a47\u0a2c\u0a32 \u0a09\u0a71\u0a24\u0a47 \u0a15\u0a32\u0a3f\u0a15 \u0a15\u0a30\u0a4b \u0a05\u0a24\u0a47 \u0a09\u0a38 \u0a26\u0a3e \u0a15\u0a70\u0a2e, \u0a35\u0a47\u0a30\u0a35\u0a3e \u0a05\u0a24\u0a47 \u0a1b\u0a4b\u0a1f\u0a3e \u0a15\u0a41\u0a07\u0a1c\u0a3c \u0a26\u0a47\u0a16\u0a4b\u0964",
    defaultQuestion: "\u0a15\u0a41\u0a07\u0a1c\u0a3c \u0a32\u0a4b\u0a21 \u0a15\u0a30\u0a28 \u0a32\u0a08 \u0a15\u0a3f\u0a38\u0a47 \u0a32\u0a47\u0a2c\u0a32 \u0a09\u0a71\u0a24\u0a47 \u0a15\u0a32\u0a3f\u0a15 \u0a15\u0a30\u0a4b\u0964",
    defaultFeedback: "\u0a24\u0a41\u0a30\u0a70\u0a24 \u0a2b\u0a40\u0a21\u0a2c\u0a48\u0a15 \u0a26\u0a47\u0a16\u0a23 \u0a32\u0a08 \u0a38\u0a39\u0a40 \u0a1c\u0a35\u0a3e\u0a2c \u0a1a\u0a41\u0a23\u0a4b\u0964",
    quizTitle: "\u0a1b\u0a4b\u0a1f\u0a3e \u0a15\u0a41\u0a07\u0a1c\u0a3c",
    feedback: {
      correct: "\u0a38\u0a39\u0a40! \u0a24\u0a41\u0a38\u0a40\u0a02 \u0a20\u0a40\u0a15 \u0a1c\u0a35\u0a3e\u0a2c \u0a1a\u0a41\u0a23\u0a3f\u0a06\u0964",
      incorrect: "\u0a39\u0a41\u0a23 \u0a39\u0a3e\u0a32\u0a47 \u0a28\u0a39\u0a40\u0a02 - \u0a26\u0a42\u0a1c\u0a3e \u0a35\u0a3f\u0a15\u0a32\u0a2a \u0a05\u0a1c\u0a3c\u0a2e\u0a3e\u0a13\u0964",
    },
  },
};

const CONTENT_KEY_BY_LABEL = {
  Cerebrum: "cerebrum",
  CorpusCallosum: "corpus_callosum",
  Thalamus: "thalamus",
  Hypothalamus: "hypothalamus",
  Pons: "pons",
  Midbrain: "midbrain",
  Medulla: "medulla",
  Cerebellum: "cerebellum",
  CerebralAqueduct: "cerebral_aqueduct",
};

const LOCALIZED_CONTENT_MAPS = {
  en: LABEL_CONTENT_BRAIN,
  hi: LABEL_CONTENT_HINDI_BRAIN,
  pa: LABEL_CONTENT_PUNJABI_BRAIN,
};

const LOCALIZED_CONTENT_LABEL_KEYS = {
  hi: LABEL_MAP_HINDI_BRAIN,
  pa: LABEL_MAP_PUNJABI_BRAIN,
};


const PANEL_ON_TEXT = "on";
const PANEL_OFF_TEXT = "off";
const PANEL_MISSING_TEXT = "not found in GLB";
const PANEL_RESET_TEXT = "reset";
const PANEL_PANEL_TEXT = "panel";
const PANEL_MODEL_TEXT = "model";
const PANEL_NOT_NCERT_TEXT = "not part of NCERT syllabus";
const PLACEHOLDER_TEXT = "_";

const canvas = document.querySelector("#c");
const viewerEl = document.querySelector(".viewer");
const resetBtn = document.querySelector("#resetBtn");
const labelsEl = document.querySelector("#labels");
const lastClickEl = document.querySelector("#lastClick");
const explodeFactorEl = document.querySelector("#explodeFactor");
const explodeFactorValEl = document.querySelector("#explodeFactorVal");
const pageTitleEl = document.querySelector("#pageTitle");
const pageHintEl = document.querySelector("#pageHint");
const explodeLabelEl = document.querySelector("#explodeLabel");
const languageButtons = Array.from(document.querySelectorAll(".langBtn"));
const placardBadgeEl = document.querySelector("#placardBadge");
const placardTitleEl = document.querySelector("#placardTitle");
const placardTopicEl = document.querySelector("#placardTopic");
const placardDescriptionEl = document.querySelector("#placardDescription");
const placardQuizTitleEl = document.querySelector("#placardQuizTitle");
const placardQuestionEl = document.querySelector("#placardQuestion");
const placardOptionsEl = document.querySelector("#placardOptions");
const placardFeedbackEl = document.querySelector("#placardFeedback");
const placardOverlayEl = document.querySelector("#placardOverlay");
const placardCloseBtn = document.querySelector("#placardCloseBtn");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = null;

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
camera.position.set(0.9, 0.5, 1.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.1, 0);

const transform = new TransformControls(camera, renderer.domElement);
transform.setMode("translate");
transform.enabled = false;
scene.add(transform);
transform.addEventListener("dragging-changed", (ev) => {
  controls.enabled = !ev.value;
});

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(2, 3, 1);
scene.add(dir);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = "labelOverlay";
viewerEl.appendChild(labelRenderer.domElement);

const highlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd84d,
  emissive: 0xffc200,
  emissiveIntensity: 0.9,
  roughness: 0.25,
  metalness: 0.0,
});
const nonNcertHighlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xbcbcbc,
  emissive: 0xff9f43,
  emissiveIntensity: 0.48,
  roughness: 0.35,
  metalness: 0.0,
});

const HIGHLIGHT_COLORS = [
  0xff6b6b,
  0xffd84d,
  0x38761d,
  0x4faff7,
  0xb56bff,
  0xff8fd8,
  0x7cfc00,
  0xffa24d,
  0x4d7dff,
 
];
const highlightMaterials = new Map(); // label -> MeshStandardMaterial
function highlightMaterialForLabel(label) {
  if (highlightMaterials.has(label)) return highlightMaterials.get(label);
  const idx = Math.max(0, LABELS.indexOf(label));
  const color = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.0,
  });
  highlightMaterials.set(label, mat);
  return mat;
}

function hexCssColor(hex) {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

function colorHexForLabel(label) {
  const idx = LABELS.indexOf(label);
  if (idx < 0) return 0xffd84d;
  return HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
}

let highlightOrderCounter = 0;
const meshBaseMaterialByUuid = new Map(); // mesh.uuid -> original material (first seen)
const meshHighlightsByUuid = new Map(); // mesh.uuid -> Map(ownerUuid -> { material, order })

function applyMeshHighlight(mesh) {
  const ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap || ownerMap.size === 0) {
    const base = meshBaseMaterialByUuid.get(mesh.uuid);
    if (base) mesh.material = base;
    return;
  }

  let best = null;
  for (const v of ownerMap.values()) {
    if (!best || v.order > best.order) best = v;
  }
  if (best) mesh.material = best.material;
}

function setMeshHighlight(mesh, ownerUuid, materialOrNull) {
  if (!meshBaseMaterialByUuid.has(mesh.uuid)) meshBaseMaterialByUuid.set(mesh.uuid, mesh.material);

  let ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap) {
    ownerMap = new Map();
    meshHighlightsByUuid.set(mesh.uuid, ownerMap);
  }

  if (materialOrNull) {
    ownerMap.set(ownerUuid, { material: materialOrNull, order: ++highlightOrderCounter });
  } else {
    ownerMap.delete(ownerUuid);
    if (ownerMap.size === 0) meshHighlightsByUuid.delete(mesh.uuid);
  }

  applyMeshHighlight(mesh);
}

function clearAllMeshHighlights() {
  if (gltfRoot) {
    gltfRoot.traverse((o) => {
      if (!o.isMesh) return;
      const base = meshBaseMaterialByUuid.get(o.uuid);
      if (base) o.material = base;
    });
  }
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
}

function normalizeName(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const labelNorms = LABELS.map(normalizeName);
const labelSet = new Set(labelNorms);
const COMPONENT_LABEL_ALIASES = [
  { match: "cerebrum", label: "Cerebrum" },
  { match: "corpuscallosum", label: "CorpusCallosum" },
  { match: "hypothalamus", label: "Hypothalamus" },
  { match: "mamillarybody", label: "Hypothalamus" },
  { match: "opticchiasm", label: "Hypothalamus" },
  { match: "optictract", label: "Hypothalamus" },
  { match: "lateralgeniculatebody", label: "Thalamus" },
  { match: "medialgeniculatebody", label: "Thalamus" },
  { match: "thalamus", label: "Thalamus" },
  { match: "midbrain", label: "Midbrain" },
  { match: "superiorcolliculus", label: "Midbrain" },
  { match: "inferiorcolliculus", label: "Midbrain" },
  { match: "interpeduncularfossa", label: "Midbrain" },
  { match: "cerebralaqueduct", label: "CerebralAqueduct" },
  { match: "aqueductofmidbrain", label: "CerebralAqueduct" },
  { match: "pons", label: "Pons" },
  { match: "medullaoblongata", label: "Medulla" },
  { match: "medulla", label: "Medulla" },
  { match: "cerebellum", label: "Cerebellum" },
];
const PRIMARY_TARGET_MATCHES = {
  CorpusCallosum: ["corpuscallosum"],
  Thalamus: ["thalamus"],
  Hypothalamus: ["hypothalamus"],
  Pons: ["pons"],
  Midbrain: ["midbrain"],
  Medulla: ["medullaoblongata", "medulla"],
  Cerebellum: ["cerebellum"],
  CerebralAqueduct: ["cerebralaqueduct", "aqueductofmidbrain"],
};

let currentLanguage = "en";
let gltfRoot = null;
let brainCenterWorld = new THREE.Vector3();
let lastSelected = null; // Object3D currently attached to TransformControls
let loadRequestId = 0;
let activePlacardLabel = null;
const labelHitboxes = [];
let activeLabelBox = null;
const activeLabelUI = new Map(); // label -> CSS2DObject


const componentState = new Map();
// root.uuid -> { exploded:boolean, origPos:Vector3, origQuat:Quaternion, origScale:Vector3, origMatrix:Matrix4, origMAU:boolean, meshMats: Map(mesh.uuid, originalMaterial|originalMaterial[]) }
const selectedRoots = new Set(); // Set<Object3D.uuid>
const selectedObjectsByUuid = new Map(); // uuid -> Object3D (for lastSelected switching)
const labelBadgeByLabel = new Map(); // label -> CSS2DObject

function getLanguageConfig(language = currentLanguage) {
  return LANGUAGE_CONFIG[language] ?? LANGUAGE_CONFIG.en;
}

function getPlacardUi(language = currentLanguage) {
  return PLACARD_UI[language] ?? PLACARD_UI.en;
}

function labelTextForLanguage(label, language = currentLanguage) {
  return LABEL_TEXT[language]?.[label] ?? LABEL_TEXT.en[label] ?? label;
}

function contentKeyForLabel(label) {
  return CONTENT_KEY_BY_LABEL[label] ?? null;
}

function localizedLabelContent(label, language = currentLanguage) {
  const contentKey = contentKeyForLabel(label);
  if (!contentKey) return null;

  if (language === "en") {
    return LOCALIZED_CONTENT_MAPS.en?.[contentKey] ?? null;
  }

  const localizedKey = LOCALIZED_CONTENT_LABEL_KEYS[language]?.[contentKey];
  return LOCALIZED_CONTENT_MAPS[language]?.[localizedKey] ?? LOCALIZED_CONTENT_MAPS.en?.[contentKey] ?? null;
}

function isNcertLabel(label) {
  return Boolean(label && LABELS.includes(label));
}

function panelText(label, state) {
  return `${label} (${state})`;
}

function setPlacardFeedback(message, status) {
  placardFeedbackEl.textContent = message;
  placardFeedbackEl.classList.toggle("correct", status === "correct");
  placardFeedbackEl.classList.toggle("incorrect", status === "incorrect");
}

function resetPlacardOptionStates() {
  placardOptionsEl.querySelectorAll(".placard-option").forEach((optionEl) => {
    optionEl.classList.remove("is-selected", "is-correct", "is-incorrect", "is-dimmed");
  });
}

function updatePlacard(label = null) {
  const ui = getPlacardUi();
  const content = label ? localizedLabelContent(label) : null;

  activePlacardLabel = label;
  placardBadgeEl.textContent = ui.badge;
  placardQuizTitleEl.textContent = ui.quizTitle;
  placardTitleEl.textContent = label ? labelTextForLanguage(label) : ui.defaultTitle;
  placardTopicEl.textContent = content?.category ?? ui.defaultTopic;
  placardDescriptionEl.textContent = content?.description ?? ui.defaultDescription;

  if (!content) {
    placardQuestionEl.textContent = ui.defaultQuestion;
    placardOptionsEl.innerHTML = "";
    setPlacardFeedback(ui.defaultFeedback, null);
    return;
  }

  placardQuestionEl.textContent = content.question;
  placardOptionsEl.innerHTML = content.options
    .map(
      (option) =>
        `<div class="placard-option"><button type="button" data-answer="${option}">${option}</button></div>`
    )
    .join("");
  resetPlacardOptionStates();
  setPlacardFeedback(ui.defaultFeedback, null);
}

function openPlacardOverlay(label) {
  updatePlacard(label);
  placardOverlayEl.classList.remove("hidden");
}

function closePlacardOverlay() {
  placardOverlayEl.classList.add("hidden");
  activePlacardLabel = null;
}

function getProjectedScreenBox(
  roots,
  {
    width = canvas.clientWidth,
    height = canvas.clientHeight,
    offsetX = 0,
    offsetY = 0,
  } = {}
) {
  const rootList = Array.isArray(roots) ? roots : [roots];
  const worldPoint = new THREE.Vector3();
  const projected = new THREE.Vector3();
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasVisiblePoint = false;

  function addProjectedPoint(point) {
    projected.copy(point).project(camera);
    if (projected.z < -1 || projected.z > 1) return;

    hasVisiblePoint = true;
    const screenX = ((projected.x + 1) * 0.5) * width + offsetX;
    const screenY = ((-projected.y + 1) * 0.5) * height + offsetY;
    minX = Math.min(minX, screenX);
    minY = Math.min(minY, screenY);
    maxX = Math.max(maxX, screenX);
    maxY = Math.max(maxY, screenY);
  }

  rootList.forEach((root) => {
    root.updateWorldMatrix(true, true);
    root.traverse((node) => {
      const positionAttr = node.geometry?.getAttribute?.("position");
      if (!positionAttr || positionAttr.count === 0) return;
      const step = Math.max(1, Math.ceil(positionAttr.count / 100));
      for (let index = 0; index < positionAttr.count; index += step) {
        worldPoint.fromBufferAttribute(positionAttr, index).applyMatrix4(node.matrixWorld);
        addProjectedPoint(worldPoint);
      }
    });
  });

  if (!hasVisiblePoint) {
    const fallbackBox = new THREE.Box3();
    rootList.forEach((root) => fallbackBox.expandByObject(root));
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

    corners.forEach(addProjectedPoint);
    if (!hasVisiblePoint) return null;
  }

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}
function rebuildHotspotLayer() {
  if (!hotspotLayerEl) return;
  hotspotLayerEl.innerHTML = "";
  hotspotButtons = [];

  for (const label of labels) {
    const roots = label.hotspotRoots?.length ? label.hotspotRoots : [];
    if (roots.length === 0) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "label-hotspot";
    button.dataset.labelKey = label.key;
    button.setAttribute("aria-label", `Select ${getLabelName(label.key)}`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (selected.has(label.key)) {
        deselectLabel(label.key);
        closePlacardOverlay();
      } else {
        selectLabel(label.key);
        openPlacardOverlay(label.key);
      }
    });
    hotspotLayerEl.appendChild(button);
    hotspotButtons.push({ button, roots, labelKey: label.key });
  }
  updateHotspots();
}

function updateHotspots() {
  if (!hotspotLayerEl) return;
  const layerRect = hotspotLayerEl.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const canvasWidth = canvasRect.width || canvas.clientWidth;
  const canvasHeight = canvasRect.height || canvas.clientHeight;
  const offsetX = canvasRect.left - layerRect.left;
  const offsetY = canvasRect.top - layerRect.top;

  hotspotButtons.forEach((entry) => {
    const screenBox = getProjectedScreenBox(entry.roots, {
      width: canvasWidth,
      height: canvasHeight,
      offsetX,
      offsetY,
    });
    if (!screenBox) {
      entry.button.style.display = "none";
      return;
    }
    entry.button.style.display = "block";

    const labelText = getLabelName(entry.labelKey);
    const estimatedTextWidth = labelText.length * 10 + 28;
    const projectedWidth = Math.max(estimatedTextWidth, screenBox.width + 24);
    const projectedHeight = Math.max(34, screenBox.height + 16);
    const clampedCenterX = THREE.MathUtils.clamp(
      screenBox.centerX,
      projectedWidth / 2,
      Math.max(projectedWidth / 2, layerRect.width - projectedWidth / 2)
    );
    const clampedCenterY = THREE.MathUtils.clamp(
      screenBox.centerY,
      projectedHeight / 2,
      Math.max(projectedHeight / 2, layerRect.height - projectedHeight / 2)
    );

    entry.button.style.left = `${clampedCenterX}px`;
    entry.button.style.top = `${clampedCenterY}px`;
    entry.button.style.width = `${projectedWidth}px`;
    entry.button.style.height = `${projectedHeight}px`;
    entry.button.classList.toggle("is-active", selected.has(entry.labelKey));
  });
}

function isTextLabelRoot(name) {
  const n = String(name || "").toLowerCase();
  return n.includes("text") || n.includes("label");
}

function selectedLabelForRoot(root) {
  if (!root) return null;
  return labelForComponentRoot(root) || (isCerebrumLikeName(root.name) ? "Cerebrum" : null);
}

function hasSelectedLabel(label) {
  if (!label) return false;
  for (const uuid of selectedRoots) {
    const obj = selectedObjectsByUuid.get(uuid);
    if (selectedLabelForRoot(obj) === label) return true;
  }
  return false;
}

function placardLabelFromSelection(preferredLabel = null) {
  if (preferredLabel && hasSelectedLabel(preferredLabel)) return preferredLabel;
  if (lastSelected) {
    const label = selectedLabelForRoot(lastSelected);
    if (label) return label;
  }
  for (const obj of selectedObjectsByUuid.values()) {
    const label = selectedLabelForRoot(obj);
    if (label) return label;
  }
  return null;
}

function syncPlacardToSelection(preferredLabel = null) {
  const label = placardLabelFromSelection(preferredLabel);
  if (!label) {
    closePlacardOverlay();
    return;
  }
  openPlacardOverlay(label);
}

function handlePlacardChoice(event) {
  const button = event.target.closest("button[data-answer]");
  if (!button || !activePlacardLabel) return;

  const content = localizedLabelContent(activePlacardLabel);
  if (!content) return;

  const ui = getPlacardUi();
  const answer = button.dataset.answer;
  const isCorrect = answer === content.correctAnswer;
  const selectedOptionEl = button.closest(".placard-option");

  resetPlacardOptionStates();
  placardOptionsEl.querySelectorAll(".placard-option").forEach((optionEl) => {
    const optionButton = optionEl.querySelector("button[data-answer]");
    if (!optionButton) return;

    const isCorrectOption = optionButton.dataset.answer === content.correctAnswer;
    if (optionEl === selectedOptionEl) optionEl.classList.add("is-selected");
    if (isCorrectOption) optionEl.classList.add("is-correct");
    if (!isCorrect && optionEl === selectedOptionEl) optionEl.classList.add("is-incorrect");
    if (!isCorrect && optionEl !== selectedOptionEl && !isCorrectOption) optionEl.classList.add("is-dimmed");
  });

  setPlacardFeedback(isCorrect ? ui.feedback.correct : ui.feedback.incorrect, isCorrect ? "correct" : "incorrect");
}

function findByNameRecursive(root, exactName) {
  let found = null;
  root.traverse((o) => {
    if (found) return;
    if (o.name === exactName) found = o;
  });
  return found;
}

function findByUUIDRecursive(root, uuid) {
  let found = null;
  root.traverse((o) => {
    if (found) return;
    if (o.uuid === uuid) found = o;
  });
  return found;
}

function findBestLabelRoot(root, label) {
  const labelNorm = normalizeName(label);
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  root.traverse((o) => {
    if (!o.name) return;
    if (isGlbMarkerName(o.name)) return;

    const n = normalizeName(o.name);
    if (!n) return;

    if (n === labelNorm) {
      const score = 10;
      if (score < bestScore) {
        best = o;
        bestScore = score;
      }
      return;
    }

    if (n.startsWith(labelNorm)) {
      const score = 1 + (n.length - labelNorm.length);
      if (score < bestScore) {
        best = o;
        bestScore = score;
      }
    }
  });

  return best;
}

function computeBrainCenter(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}

function componentRootForHit(obj) {
  let cur = obj;
  while (cur) {
    const n = normalizeName(cur.name);
    for (const labelNorm of labelNorms) {
      if (n === labelNorm || n.startsWith(labelNorm)) return cur;
    }
    if (labelAliasForName(cur.name)) return cur;
    cur = cur.parent;
  }
  return null;
}

function nearestNamedRootForHit(obj) {
  let cur = obj;
  while (cur) {
    const name = cur.name || "";
    if (name && !isGlbMarkerName(name)) return cur;
    cur = cur.parent;
  }
  return null;
}

function canonicalComponentRootFromHit(obj) {
  const hitRoot = componentRootForHit(obj);
  if (!hitRoot || !gltfRoot) return nearestNamedRootForHit(obj) ?? hitRoot;

  const label = labelForComponentRoot(hitRoot);
  if (!label) return hitRoot;
  if (label === "Cerebrum") return hitRoot;

  return targetsForLabel(label)[0] ?? findBestLabelRoot(gltfRoot, label) ?? hitRoot;
}

function labelForComponentRoot(root) {
  const n = normalizeName(root?.name || "");
  if (!n) return null;
  for (const label of LABELS) {
    const ln = normalizeName(label);
    if (n === ln || n.startsWith(ln)) return label;
  }
  return labelAliasForName(root?.name || "");
}

function labelAliasForName(name) {
  const normalized = normalizeName(name);
  if (!normalized) return null;

  let best = null;
  for (const { match, label } of COMPONENT_LABEL_ALIASES) {
    if (!normalized.includes(match)) continue;
    if (!best || match.length > best.match.length) best = { match, label };
  }
  return best?.label ?? null;
}

function displayLabelForName(name) {
  const label = labelAliasForName(name);
  if (label) return label;

  const raw = String(name || "").trim();
  if (!raw) return "Unknown";

  return raw.replace(/\.\d+$/g, "").replace(/\s+/g, " ").trim();
}

function cerebrumTargets(root) {
  const targets = [];
  root.traverse((o) => {
    if (!o.name) return;
    if (isGlbMarkerName(o.name)) return;
    if (isCerebrumLikeName(o.name)) {
      targets.push(o);
    }
  });
  return targets;
}

function isCerebrumLikeName(name) {
  const n = String(name || "").toLowerCase();
  if (!n) return false;
  return (
    n.includes("gyrus") ||
    n.includes("sulcus") ||
    n.includes("lobule") ||
    n.includes("pole") ||
    n.includes("cuneus") ||
    n.includes("precuneus") ||
    n.includes("insula") ||
    n.includes("occipital") ||
    n.includes("temporal") ||
    n.includes("parietal") ||
    n.includes("frontal")
  );
}

function matchesLabelTarget(obj, label) {
  if (!obj?.name || isGlbMarkerName(obj.name)) return false;

  const normalized = normalizeName(obj.name);
  const labelNorm = normalizeName(label);
  if (normalized === labelNorm || normalized.startsWith(labelNorm)) return true;

  return labelAliasForName(obj.name) === label;
}

function collectPrimaryTargets(root, label) {
  const matches = PRIMARY_TARGET_MATCHES[label];
  if (!matches?.length) return [];

  const targets = [];
  const seen = new Set();

  root.traverse((o) => {
    if (!o?.name || isGlbMarkerName(o.name)) return;
    const normalized = normalizeName(o.name);
    if (!normalized) return;
    if (!matches.some((match) => normalized === match || normalized.startsWith(match))) return;
    if (seen.has(o.uuid)) return;
    seen.add(o.uuid);
    targets.push(o);
  });

  targets.sort((a, b) => {
    const aScore = collectMeshes(a).length > 0 ? 1 : 0;
    const bScore = collectMeshes(b).length > 0 ? 1 : 0;
    return bScore - aScore;
  });

  return targets;
}

function collectLabelTargets(root, label) {
  const targets = [];
  const seen = new Set();

  root.traverse((o) => {
    if (!matchesLabelTarget(o, label)) return;
    if (seen.has(o.uuid)) return;
    seen.add(o.uuid);
    targets.push(o);
  });

  targets.sort((a, b) => {
    const aScore = collectMeshes(a).length > 0 ? 1 : 0;
    const bScore = collectMeshes(b).length > 0 ? 1 : 0;
    return bScore - aScore;
  });

  return targets;
}

// function targetsForLabel(label) {
//   if (!gltfRoot) return [];
//   if (label === "Cerebrum") return cerebrumTargets(gltfRoot);
//   const primaryTargets = collectPrimaryTargets(gltfRoot, label);
//   if (primaryTargets.length) return primaryTargets;
//   const targets = collectLabelTargets(gltfRoot, label);
//   return targets.length ? targets : [];
// }
function targetsForLabel(label) {
  if (!gltfRoot) return [];
  if (label === "Cerebrum") return cerebrumTargets(gltfRoot);

  const primaryTargets = collectPrimaryTargets(gltfRoot, label);

  if (primaryTargets.length) {
    return primaryTargets.map(obj => {
      // 🔥 Force mesh-based root if current is bad
      const meshes = collectMeshes(obj);
      return meshes.length ? meshes[0] : obj;
    });
  }

  const targets = collectLabelTargets(gltfRoot, label);

  return targets.map(obj => {
    const meshes = collectMeshes(obj);
    return meshes.length ? meshes[0] : obj;
  });
}

function isEmbeddedLabelTextName(name) {
  const raw = String(name || "").trim();
  if (!raw) return false;

  const normalized = normalizeName(raw);
  if (!normalized) return false;

  if (labelSet.has(normalized) && raw === raw.toLowerCase()) return true;

  for (const labelNorm of labelNorms) {
    if (normalized === `${labelNorm}1` && raw === raw.toLowerCase()) return true;
  }

  return false;
}

function isPassiveMarkerName(name) {
  const s = String(name || "");
  return s.startsWith("Text") || s.startsWith("Cylinder");
}

function isGlbMarkerName(name) {
  const s = String(name || "");
  return isPassiveMarkerName(s) || isEmbeddedLabelTextName(s);
}

function collectMeshes(root) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  return meshes;
}

function collectLabelMeshes(root) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && isEmbeddedLabelTextName(o.name)) {
      meshes.push(o);
    }
  });
  return meshes;
}

function maxDimensionWorld(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  return Math.max(size.x, size.y, size.z);
}

function findLabelMarkerForLabel(label) {
  if (!gltfRoot || !label) return null;

  let found = null;
  gltfRoot.traverse((o) => {
    if (found || !o.isMesh || !isEmbeddedLabelTextName(o.name)) return;
    if (labelAliasForName(o.name) === label) found = o;
  });
  return found;
}

function nearestMarkerLabelForPoint(worldPoint) {
  if (!gltfRoot || !worldPoint) return null;

  let bestLabel = null;
  let bestDistSq = Number.POSITIVE_INFINITY;

  gltfRoot.traverse((o) => {
    if (!o.isMesh || !isEmbeddedLabelTextName(o.name)) return;
    const label = labelAliasForName(o.name);
    if (!label) return;

    const markerWorld = new THREE.Vector3();
    o.getWorldPosition(markerWorld);
    const distSq = markerWorld.distanceToSquared(worldPoint);
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestLabel = label;
    }
  });

  return bestLabel;
}

function labelForMarkerHit(hit) {
  const obj = hit?.object;
  if (!obj) return null;
  if (isEmbeddedLabelTextName(obj.name)) return labelAliasForName(obj.name);
  if (isPassiveMarkerName(obj.name)) return nearestMarkerLabelForPoint(hit.point);
  return null;
}

function makeActiveLabelBadge(label) {
  const el = document.createElement("div");
  el.className = "modelLabelBadge";
  el.textContent = labelTextForLanguage(label);
  return new CSS2DObject(el);
}

function hasSelectedRootForLabel(label, excludeUuid = null) {
  for (const uuid of selectedRoots) {
    if (uuid === excludeUuid) continue;
    const obj = selectedObjectsByUuid.get(uuid);
    if (!obj) continue;
    const resolvedLabel = labelForComponentRoot(obj) || (isCerebrumLikeName(obj.name) ? "Cerebrum" : null);
    if (resolvedLabel === label) return true;
  }
  return false;
}
// Dedicated absolutely-positioned overlay layer for label hitbox divs.
// Lives inside .viewer so it lines up perfectly with the canvas.
const hitboxLayerEl = (() => {
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10;";
  viewerEl.appendChild(el);
  return el;
})();

// label -> { div, marker }  — rebuilt fresh for every model load.
const labelHitboxMeta = new Map();

function createLabelHitboxes() {
  if (!gltfRoot) return;

  LABELS.forEach(label => {
    const marker = findLabelMarkerForLabel(label);
    if (!marker) return;

    const div = document.createElement("div");
    div.className = "label-highlight";
    // Absolutely positioned inside hitboxLayerEl — position & size set each frame.
    div.style.position = "absolute";
    div.style.opacity  = "0";             // invisible until clicked
    div.style.pointerEvents = "auto";
    div.style.cursor   = "pointer";
    div.style.width    = "0";
    div.style.height   = "0";

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = div.dataset.active === "1";
      div.dataset.active = isActive ? "0" : "1";
      div.style.opacity  = isActive ? "0" : "1";
      toggleLabelTargets(label);
    });

    hitboxLayerEl.appendChild(div);
    labelHitboxMeta.set(label, { div, marker });
  });
}

/**
 * Called every animation frame.
 * Projects each marker mesh's screen-space bounding box, finds its centre,
 * then positions the div on that centre using translate(-50%,-50%) —
 * exactly matching the reference getProjectedScreenBox / updateHotspots pattern.
 */
function updateLabelHitboxSizes() {
  if (!gltfRoot) return;

  const canvasRect = canvas.getBoundingClientRect();
  const layerRect  = hitboxLayerEl.getBoundingClientRect();
  const offX = canvasRect.left - layerRect.left;
  const offY = canvasRect.top  - layerRect.top;
  const cw   = canvasRect.width  || canvas.clientWidth;
  const ch   = canvasRect.height || canvas.clientHeight;

  const worldPt   = new THREE.Vector3();
  const projected = new THREE.Vector3();

  for (const [label, { div, marker }] of labelHitboxMeta) {
    const posAttr = marker.geometry?.getAttribute?.("position");
    if (!posAttr || posAttr.count === 0) { div.style.display = "none"; continue; }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let visible = false;

    marker.updateWorldMatrix(true, false);
    // Iterate every vertex (no step-skip) so sparse single-glyph meshes
    // like the "H" anchor in the English Hypothalamus label produce a correct
    // bounding box instead of an undersized one.
    for (let i = 0; i < posAttr.count; i++) {
      worldPt.fromBufferAttribute(posAttr, i).applyMatrix4(marker.matrixWorld);
      projected.copy(worldPt).project(camera);
      if (projected.z < -1 || projected.z > 1) continue;
      visible = true;
      const sx = ((projected.x + 1) * 0.5) * cw + offX;
      const sy = ((-projected.y + 1) * 0.5) * ch + offY;
      if (sx < minX) minX = sx;
      if (sy < minY) minY = sy;
      if (sx > maxX) maxX = sx;
      if (sy > maxY) maxY = sy;
    }

    if (!visible || maxX < minX) { div.style.display = "none"; continue; }

    div.style.display = "";
    const pad = 10;
    const measuredW = maxX - minX;
    const measuredH = maxY - minY;

    // Enforce a minimum size derived from the visible label text so the
    // hitbox always fully encloses the rendered word at any zoom level.
    const labelText = labelTextForLanguage(label);
    const minTextW  = labelText.length * 8 + 24;  // ~8 px per char + padding
    const minTextH  = 20;

    const w = Math.max(minTextW, measuredW + pad * 2);
    const h = Math.max(minTextH, measuredH + pad * 2);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    div.style.left      = `${cx}px`;
    div.style.top       = `${cy}px`;
    div.style.width     = `${w}px`;
    div.style.height    = `${h}px`;
    div.style.transform = "translate(-50%, -50%)";
  }
}

/** Resets all label hitbox divs to their inactive (opacity 0) state. */
function resetLabelHitboxes() {
  for (const [, { div }] of labelHitboxMeta) {
    div.dataset.active = "0";
    div.style.opacity  = "0";
  }
}

/**
 * Syncs every label hitbox div's active/opacity state to match
 * the current selectedRoots set.  Call this after any model-mesh
 * click so the 2-D overlay stays consistent with the 3-D selection.
 */
function syncLabelHitboxesToSelection() {
  for (const [label, { div }] of labelHitboxMeta) {
    const targets = gltfRoot ? targetsForLabel(label) : [];
    const isSelected = targets.some(o => componentState.get(o.uuid)?.exploded);
    div.dataset.active = isSelected ? "1" : "0";
    div.style.opacity  = isSelected ? "1" : "0";
  }
}
function createHighlightLabel(label) {
  const div = document.createElement("div");
  div.className = "label-highlight";
  div.textContent = labelTextForLanguage(label);

  return new CSS2DObject(div);
}
function setLabelBadge(root, label, on) {
  //  DO NOTHING (disable CSS label system)
  return;
}

function setHighlighted(root, on, labelForColor = null) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  const mat = isNcertLabel(labelForColor)
    ? highlightMaterialForLabel(labelForColor)
    : nonNcertHighlightMaterial;

  // Highlight component  
  const meshes = collectMeshes(root);
  for (const mesh of meshes) {
    if (on) setMeshHighlight(mesh, root.uuid, mat);
    else setMeshHighlight(mesh, root.uuid, null);
  }

  // Highlight label separately (stronger glow)
  const labelMeshes = collectLabelMeshes(root);
  for (const mesh of labelMeshes) {
    if (on) setMeshHighlight(mesh, root.uuid, highlightMaterialForLabel(label));
    else setMeshHighlight(mesh, root.uuid, null);
  }
  setLabelBadge(root, labelForColor, on);

  componentState.set(root.uuid, state);
}

function ensureEditableTransform(root, state) {
  if (!root) return;

  // If the node came in with a baked matrix (common in glTF), Three sets matrixAutoUpdate=false.
  // TransformControls (and our explode) manipulates TRS, so switch to TRS mode while preserving pose.
  if (root.matrixAutoUpdate === false) {
    // Preserve the current world/local pose encoded in the matrix.
    root.matrix.decompose(root.position, root.quaternion, root.scale);
    root.matrixAutoUpdate = true;
    root.updateMatrix();
    root.updateMatrixWorld(true);
  }

  // Ensure we can restore exactly later.
  if (state && state.origMAU === undefined) state.origMAU = root.matrixAutoUpdate;
  if (state && !state.origMatrix) state.origMatrix = root.matrix.clone();
}

function restoreOriginalTransform(root, state) {
  if (!root || !state) return;

  if (state.origMAU === false && state.origMatrix) {
    root.matrixAutoUpdate = false;
    root.matrix.copy(state.origMatrix);
    root.matrixWorldNeedsUpdate = true;
    root.updateMatrixWorld(true);
    return;
  }

  if (state.origPos) root.position.copy(state.origPos);
  if (state.origQuat) root.quaternion.copy(state.origQuat);
  if (state.origScale) root.scale.copy(state.origScale);
  root.matrixAutoUpdate = true;
  root.updateMatrix();
  root.updateMatrixWorld(true);
}

function moveOutward(root, factor) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  if (!state.exploded) {
    state.origPos = root.position.clone();
    state.origQuat = root.quaternion.clone();
    state.origScale = root.scale.clone();
    state.origMatrix = root.matrix.clone();
    state.origMAU = root.matrixAutoUpdate;
    ensureEditableTransform(root, state);

    const box = new THREE.Box3().setFromObject(root);
    const rootWorldPos = new THREE.Vector3();
    box.getCenter(rootWorldPos);
    // Direction = from brain centre toward component — always outward by definition.
    const dirWorld = rootWorldPos.clone().sub(brainCenterWorld);

    if (dirWorld.lengthSq() < 1e-10) {
      // Component sits exactly at brain centre — fall back to its absolute position.
      dirWorld.copy(rootWorldPos);
      if (dirWorld.lengthSq() < 1e-10) dirWorld.set(0, 1, 0); // last-resort up
    }

    dirWorld.normalize();

    const dim = maxDimensionWorld(root);
    const dist = Math.max(0.02, dim * factor);

    const targetWorld = rootWorldPos.clone().add(dirWorld.multiplyScalar(dist));
    const targetLocal = targetWorld.clone();
    if (root.parent) root.parent.worldToLocal(targetLocal);

    root.position.copy(targetLocal);
    state.exploded = true;
  } else {
    restoreOriginalTransform(root, state);
    state.exploded = false;
  }

  componentState.set(root.uuid, state);
}

function attachTransformTo(root) {
  if (!root) return;
  const state = componentState.get(root.uuid);
  ensureEditableTransform(root, state);
  lastSelected = root;
  transform.enabled = true;
  transform.attach(root);
}

function detachTransformIfAttached(root) {
  if (!transform.object) return;
  if (!root || transform.object === root) {
    transform.detach();
    transform.enabled = false;
    if (lastSelected === root) lastSelected = null;
  }
}

function selectComponent(root, { label = null } = {}) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  if (state.exploded) return;

  const factor = Number(explodeFactorEl.value);
  const resolvedLabel = label || labelForComponentRoot(root) || (isCerebrumLikeName(root.name) ? "Cerebrum" : null);
  setHighlighted(root, true, resolvedLabel);
  moveOutward(root, factor);
  selectedRoots.add(root.uuid);
  selectedObjectsByUuid.set(root.uuid, root);
  lastSelected = root;
}

function deselectComponent(root, { label = null } = {}) {
  const state = componentState.get(root.uuid);
  if (!state?.exploded) return;

  const factor = Number(explodeFactorEl.value);
  const resolvedLabel = label || labelForComponentRoot(root) || (isCerebrumLikeName(root.name) ? "Cerebrum" : null);
  moveOutward(root, factor);
  setHighlighted(root, false, resolvedLabel);
  detachTransformIfAttached(root);

  selectedRoots.delete(root.uuid);
  selectedObjectsByUuid.delete(root.uuid);
  if (lastSelected === root) {
    lastSelected = selectedObjectsByUuid.values().next().value ?? null;
  }
}

function toggleComponent(root, opts) {
  const state = componentState.get(root.uuid);
  if (state?.exploded) deselectComponent(root, opts);
  else selectComponent(root, opts);
}

function resetAll() {
  if (!gltfRoot) return;
  for (const [uuid, state] of componentState.entries()) {
    const obj = findByUUIDRecursive(gltfRoot, uuid);
    if (!obj) continue;
    const resolvedLabel = labelForComponentRoot(obj) || (isCerebrumLikeName(obj.name) ? "Cerebrum" : null);
    restoreOriginalTransform(obj, state);
    setHighlighted(obj, false, resolvedLabel);
    state.exploded = false;
  }
  clearAllMeshHighlights();
  selectedRoots.clear();
  selectedObjectsByUuid.clear();
  transform.detach();
  transform.enabled = false;
  lastSelected = null;
  closePlacardOverlay();
  resetLabelHitboxes();
}

function resetModelState() {
  selectedRoots.clear();
  selectedObjectsByUuid.clear();
  componentState.clear();
  clearAllMeshHighlights();
  for (const badge of labelBadgeByLabel.values()) {
    if (badge.userData.marker) badge.userData.marker.visible = true;
    badge.parent?.remove(badge);
  }
  labelBadgeByLabel.clear();
  transform.detach();
  transform.enabled = false;
  lastSelected = null;
  closePlacardOverlay();
}

function removeCurrentModel() {
  if (gltfRoot) {
    scene.remove(gltfRoot);
    gltfRoot = null;
  }
  labelHitboxes.length = 0;
  // Remove all hitbox divs from the DOM and clear the map so the next model
  // starts completely fresh — no carried-over active/highlighted state.
  for (const [, { div }] of labelHitboxMeta) {
    div.remove();
  }
  labelHitboxMeta.clear();
  resetModelState();
  brainCenterWorld.set(0, 0, 0);
}

function updateLabelPanel() {
  labelsEl.innerHTML = "";

  for (const label of LABELS) {
    const row = document.createElement("div");
    row.className = "labelRow";
    row.style.cursor = "pointer";

    const left = document.createElement("div");
    left.className = "labelName";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = labelTextForLanguage(label);
    left.appendChild(name);

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = PANEL_OFF_TEXT;

    row.appendChild(left);
    row.appendChild(pill);
    labelsEl.appendChild(row);

    row._brain = { label, pillEl: pill };

    row.addEventListener("click", () => {
      if (!gltfRoot) return;
      toggleLabelTargets(label);
    });
  }
}

function refreshLabelStatuses() {
  const rows = Array.from(labelsEl.children);
  for (const row of rows) {
    const { label, pillEl } = row._brain ?? {};
    if (!label) continue;

    const targets = gltfRoot ? targetsForLabel(label) : [];
    if (!targets.length) {
      pillEl.textContent = PANEL_OFF_TEXT;
      row.classList.remove("active");
      continue;
    }

    const onCount = targets.reduce((acc, o) => acc + (componentState.get(o.uuid)?.exploded ? 1 : 0), 0);
    pillEl.textContent = onCount ? PANEL_ON_TEXT : PANEL_OFF_TEXT;

    const idx = Math.max(0, LABELS.indexOf(label));
    const color = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
    row.style.setProperty("--labelColor", hexCssColor(color));
    row.classList.toggle("active", onCount > 0);
  }
}
function highlightLabel(label) {
  // Visual toggle is handled directly by the CSS2D div's click listener in createLabelHitboxes.
  // This function is kept as a no-op so existing call sites don't break.
}
function toggleLabelTargets(label) {
  const targets = targetsForLabel(label);
  if (!targets.length) {
    lastClickEl.textContent = panelText(labelTextForLanguage(label), PANEL_MISSING_TEXT);
    refreshLabelStatuses();
    return;
  }

  lastClickEl.textContent = panelText(labelTextForLanguage(label), PANEL_PANEL_TEXT);
  for (const obj of targets) {
    if (selectedRoots.has(obj.uuid)) deselectComponent(obj, { label });
    else selectComponent(obj, { label });
  }
  refreshLabelStatuses();
  syncLabelHitboxesToSelection();
  syncPlacardToSelection(label);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
function onPointerDown(ev) {
  if (!gltfRoot) return;
  if (transform.dragging) return;
  if (transform.enabled && transform.axis) return;

  // ✅ Compute mouse position
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);

  // ✅ Raycast
  raycaster.setFromCamera(mouse, camera);

  // ✅ 1. Label hitboxes are now CSS2D DOM elements and handle their own click events.
  //       Skip the old 3D raycaster hitbox check entirely.

  // ✅ 2. Check model ONLY
  const modelHits = raycaster.intersectObject(gltfRoot, true);

  if (!modelHits.length) return;

  const hit = modelHits[0];

  // ✅ Existing marker logic
  const markerLabel = labelForMarkerHit(hit);
  if (markerLabel) {
    toggleLabelTargets(markerLabel);
    syncLabelHitboxesToSelection();
    return;
  }

  // ✅ Component selection logic
  const root = canonicalComponentRootFromHit(hit.object);
  const resolvedLabel = root
    ? labelForComponentRoot(root) || labelAliasForName(hit.object.name)
    : null;

  const displayName = resolvedLabel
    ? labelTextForLanguage(resolvedLabel)
    : root
      ? displayLabelForName(root.name)
      : displayLabelForName(hit.object.name || hit.object.type);

  const hitName = displayLabelForName(hit.object.name || hit.object.type);

  const clickState = isNcertLabel(resolvedLabel)
    ? `${PANEL_MODEL_TEXT}: ${hitName}`
    : PANEL_NOT_NCERT_TEXT;

  lastClickEl.textContent = root
    ? panelText(displayName, clickState)
    : `${hit.object.name || hit.object.type}`;

  if (!root) return;

  if (selectedRoots.has(root.uuid)) {
    deselectComponent(root, { label: resolvedLabel });
  } else {
    selectComponent(root, { label: resolvedLabel });
  }

  refreshLabelStatuses();
  syncLabelHitboxesToSelection();
  syncPlacardToSelection(resolvedLabel);
}

canvas.addEventListener("pointerdown", onPointerDown);
resetBtn.addEventListener("click", () => {
  resetAll();
  refreshLabelStatuses();
  lastClickEl.textContent = PANEL_RESET_TEXT;
});
placardOptionsEl.addEventListener("click", handlePlacardChoice);
placardCloseBtn?.addEventListener("click", closePlacardOverlay);
explodeFactorEl.addEventListener("input", () => {
  explodeFactorValEl.textContent = String(explodeFactorEl.value);
  if (!gltfRoot) return;

  const factor = Number(explodeFactorEl.value);
  for (const uuid of selectedRoots) {
    const obj = findByUUIDRecursive(gltfRoot, uuid);
    const state = obj ? componentState.get(uuid) : null;
    if (!obj || !state?.exploded) continue;

    // Recompute the exploded offset at the new factor without changing selection/highlight.
    restoreOriginalTransform(obj, state);
    state.exploded = false;
    componentState.set(uuid, state);
    moveOutward(obj, factor);
  }
  refreshLabelStatuses();
});

window.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    transform.detach();
    transform.enabled = false;
    lastSelected = null;
    return;
  }

  if (ev.key === "t" || ev.key === "T") {
    if (!lastSelected) return;
    attachTransformTo(lastSelected);
    transform.setMode("translate");
  }
  if (ev.key === "r" || ev.key === "R") {
    if (!lastSelected) return;
    attachTransformTo(lastSelected);
    transform.setMode("rotate");
  }
});

explodeFactorValEl.textContent = String(explodeFactorEl.value);

const loader = new GLTFLoader();

function applyLanguageUI() {
  const config = getLanguageConfig();
  document.documentElement.lang = config.htmlLang;
  document.title = config.title;
  pageTitleEl.textContent = config.title;
  pageHintEl.textContent = config.hint;
  explodeLabelEl.textContent = config.explodeLabel;
  resetBtn.textContent = config.resetButton;

  for (const button of languageButtons) {
    const language = button.dataset.language;
    button.textContent = LANGUAGE_CONFIG[language]?.buttonLabel ?? language;
    button.classList.toggle("active", language === currentLanguage);
  }

  updateLabelPanel();
  refreshLabelStatuses();

  if (!placardOverlayEl.classList.contains("hidden") && activePlacardLabel) {
    updatePlacard(activePlacardLabel);
  }
}

function setControlsDisabled(disabled) {
  resetBtn.disabled = disabled;
  explodeFactorEl.disabled = disabled;
  for (const button of languageButtons) button.disabled = disabled;
}

function loadCurrentLanguageModel() {
  const requestId = ++loadRequestId;
  const config = getLanguageConfig();

  setControlsDisabled(true);
  lastClickEl.textContent = config.loadingText;

  loader.load(
    config.modelUrl,
    (gltf) => {
      if (requestId !== loadRequestId) return;

      removeCurrentModel();
      gltfRoot = gltf.scene;

      gltfRoot.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = false;
          o.receiveShadow = false;
          o.frustumCulled = true;
        }
      });

      scene.add(gltfRoot);

      brainCenterWorld = computeBrainCenter(gltfRoot);
      controls.target.copy(brainCenterWorld);
      controls.update();

      createLabelHitboxes();
      rebuildHotspotLayer();

      // (optional but recommended)
      updateHotspots();


      refreshLabelStatuses();
      lastClickEl.textContent = PLACEHOLDER_TEXT;
      setControlsDisabled(false);
    },
    undefined,
    (err) => {
      if (requestId !== loadRequestId) return;
      console.error(err);
      lastClickEl.textContent = PLACEHOLDER_TEXT;
      setControlsDisabled(false);
    }
  );
}

function switchLanguage(language) {
  if (!LANGUAGE_CONFIG[language] || language === currentLanguage) return;
  // Reset all clicks, highlights and exploded parts before unloading the model.
  resetAll();
  currentLanguage = language;
  applyLanguageUI();
  loadCurrentLanguageModel();
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    switchLanguage(button.dataset.language);
  });
}

applyLanguageUI();
loadCurrentLanguageModel();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // Resize label hitbox divs to match projected marker bounds (zoom-aware)
  updateLabelHitboxSizes();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  const worldPos = new THREE.Vector3();
}

resize();
animate();
