import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const LANGUAGE_CONFIG = {
  en: {
    htmlLang: "en",
    modelUrl: "./neuron.glb",
    buttonLabel: "English",
    title: "Structure of a neuron",
    hint: "Click a model part or a label to toggle highlight. Drag to orbit. Scroll to zoom.",
    viewerTitle: "3D Model",
    labelsTitle: "Labels",
    lastClickTitle: "Last Click",
    resetButton: "Reset All",
    loadingText: "Loading English model...",
    resetState: "reset",
    modelState: "model",
    onState: "on",
    offState: "off",
    missingState: "missing in GLB",
    loadFailed: "Failed to load English model",
  },
  hi: {
    htmlLang: "hi",
    modelUrl: "./neuron1.glb",
    buttonLabel: "हिंदी",
    title: "न्यूरॉन की संरचना",
    hint: "हाइलाइट बदलने के लिए मॉडल के भाग या लेबल पर क्लिक करें। घुमाने के लिए ड्रैग करें। ज़ूम करने के लिए स्क्रॉल करें।",
    viewerTitle: "3D मॉडल",
    labelsTitle: "लेबल",
    lastClickTitle: "अंतिम क्लिक",
    resetButton: "रीसेट करें",
    loadingText: "हिंदी मॉडल लोड हो रहा है...",
    resetState: "रीसेट",
    modelState: "मॉडल",
    onState: "चालू",
    offState: "बंद",
    missingState: "GLB में नहीं मिला",
    loadFailed: "हिंदी मॉडल लोड नहीं हुआ",
  },
  pa: {
    htmlLang: "pa",
    modelUrl: "./neuron2.glb",
    buttonLabel: "ਪੰਜਾਬੀ",
    title: "ਨਿਊਰਾਨ ਦੀ ਬਣਤਰ",
    hint: "ਹਾਈਲਾਈਟ ਬਦਲਣ ਲਈ ਮਾਡਲ ਦੇ ਹਿੱਸੇ ਜਾਂ ਲੇਬਲ ਉੱਤੇ ਕਲਿਕ ਕਰੋ। ਘੁਮਾਉਣ ਲਈ ਡ੍ਰੈਗ ਕਰੋ। ਜ਼ੂਮ ਕਰਨ ਲਈ ਸਕ੍ਰੋਲ ਕਰੋ।",
    viewerTitle: "3D ਮਾਡਲ",
    labelsTitle: "ਲੇਬਲ",
    lastClickTitle: "ਆਖਰੀ ਕਲਿਕ",
    resetButton: "ਰੀਸੈਟ ਕਰੋ",
    loadingText: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    resetState: "ਰੀਸੈਟ",
    modelState: "ਮਾਡਲ",
    onState: "ਚਾਲੂ",
    offState: "ਬੰਦ",
    missingState: "GLB ਵਿੱਚ ਨਹੀਂ ਮਿਲਿਆ",
    loadFailed: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਨਹੀਂ ਹੋਇਆ",
  },
};

const PLACARD_UI = {
  en: {
    badge: "Neuron Parts",
    counter: "Tap a model part or label",
    quizTitle: "Quick Quiz",
    defaultTitle: "Select a neuron part",
    defaultTopic: "Interactive learning",
    defaultCategory: "Neuron insight",
    defaultDescription: "Click a label or model part to highlight it and reveal a quick quiz.",
    defaultQuestion: "Tap a label to load a quiz.",
    defaultFeedback: "Choose the best answer to see instant feedback.",
    tags: {
      explore: "Explore",
      tap: "Tap labels",
      model: "3D Model",
    },
    feedback: {
      correct: "Correct! Great work - this is the right answer.",
      incorrect: "Wrong! - try the other choice.",
    },
  },
  hi: {
    badge: "\u0928\u094d\u092f\u0942\u0930\u0949\u0928 \u0915\u0947 \u092d\u093e\u0917",
    counter: "\u092e\u0949\u0921\u0932 \u0915\u0947 \u092d\u093e\u0917 \u092f\u093e \u0932\u0947\u092c\u0932 \u092a\u0930 \u091f\u0948\u092a \u0915\u0930\u0947\u0902",
    quizTitle: "\u0924\u094d\u0935\u0930\u093f\u0924 \u092a\u094d\u0930\u0936\u094d\u0928\u094b\u0924\u094d\u0924\u0930\u0940",
    defaultTitle: "\u0915\u094b\u0908 \u0928\u094d\u092f\u0942\u0930\u0949\u0928 \u092d\u093e\u0917 \u091a\u0941\u0928\u0947\u0902",
    defaultTopic: "\u0907\u0902\u091f\u0930\u090f\u0915\u094d\u091f\u093f\u0935 \u0932\u0930\u094d\u0928\u093f\u0902\u0917",
    defaultCategory: "\u0928\u094d\u092f\u0942\u0930\u0949\u0928 \u091c\u093e\u0928\u0915\u093e\u0930\u0940",
    defaultDescription: "\u0939\u093e\u0907\u0932\u093e\u0907\u091f \u0914\u0930 \u0915\u094d\u0935\u093f\u091c\u093c \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u093f\u0938\u0940 \u0932\u0947\u092c\u0932 \u092f\u093e \u092e\u0949\u0921\u0932 \u092d\u093e\u0917 \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902\u0964",
    defaultQuestion: "\u0915\u094d\u0935\u093f\u091c\u093c \u0932\u094b\u0921 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u093f\u0938\u0940 \u0932\u0947\u092c\u0932 \u092a\u0930 \u091f\u0948\u092a \u0915\u0930\u0947\u0902\u0964",
    defaultFeedback: "\u0924\u0941\u0930\u0902\u0924 \u092b\u0940\u0921\u092c\u0948\u0915 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0939\u0940 \u0909\u0924\u094d\u0924\u0930 \u091a\u0941\u0928\u0947\u0902\u0964",
    tags: {
      explore: "\u0905\u0928\u094d\u0935\u0947\u0937\u0923",
      tap: "\u0932\u0947\u092c\u0932 \u091b\u0942\u090f\u0902",
      model: "3D \u092e\u0949\u0921\u0932",
    },
    feedback: {
      correct: "\u0938\u0939\u0940! \u092c\u0939\u0941\u0924 \u0905\u091a\u094d\u091b\u093e - \u092f\u0939 \u0938\u0939\u0940 \u0909\u0924\u094d\u0924\u0930 \u0939\u0948\u0964",
      incorrect: "\u0917\u0932\u0924! - \u0926\u0942\u0938\u0930\u093e \u0935\u093f\u0915\u0932\u094d\u092a \u0906\u091c\u093c\u092e\u093e\u090f\u0902\u0964",
    },
  },
  pa: {
    badge: "\u0a28\u0a3f\u0a0a\u0a30\u0a4b\u0a28 \u0a26\u0a47 \u0a39\u0a3f\u0a71\u0a38\u0a47",
    counter: "\u0a2e\u0a3e\u0a21\u0a32 \u0a26\u0a47 \u0a39\u0a3f\u0a71\u0a38\u0a47 \u0a1c\u0a3e\u0a02 \u0a32\u0a47\u0a2c\u0a32 \u0a24\u0a47 \u0a1f\u0a48\u0a2a \u0a15\u0a30\u0a4b",
    quizTitle: "\u0a1d\u0a1f\u0a2a\u0a1f \u0a15\u0a41\u0a07\u0a5b",
    defaultTitle: "\u0a15\u0a4b\u0a08 \u0a28\u0a3f\u0a0a\u0a30\u0a4b\u0a28 \u0a26\u0a3e \u0a39\u0a3f\u0a71\u0a38\u0a3e \u0a1a\u0a41\u0a23\u0a4b",
    defaultTopic: "\u0a07\u0a70\u0a1f\u0a30\u0a10\u0a15\u0a1f\u0a3f\u0a35 \u0a38\u0a3f\u0a71\u0a16\u0a23\u0a3e",
    defaultCategory: "\u0a28\u0a3f\u0a0a\u0a30\u0a4b\u0a28 \u0a26\u0a40 \u0a1c\u0a3e\u0a23\u0a15\u0a3e\u0a30\u0a40",
    defaultDescription: "\u0a39\u0a3e\u0a08\u0a32\u0a3e\u0a08\u0a1f \u0a24\u0a47 \u0a15\u0a41\u0a07\u0a5b \u0a26\u0a47\u0a16\u0a23 \u0a32\u0a08 \u0a15\u0a3f\u0a38\u0a47 \u0a32\u0a47\u0a2c\u0a32 \u0a1c\u0a3e\u0a02 \u0a2e\u0a3e\u0a21\u0a32 \u0a26\u0a47 \u0a39\u0a3f\u0a71\u0a38\u0a47 \u0a24\u0a47 \u0a15\u0a32\u0a3f\u0a15 \u0a15\u0a30\u0a4b\u0964",
    defaultQuestion: "\u0a15\u0a41\u0a07\u0a5b \u0a32\u0a4b\u0a21 \u0a15\u0a30\u0a28 \u0a32\u0a08 \u0a15\u0a3f\u0a38\u0a47 \u0a32\u0a47\u0a2c\u0a32 \u0a24\u0a47 \u0a1f\u0a48\u0a2a \u0a15\u0a30\u0a4b\u0964",
    defaultFeedback: "\u0a24\u0a41\u0a30\u0a70\u0a24 \u0a2b\u0a40\u0a21\u0a2c\u0a48\u0a15 \u0a26\u0a47\u0a16\u0a23 \u0a32\u0a08 \u0a38\u0a39\u0a40 \u0a1c\u0a35\u0a3e\u0a2c \u0a1a\u0a41\u0a23\u0a4b\u0964",
    tags: {
      explore: "\u0a16\u0a4b\u0a1c\u0a4b",
      tap: "\u0a32\u0a47\u0a2c\u0a32 \u0a1b\u0a42\u0a39\u0a4b",
      model: "3D \u0a2e\u0a3e\u0a21\u0a32",
    },
    feedback: {
      correct: "\u0a38\u0a39\u0a40! \u0a2c\u0a39\u0a41\u0a24 \u0a35\u0a27\u0a40\u0a06 - \u0a0f\u0a39 \u0a38\u0a39\u0a40 \u0a1c\u0a35\u0a3e\u0a2c \u0a39\u0a48\u0964",
      incorrect: "\u0a17\u0a32\u0a24! - \u0a26\u0a42\u0a1c\u0a3e \u0a35\u0a3f\u0a15\u0a32\u0a2a \u0a05\u0a1c\u0a3c\u0a2e\u0a3e\u0a13\u0964",
    },
  },
};

const COLORS = [
  0xff6b6b,
  0xffd84d,
  0x4dd0ff,
  0x6bff95,
  0xb56bff,
  0xff8fd8,
  0xffa24d,
  0x3de0c6,
  0x6f7cff,
  0xff5fd1,
];

const LABEL_DEFS = [
  {
    key: "dendrites",
    names: { en: "Dendrites", hi: "डेंड्राइट्स", pa: "ਡੈਂਡਰਾਈਟਸ" },
    aliases: ["dendrites", "dendrite"],
  },
  {
    key: "nissl",
    names: { en: "Nissl's granules", hi: "निसेल ग्रेन्यूल", pa: "ਨਿਸਿਲ ਗ੍ਰੈਨਿਊਲ" },
    aliases: ["Nissl's granules", "Nissl's granlues", "Nissls granules"],
  },
  {
    key: "cell_body",
    names: { en: "Cell body", hi: "कोशिकाकाय", pa: "ਸੈੱਲ ਸਰੀਰ" },
    aliases: ["Cell body", "cellbody"],
  },
  {
    key: "nucleus",
    names: { en: "Nucleus", hi: "केंद्रक", pa: "ਕੇਂਦਰਕ" },
    aliases: ["Nucleus"],
  },
  {
    key: "schwan",
    names: { en: "Schwan cell", hi: "श्वान कोशिका", pa: "ਸ਼ਵਾਨ ਸੈੱਲ" },
    aliases: ["Schwan cell", "Schwan Cell", "Schwann cell", "Schwann Cell"],
  },
  {
    key: "axon",
    names: { en: "Axon", hi: "तंत्रिकाक्ष", pa: "ਐਕਸਾਨ" },
    aliases: ["Axon"],
  },
  {
    key: "myelin",
    names: { en: "Myelin sheath", hi: "मायलिन आवरण", pa: "ਮਾਈਲਿਨ ਪਰਤ" },
    aliases: ["Myelin sheath", "myelin sheath", "Myelin Sheath"],
  },
  {
    key: "node_ranvier",
    names: { en: "Node of Ranvier", hi: "रेन्वीयर का नोड", pa: "ਰੈਨਵੀਅਰ ਗੰਢ" },
    aliases: ["Node of Ranvier", "Node of Ranveir", "Node of ranveir"],
  },
  {
    key: "axon_terminal",
    names: { en: "Axon terminal", hi: "तंत्रिकाक्ष सिरा", pa: "ਐਕਸਾਨ ਸਿਰਾ" },
    aliases: ["Axon terminal", "Axin terminal", "Axon Terminal"],
  },
  {
    key: "synaptic_knob",
    names: { en: "Synaptic knob", hi: "सिनेप्टिक पुटिकाएं", pa: "ਸਾਈਨੈਪਟਿਕ ਗੰਢ" },
    aliases: ["Synaptic knob", "SynapticKnob", "Synaptic Knob"],
  },
];

const LABEL_COLORS = {
  dendrites: 0x2d9cdb,
  nissl: 0xbb6bd9,
  cell_body: 0xf2994a,
  nucleus: 0x27ae60,
  schwan: 0x56ccf2,
  axon: 0xeb5757,
  myelin: 0xf2c94c,
  node_ranvier: 0x351c75,
  axon_terminal: 0x9b51e0,
  synaptic_knob: 0xff5fd1,
};

const LABEL_CONTENT = {
  en: {
    dendrites: {
      label: "Dendrites",
      category: "Signal Receiver",
      description: "Dendrites receive incoming nerve impulses from other neurons.",
      question: "Why are dendrites highly branched?",
      options: [
        "To increase surface area for receiving signals",
        "To speed up impulse transmission"
      ],
      correctAnswer: "To increase surface area for receiving signals"
    },

    cell_body: {
      label: "Cell body",
      category: "Control Center",
      description: "Cell body integrates incoming signals and contains the nucleus.",
      question: "What happens if the cell body is damaged?",
      options: [
        "Neuron cannot survive",
        "Neuron continues functioning normally"
      ],
      correctAnswer: "Neuron cannot survive"
    },

    nucleus: {
      label: "Nucleus",
      category: "Genetic Control",
      description: "Nucleus regulates metabolic activities.",
      question: "Which biomolecule is mainly controlled by nucleus?",
      options: ["Proteins", "Lipids"],
      correctAnswer: "Proteins"
    },

    nissl_granules: {
      label: "Nissl's granules",
      category: "Protein Synthesis",
      description: "Nissl granules help in protein synthesis.",
      question: "Nissl granules are absent in which part?",
      options: ["Axon", "Cell body"],
      correctAnswer: "Axon"
    },

    schwann_cell: {
      label: "Schwan cell",
      category: "Support Cell",
      description: "Forms myelin sheath around axon.",
      question: "Found in which system?",
      options: ["Peripheral nervous system", "Central nervous system"],
      correctAnswer: "Peripheral nervous system"
    },

    axon: {
      label: "Axon",
      category: "Signal Conductor",
      description: "Carries impulses away from cell body.",
      question: "What ensures one-way conduction?",
      options: ["Synapse", "Diffusion"],
      correctAnswer: "Synapse"
    },

    myelin_sheath: {
      label: "Myelin sheath",
      category: "Insulation Layer",
      description: "Speeds up nerve impulse transmission.",
      question: "The Myelin sheath is derived from the",
      options: ["Schwann cells", "Nerve cells"],
      correctAnswer:"Schwann cells"
    },

    node_of_ranvier: {
      label: "Node of Ranvier",
      category: "Gap Region",
      description: "Gaps in myelin sheath.",
      question: "Why important?",
      options: [
        "Impulse jumps faster",
        "Stores neurotransmitters"
      ],
      correctAnswer: "Impulse jumps faster"
    },

    axon_terminal: {
      label: "Axon terminal",
      category: "Signal Output",
      description: "Transfers signal to next neuron.",
      question: "What forms junction between neurons?",
      options: ["Synapse", "Axon"],
      correctAnswer: "Synapse"
    },

    synaptic_knob: {
      label: "Synaptic knob",
      category: "Transmission Point",
      description: "Helps pass signals across synapse.",
      question: "What triggers neurotransmitter release?",
      options: [
        "Arrival of impulse",
        "Oxygen intake"
      ],
      correctAnswer: "Arrival of impulse"
    }
  },

  hi: {
    dendrites: {
      label: "डेंड्राइट",
      category: "संकेत ग्रहणकर्ता",
      description: "डेंड्राइट अन्य न्यूरॉनों से संकेत प्राप्त करते हैं।",
      question: "डेंड्राइट शाखित क्यों होते हैं?",
      options: [
        "संकेत ग्रहण करने के लिए सतह क्षेत्र बढ़ाने हेतु",
        "संकेत को तेज करने के लिए"
      ],
      correctAnswer: "संकेत ग्रहण करने के लिए सतह क्षेत्र बढ़ाने हेतु"
    },

    cell_body: {
      label: "कोशिकाकाय",
      category: "नियंत्रण केंद्र",
      description: "कोशिकाकाय संकेतों को समेकित करता है और इसमें केंद्रक होता है।",
      question: "यदि कोशिकाकाय क्षतिग्रस्त हो जाए तो क्या होगा?",
      options: [
        "न्यूरॉन जीवित नहीं रहेगा",
        "न्यूरॉन सामान्य रूप से कार्य करेगा"
      ],
      correctAnswer: "न्यूरॉन जीवित नहीं रहेगा"
    },

    nucleus: {
      label: "केंद्रक",
      category: "आनुवंशिक नियंत्रण",
      description: "केंद्रक कोशिका की क्रियाओं को नियंत्रित करता है।",
      question: "केंद्रक मुख्य रूप से किसे नियंत्रित करता है?",
      options: ["प्रोटीन", "लिपिड"],
      correctAnswer: "प्रोटीन"
    },

    nissl_granules: {
      label: "निसेल ग्रेन्यूल",
      category: "प्रोटीन संश्लेषण",
      description: "निसेल ग्रेन्यूल प्रोटीन निर्माण में सहायक होते हैं।",
      question: "निसेल ग्रेन्यूल कहाँ नहीं पाए जाते?",
      options: ["तंत्रिकाक्ष", "कोशिकाकाय"],
      correctAnswer: "तंत्रिकाक्ष"
    },

    schwann_cell: {
      label: "श्वान कोशिका",
      category: "सहायक कोशिका",
      description: "यह मायेलिन आवरण बनाती है।",
      question: "श्वान कोशिकाएँ कहाँ पाई जाती हैं?",
      options: ["परिधीय तंत्रिका तंत्र", "केंद्रीय तंत्रिका तंत्र"],
      correctAnswer: "परिधीय तंत्रिका तंत्र"
    },

    axon: {
      label: "तंत्रिकाक्ष",
      category: "संकेत संवाहक",
      description: "यह संकेत को कोशिकाकाय से दूर ले जाता है।",
      question: "संकेत का एक दिशा में प्रवाह कैसे सुनिश्चित होता है?",
      options: ["सिनेप्स", "प्रसार"],
      correctAnswer: "सिनेप्स"
    },

    myelin_sheath: {
      label: "मायलिन आवरण",
      category: "इन्सुलेशन परत",
      description: "यह संकेत संचरण को तेज करता है।",
      question: "मायलिन आवरण किससे बनता है?",
      options: ["श्वान कोशिकाएँ", "तंत्रिका कोशिकाएँ"],
      correctAnswer:"श्वान कोशिकाएँ"
    },


    node_of_ranvier: {
      label: "रेन्वीयर के नोड",
      category: "गैप क्षेत्र",
      description: "यह मायेलिन के बीच का अंतर होता है।",
      question: "रेन्वीयर नोड का क्या कार्य है?",
      options: [
        "संकेत को कूदने में मदद करना",
        "न्यूरोट्रांसमीटर संग्रह करना"
      ],
      correctAnswer: "संकेत को कूदने में मदद करना"
    },

    axon_terminal: {
      label: "तंत्रिकाक्ष सिरा",
      category: "संकेत आउटपुट",
      description: "यह अगले न्यूरॉन को संकेत देता है।",
      question: "दो न्यूरॉनों के बीच संपर्क क्या कहलाता है?",
      options: ["सिनेप्स", "तंत्रिकाक्ष"],
      correctAnswer: "सिनेप्स"
    },

    synaptic_knob: {
      label: "सिनैप्टिक पुटिकाएं",
      category: "संचरण बिंदु",
      description: "यह सिनेप्स में संकेत स्थानांतरित करता है।",
      question: "न्यूरोट्रांसमीटर कब निकलते हैं?",
      options: [
        "संकेत आने पर",
        "ऑक्सीजन लेने पर"
      ],
      correctAnswer: "संकेत आने पर"
    }
  },
  pa: {
  dendrites: {
    label: "ਡੈਂਡਰਾਈਟ",
    category: "ਸੰਕੇਤ ਪ੍ਰਾਪਤ ਕਰਨ ਵਾਲਾ",
    description: "ਡੈਂਡਰਾਈਟ ਹੋਰ ਨਿਊਰਾਨ ਤੋਂ ਆਉਣ ਵਾਲੇ ਸੰਕੇਤ ਪ੍ਰਾਪਤ ਕਰਦੇ ਹਨ।",
    question: "ਡੈਂਡਰਾਈਟ ਬਹੁਤ ਜ਼ਿਆਦਾ ਸ਼ਾਖਾਬੰਦੀ ਕਿਉਂ ਹੁੰਦੇ ਹਨ?",
    options: [
      "ਸੰਕੇਤ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਤਹ ਖੇਤਰ ਵਧਾਉਣ ਲਈ",
      "ਸੰਕੇਤ ਨੂੰ ਤੇਜ਼ ਕਰਨ ਲਈ"
    ],
    correctAnswer: "ਸੰਕੇਤ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਤਹ ਖੇਤਰ ਵਧਾਉਣ ਲਈ"
  },

  cell_body: {
    label: "ਸੈੱਲ ਸਰੀਰ",
    category: "ਨਿਯੰਤਰਣ ਕੇਂਦਰ",
    description: "ਸੈੱਲ ਸਰੀਰ ਸੰਕੇਤਾਂ ਨੂੰ ਇਕੱਠਾ ਕਰਦਾ ਹੈ ਅਤੇ ਇਸ ਵਿੱਚ ਕੇਂਦਰਕ ਹੁੰਦਾ ਹੈ।",
    question: "ਜੇ ਸੈੱਲ ਸਰੀਰ ਨੁਕਸਾਨੀ ਹੋ ਜਾਵੇ ਤਾਂ ਕੀ ਹੋਵੇਗਾ?",
    options: [
      "ਨਿਊਰਾਨ ਜੀਵਿਤ ਨਹੀਂ ਰਹੇਗਾ",
      "ਨਿਊਰਾਨ ਸਧਾਰਣ ਤਰ੍ਹਾਂ ਕੰਮ ਕਰੇਗਾ"
    ],
    correctAnswer: "ਨਿਊਰਾਨ ਜੀਵਿਤ ਨਹੀਂ ਰਹੇਗਾ"
  },

  nucleus: {
    label: "ਕੇਂਦਰਕ",
    category: "ਜੀਨਤਕ ਨਿਯੰਤਰਣ",
    description: "ਕੇਂਦਰਕ ਕੋਸ਼ਿਕਾ ਦੀਆਂ ਗਤੀਵਿਧੀਆਂ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਦਾ ਹੈ।",
    question: "ਕੇਂਦਰਕ ਮੁੱਖ ਤੌਰ ਤੇ ਕਿਸ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਦਾ ਹੈ?",
    options: ["ਪ੍ਰੋਟੀਨ", "ਲਿਪਿਡ"],
    correctAnswer: "ਪ੍ਰੋਟੀਨ"
  },

  nissl_granules: {
    label: "ਨਿਸਿਲ ਗ੍ਰੈਨਿਊਲ",
    category: "ਪ੍ਰੋਟੀਨ ਸੰਸ਼ਲੇਸ਼ਣ",
    description: "ਨਿਸਿਲ ਗ੍ਰੈਨਿਊਲ ਪ੍ਰੋਟੀਨ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ।",
    question: "ਨਿਸਿਲ ਗ੍ਰੈਨਿਊਲ ਕਿੱਥੇ ਨਹੀਂ ਮਿਲਦੇ?",
    options: ["ਐਕਸਾਨ", "ਸੈੱਲ ਸਰੀਰ"],
    correctAnswer: "ਐਕਸਾਨ"
  },

  schwann_cell: {
    label: "ਸ਼ਵਾਨ ਸੈੱਲ",
    category: "ਸਹਾਇਕ ਕੋਸ਼ਿਕਾ",
    description: "ਇਹ ਐਕਸਾਨ ਦੇ ਆਲੇ ਦੁਆਲੇ ਮਾਈਲਿਨ ਪਰਤ ਬਣਾਉਂਦਾ ਹੈ।",
    question: "ਸ਼ਵਾਨ ਸੈੱਲ ਕਿੱਥੇ ਪਾਏ ਜਾਂਦੇ ਹਨ?",
    options: [
      "ਪਰਿਫਰੀ ਨਰਵਸ ਸਿਸਟਮ",
      "ਸੈਂਟਰਲ ਨਰਵਸ ਸਿਸਟਮ"
    ],
    correctAnswer: "ਪਰਿਫਰੀ ਨਰਵਸ ਸਿਸਟਮ"
  },

  axon: {
    label: "ਐਕਸਾਨ",
    category: "ਸੰਕੇਤ ਵਾਹਕ",
    description: "ਐਕਸਾਨ ਸੰਕੇਤ ਨੂੰ ਸੈੱਲ ਸਰੀਰ ਤੋਂ ਦੂਰ ਲੈ ਜਾਂਦਾ ਹੈ।",
    question: "ਸੰਕੇਤ ਇੱਕ ਹੀ ਦਿਸ਼ਾ ਵਿੱਚ ਕਿਵੇਂ ਜਾਂਦਾ ਹੈ?",
    options: ["ਸਿਨੈਪਸ", "ਡਿਫਿਊਜ਼ਨ"],
    correctAnswer: "ਸਿਨੈਪਸ"
  },

  myelin_sheath: {
    label: "ਮਾਈਲਿਨ ਪਰਤ",
    category: "ਇਨਸੂਲੇਸ਼ਨ ਪਰਤ",
    description: "ਇਹ ਸੰਕੇਤ ਦੀ ਗਤੀ ਨੂੰ ਤੇਜ਼ ਕਰਦੀ ਹੈ।",
    question: "ਮਾਈਲਿਨ ਪਰਤ ਕਿਸ ਤੋਂ ਬਣਦੀ ਹੈ?",
    options: ["ਸ਼ਵਾਨ ਕੋਸ਼ਿਕਾਵਾਂ", "ਤੰਤਰਿਕ ਕੋਸ਼ਿਕਾਵਾਂ"],
    correctAnswer: "ਸ਼ਵਾਨ ਕੋਸ਼ਿਕਾਵਾਂ"
  },

  node_of_ranvier: {
    label: "ਰੈਨਵੀਅਰ ਗੰਢ",
    category: "ਖਾਲੀ ਸਥਾਨ",
    description: "ਇਹ ਮਾਈਲਿਨ ਪਰਤ ਦੇ ਵਿਚਕਾਰ ਦੇ ਖਾਲੀ ਹਿੱਸੇ ਹੁੰਦੇ ਹਨ।",
    question: "ਰੈਨਵੀਅਰ ਗੰਢ ਦਾ ਕੀ ਕੰਮ ਹੈ?",
    options: [
      "ਸੰਕੇਤ ਨੂੰ ਕੂਦਣ ਵਿੱਚ ਮਦਦ ਕਰਨਾ",
      "ਨਿਊਰੋਟਰਾਂਸਮੀਟਰ ਸਟੋਰ ਕਰਨਾ"
    ],
    correctAnswer: "ਸੰਕੇਤ ਨੂੰ ਕੂਦਣ ਵਿੱਚ ਮਦਦ ਕਰਨਾ"
  },

  axon_terminal: {
    label: "ਐਕਸਾਨ ਸਿਰਾ",
    category: "ਸੰਕੇਤ ਆਉਟਪੁੱਟ",
    description: "ਇਹ ਅਗਲੇ ਨਿਊਰਾਨ ਨੂੰ ਸੰਕੇਤ ਭੇਜਦਾ ਹੈ।",
    question: "ਦੋ ਨਿਊਰਾਨਾਂ ਦੇ ਵਿਚਕਾਰ ਜੋੜ ਕੀ ਕਹਿੰਦੇ ਹਨ?",
    options: ["ਸਾਈਨੇਪਸ", "ਐਕਸਾਨ"],
    correctAnswer: "ਸਾਈਨੇਪਸ"
  },

  synaptic_knob: {
    label: "ਸਾਈਨੈਪਟਿਕ  ਗੰਢ",
    category: "ਸੰਚਾਰ ਬਿੰਦੂ",
    description: "ਇਹ ਸਿਨੈਪਸ ਵਿੱਚ ਸੰਕੇਤਾਂ ਦਾ ਸੰਚਾਰ ਕਰਦਾ ਹੈ।",
    question: "ਨਿਊਰੋਟਰਾਂਸਮੀਟਰ ਕਦੋਂ ਰਿਲੀਜ਼ ਹੁੰਦੇ ਹਨ?",
    options: [
      "ਜਦੋਂ ਸੰਕੇਤ ਆਉਂਦਾ ਹੈ",
      "ਜਦੋਂ ਆਕਸੀਜਨ ਆਉਂਦੀ ਹੈ"
    ],
    correctAnswer: "ਜਦੋਂ ਸੰਕੇਤ ਆਉਂਦਾ ਹੈ"
  }
}

}
const LABEL_DEF_BY_KEY = new Map(LABEL_DEFS.map((def) => [def.key, def]));
const PLACEHOLDER_TEXT = "—";

const canvas = document.querySelector("#c");
const resetBtn = document.querySelector("#resetBtn");
const labelsEl = document.querySelector("#labels");
const hotspotLayerEl = document.querySelector("#hotspotLayer");
const lastClickEl = document.querySelector("#lastClick");
const pageTitleEl = document.querySelector("#pageTitle");
const pageHintEl = document.querySelector("#pageHint");
const viewerTitleEl = document.querySelector("#viewerTitle");
const labelsTitleEl = document.querySelector("#labelsTitle");
const lastClickTitleEl = document.querySelector("#lastClickTitle");
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
let activePlacardKey = null;
let hotspotButtons = [];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
camera.position.set(1.2, 0.8, 2.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(2, 3, 1);
scene.add(dir);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();

let currentLanguage = "en";
let gltfRoot = null;
let labels = [];
let loadRequestId = 0;

const selected = new Set();
const labelKeyByRootUuid = new Map();

let highlightOrderCounter = 0;
const meshBaseMaterialByUuid = new Map();
const meshHighlightsByUuid = new Map();
const highlightMaterialsByHex = new Map();

function getLanguageConfig(language = currentLanguage) {
  return LANGUAGE_CONFIG[language] ?? LANGUAGE_CONFIG.en;
}

function getPlacardUi(language = currentLanguage) {
  return PLACARD_UI[language] ?? PLACARD_UI.en;
}

function getLabelName(labelKey, language = currentLanguage) {
  const def = LABEL_DEF_BY_KEY.get(labelKey);
  if (!def) return labelKey;
  return def.names[language] ?? def.names.en ?? labelKey;
}

function formatLastClick(labelKey, state) {
  return `${getLabelName(labelKey)} (${state})`;
}

const CONTENT_KEY_ALIASES = {
  nissl: "nissl_granules",
  schwan: "schwann_cell",
  myelin: "myelin_sheath",
  node_ranvier: "node_of_ranvier",
};

function getContentKey(labelKey) {
  if (!labelKey) return null;
  return CONTENT_KEY_ALIASES[labelKey] ?? labelKey;
}

function getLocalizedLabelContent(labelKey, language = currentLanguage) {
  const contentKey = getContentKey(labelKey);
  if (!contentKey) return null;
  return LABEL_CONTENT[language]?.[contentKey] ?? LABEL_CONTENT.en?.[contentKey] ?? null;
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

function updatePlacard(labelKey = null) {
  activePlacardKey = labelKey;
  const ui = getPlacardUi();
  const content = labelKey ? getLocalizedLabelContent(labelKey) : null;
  const name = labelKey ? getLabelName(labelKey) : ui.defaultTitle;

  placardBadgeEl.textContent = ui.badge;
  placardQuizTitleEl.textContent = ui.quizTitle;
  placardTitleEl.textContent = name;
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

function openPlacardOverlay(labelKey) {
  updatePlacard(labelKey);
  placardOverlayEl.classList.remove("hidden");
}

function closePlacardOverlay() {
  placardOverlayEl.classList.add("hidden");
}

function handlePlacardChoice(event) {
  const button = event.target.closest("button[data-answer]");
  if (!button || !activePlacardKey) return;
  const content = getLocalizedLabelContent(activePlacardKey);
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
  return;
/*

  const answer = button.dataset.answer;
  if (answer === content.correctAnswer) {
    setPlacardFeedback("Correct! Great work — this is the right answer.", "correct");
  } else {
    setPlacardFeedback("Not quite — try the other choice.", "incorrect");
  }
*/
}

function isGlbMarkerName(name) {
  const s = String(name || "");
  return s.startsWith("Cylinder");
}

function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeLabelObjectName(s) {
  let normalized = normalizeName(s);
  if (normalized.endsWith("1")) normalized = normalized.slice(0, -1);
  normalized = normalized.replace(/^(?:label_|text_|label|text)/, "");
  return normalized;
}

function isTextLabelRoot(name) {
  const normalized = normalizeLabelObjectName(name);
  return normalized !== normalizeName(name) && normalizeName(name).endsWith("1");
}

function isTextLabelMesh(obj) {
  const name = String(obj?.name || "");
  return isTextLabelRoot(name) || /(?:label|text)/i.test(name);
}

function highlightMaterialForColor(colorHex) {
  if (highlightMaterialsByHex.has(colorHex)) return highlightMaterialsByHex.get(colorHex);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 2.1,
    roughness: 0.08,
    metalness: 0.12,
  });
  highlightMaterialsByHex.set(colorHex, mat);
  return mat;
}

function applyMeshHighlight(mesh) {
  const ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap || ownerMap.size === 0) {
    const base = meshBaseMaterialByUuid.get(mesh.uuid);
    if (base) mesh.material = base;
    return;
  }

  let best = null;
  for (const value of ownerMap.values()) {
    if (!best || value.order > best.order) best = value;
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

function clearAllHighlights() {
  if (gltfRoot) {
    gltfRoot.traverse((obj) => {
      if (!obj.isMesh) return;
      const base = meshBaseMaterialByUuid.get(obj.uuid);
      if (base) obj.material = base;
    });
  }
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
}

function resetModelState() {
  selected.clear();
  clearAllHighlights();
  labelKeyByRootUuid.clear();
  meshBaseMaterialByUuid.clear();
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
  labels = [];
}

function removeCurrentModel() {
  if (gltfRoot) {
    clearAllHighlights();
    scene.remove(gltfRoot);
    gltfRoot = null;
  }
  resetModelState();
}

function collectMeshes(root) {
  const out = [];
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (isGlbMarkerName(obj.name)) return;
    if (isTextLabelMesh(obj)) return;
    out.push(obj);
  });
  return out;
}

function setHighlighted(root, on, colorHex, ownerKey) {
  const mat = highlightMaterialForColor(colorHex);
  for (const mesh of collectMeshes(root)) {
    if (on) setMeshHighlight(mesh, ownerKey, mat);
    else setMeshHighlight(mesh, ownerKey, null);
  }
}

function rebuildPanel() {
  labelsEl.innerHTML = "";

  for (const label of labels) {
    const row = document.createElement("div");
    row.className = "labelRow";
    row.style.setProperty("--labelColor", `#${label.colorHex.toString(16).padStart(6, "0")}`);
    row.title = label.roots.length
      ? `GLB match: ${label.roots.map((root) => root.name || "(unnamed)").join(", ")}`
      : "GLB match: none";

    const left = document.createElement("div");
    left.className = "labelName";

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = getLabelName(label.key);
    left.appendChild(name);

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = selected.has(label.key) ? getLanguageConfig().onState : getLanguageConfig().offState;

    row.classList.toggle("active", selected.has(label.key));
    if (!label.foundMeshesCount) row.classList.add("disabled");
    row.appendChild(dot);
    row.appendChild(left);
    row.appendChild(pill);
    labelsEl.appendChild(row);

    row.addEventListener("click", () => {
      if (!label.foundMeshesCount) {
        lastClickEl.textContent = formatLastClick(label.key, getLanguageConfig().missingState);
        return;
      }
      if (selected.has(label.key)) {
        deselectLabel(label.key);
        closePlacardOverlay();
      } else {
        selectLabel(label.key);
        openPlacardOverlay(label.key);
      }
    });
  }
  rebuildHotspotLayer();
}

function deselectLabel(labelKey) {
  const label = labels.find((item) => item.key === labelKey);
  if (!label) return;
  selected.delete(labelKey);
  for (const root of label.roots) setHighlighted(root, false, label.colorHex, labelKey);
  lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().offState);
  rebuildPanel();
  closePlacardOverlay();
  updatePlacard();
}

function toggleLabel(labelKey) {
  const label = labels.find((item) => item.key === labelKey);
  if (!label || !label.foundMeshesCount) return;

  if (selected.has(labelKey)) {
    deselectLabel(labelKey);
  } else {
    selected.add(labelKey);
    for (const root of label.roots) setHighlighted(root, true, label.colorHex, labelKey);
    lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().onState);
    rebuildPanel();
    updatePlacard(labelKey);
  }
}

function selectLabel(labelKey) {
  const label = labels.find((item) => item.key === labelKey);
  if (!label || !label.foundMeshesCount) return;
  if (selected.has(labelKey)) return;

  selected.add(labelKey);
  for (const root of label.roots) setHighlighted(root, true, label.colorHex, labelKey);
  lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().onState);
  rebuildPanel();
  updatePlacard(labelKey);
}

function pickLabelKeyFromHit(obj) {
  let cur = obj;
  while (cur) {
    const entry = labelKeyByRootUuid.get(cur.uuid);
    if (entry) return entry;
    cur = cur.parent;
  }
  return null;
}

function onPointerDown(ev) {
  if (!gltfRoot) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObject(gltfRoot, true);
  if (!hits.length) return;

  const hitResult = pickLabelKeyFromHit(hits[0].object);
  if (!hitResult) return;

  const { key: labelKey, isTextLabel } = hitResult;
  lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().modelState);

  if (isTextLabel) {
    if (selected.has(labelKey)) {
      deselectLabel(labelKey);
      closePlacardOverlay();
    } else {
      selectLabel(labelKey);
      openPlacardOverlay(labelKey);
    }
    return;
  }

  if (selected.has(labelKey)) {
    deselectLabel(labelKey);
    closePlacardOverlay();
  } else {
    selectLabel(labelKey);
    openPlacardOverlay(labelKey);
  }
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function hasNonMarkerMeshDescendant(root) {
  let ok = false;
  root.traverse((obj) => {
    if (ok) return;
    if (obj.isMesh && !isGlbMarkerName(obj.name)) ok = true;
  });
  return ok;
}

function buildLabelsForCurrentModel() {
  labelKeyByRootUuid.clear();

  const aliasesByLabelKey = new Map(
    LABEL_DEFS.map((def) => [
      def.key,
      Array.from(
        new Set([
          def.key,
          def.names.en,
          ...(def.aliases || [])
        ]
          .filter(Boolean)
          .map(normalizeName))
      ).filter(Boolean),
    ])
  );

  const rootsByLabelKey = new Map(LABEL_DEFS.map((def) => [def.key, []]));
  const hotspotRootsByLabelKey = new Map(LABEL_DEFS.map((def) => [def.key, []]));
  gltfRoot.traverse((obj) => {
    if (!obj.name) return;
    const textLabel = isTextLabelRoot(obj.name);
    if (isGlbMarkerName(obj.name) && !textLabel) return;
    const normalized = normalizeLabelObjectName(obj.name);
    for (const [key, names] of aliasesByLabelKey.entries()) {
      if (!names.includes(normalized)) continue;
      rootsByLabelKey.get(key).push(obj);
      if (textLabel) hotspotRootsByLabelKey.get(key).push(obj);
    }
  });

  labels = LABEL_DEFS.map((def, index) => {
    const roots = (rootsByLabelKey.get(def.key) || []).filter((root) => hasNonMarkerMeshDescendant(root));
    const hotspotRoots = hotspotRootsByLabelKey.get(def.key) || [];
    const fallbackHotspotRoots = [];
    const fallbackHotspotRootUuids = new Set();

    for (const root of roots) {
      root.traverse((obj) => {
        if (!obj.name) return;
        if (isTextLabelRoot(obj.name) || /(?:label|text)/i.test(String(obj.name))) {
          if (!fallbackHotspotRootUuids.has(obj.uuid)) {
            fallbackHotspotRootUuids.add(obj.uuid);
            fallbackHotspotRoots.push(obj);
          }
        }
      });
    }

    return {
      key: def.key,
      colorHex: LABEL_COLORS[def.key] ?? COLORS[index % COLORS.length],
      roots,
      hotspotRoots: hotspotRoots.length > 0 ? hotspotRoots : fallbackHotspotRoots,
      foundMeshesCount: 0,
    };
  });

  for (const label of labels) {
    let meshes = 0;
    for (const root of label.roots) meshes += collectMeshes(root).length;
    label.foundMeshesCount = meshes;

    for (const root of label.roots) {
      const textLabel = isTextLabelRoot(root.name);
      root.traverse((obj) => {
        if (isGlbMarkerName(obj.name)) return;
        if (!labelKeyByRootUuid.has(obj.uuid)) {
          labelKeyByRootUuid.set(obj.uuid, { key: label.key, isTextLabel: textLabel });
        }
      });
    }
  }
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

function frameModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  controls.target.copy(center);
  controls.update();

  camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.25, maxDim * 1.5));
  camera.near = Math.max(0.01, maxDim / 100);
  camera.far = maxDim * 50;
  camera.updateProjectionMatrix();
}

function applyLanguageUI() {
  const config = getLanguageConfig();

  document.documentElement.lang = config.htmlLang;
  document.title = config.title;
  pageTitleEl.textContent = config.title;
  pageHintEl.textContent = config.hint;
  viewerTitleEl.textContent = config.viewerTitle;
  labelsTitleEl.textContent = config.labelsTitle;
  lastClickTitleEl.textContent = config.lastClickTitle;
  resetBtn.textContent = config.resetButton;

  for (const button of languageButtons) {
    const language = button.dataset.language;
    button.textContent = LANGUAGE_CONFIG[language]?.buttonLabel ?? language;
    button.classList.toggle("active", language === currentLanguage);
  }

  rebuildPanel();
  updatePlacard(activePlacardKey);
}

function setControlsDisabled(disabled) {
  resetBtn.disabled = disabled;
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

      gltfRoot.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.frustumCulled = true;
        if (isGlbMarkerName(obj.name)) obj.raycast = () => {};
      });

      scene.add(gltfRoot);
      buildLabelsForCurrentModel();
      frameModel(gltfRoot);
      rebuildPanel();
      lastClickEl.textContent = PLACEHOLDER_TEXT;
      updatePlacard();
      closePlacardOverlay();
      closePlacardOverlay();
      setControlsDisabled(false);
    },
    undefined,
    (err) => {
      if (requestId !== loadRequestId) return;
      console.error(err);
      lastClickEl.textContent = config.loadFailed;
      setControlsDisabled(false);
    }
  );
}

function switchLanguage(language) {
  if (!LANGUAGE_CONFIG[language] || language === currentLanguage) return;
  currentLanguage = language;
  applyLanguageUI();
  loadCurrentLanguageModel();
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", onPointerDown);
resetBtn.addEventListener("click", () => {
  selected.clear();
  clearAllHighlights();
  lastClickEl.textContent = getLanguageConfig().resetState;
  rebuildPanel();
  closePlacardOverlay();
  updatePlacard();
  closePlacardOverlay();
});

placardOptionsEl.addEventListener("click", handlePlacardChoice);
placardCloseBtn?.addEventListener("click", closePlacardOverlay);

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    const language = button.dataset.language;
    switchLanguage(language);
  });
}

applyLanguageUI();
loadCurrentLanguageModel();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateHotspots();
}

resize();
animate();
