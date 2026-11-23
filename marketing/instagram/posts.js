const getIt = "Deaftly is free for Android. Get it at deaftly.com";
const tags = "#Deaf #DeafCommunity #HardOfHearing #HearingLoss #DeafAwareness";

export const posts = [
  {
    id: "show",
    feature: "Type & show",
    headline: "Type it. Hold it up.",
    cover: "screens/show.webp",
    slides: [
      {
        type: "screen",
        src: "screens/type-and-show.webp",
        caption: "Type while you wait in the queue",
        alt: "Type and show with the message: Could I have a table for two by the window, please? A Show button sits below.",
      },
      {
        type: "screen",
        src: "screens/show.webp",
        caption: "Tap Show and it fills the screen",
        alt: "The table for two message filling the screen in very large text, with a Continue as chat button below.",
      },
      {
        type: "text",
        heading: "Readable from across the desk",
        paragraphs: [
          "Your message fills the screen in large, clear text, so nobody has to lean in.",
          "In a dim room, switch to white on black or yellow on black.",
          "If they want to reply, tap Continue as chat.",
        ],
      },
    ],
    caption: [
      "Need to say something once, clearly? Type it in Deaftly and tap Show.",
      "Your words fill the screen in big, clear text anyone can read from across the desk. Switch to white or yellow on black when it's dim, and tap Continue as chat if they want to reply.",
    ],
  },
  {
    id: "templates",
    feature: "Templates",
    headline: "Order in a few taps.",
    cover: "screens/fill.webp",
    slides: [
      {
        type: "screen",
        src: "screens/fill.webp",
        caption: "The parts that change are highlighted",
        alt: "The Order food template with Pasta arrabbiata filled in as the dish, and a Show button below.",
      },
      {
        type: "steps",
        heading: "Ordering food",
        steps: [
          "Open the Order food template.",
          "Tap the highlighted dish.",
          "Read it straight off the menu with your camera.",
          "Tap Show.",
        ],
      },
      {
        type: "screen",
        src: "screens/camera-menu.webp",
        caption: "Tap the dish on the menu",
        alt: "The camera pointed at a printed Italian menu, with a box around each dish name and Pasta arrabbiata selected. An Add to message button is below.",
      },
      {
        type: "text",
        heading: "Ready for everyday moments",
        paragraphs: [
          "Deaftly comes with templates for checking in, food allergies, the doctor, the pharmacy, buying a ticket and more.",
          "Some gaps are filled with the camera. Others let you pick from a list or type it in.",
          "Edit them, or make your own.",
        ],
      },
    ],
    caption: [
      "Say the things you say every day without typing them from scratch.",
      "Open a template, tap the highlighted gaps to fill them in, then tap Show. For Order food, read the dish straight off the menu with your camera.",
    ],
  },
  {
    id: "face-to-face",
    feature: "Face to face",
    headline: "They read along as you type.",
    cover: "screens/face-to-face.webp",
    coverFrom: 0.36,
    slides: [
      {
        type: "screen",
        src: "screens/face-to-face.webp",
        caption: "Your words face them, upside down",
        alt: "Face to face. At the top, upside down for the person opposite, the words Hi! I'm deaf, so I'll type. My name is Ellie Thompson. Do you need me to sign. At the bottom, the same words in the typing field.",
      },
      {
        type: "text",
        heading: "No waiting for you to finish",
        paragraphs: [
          "Hold your device and type. Your words appear at the top of the screen, facing the person opposite, so they read as you go.",
          "You keep a secure grip on your device the whole time.",
          "When they want to reply, tap Continue side by side and pass it over.",
        ],
      },
    ],
    caption: [
      "Someone at the door? Open Face to face and start typing.",
      "Your words appear upside down at the top of the screen, facing them, so they read along as you type instead of waiting for you to finish. And you never let go of your device.",
    ],
  },
  {
    id: "side-by-side",
    feature: "Side by side",
    headline: "Pass it over. Take turns.",
    cover: "screens/side-by-side.webp",
    coverFrom: 0.3,
    slides: [
      {
        type: "screen",
        src: "screens/side-by-side.webp",
        caption: "One colour each, like a script",
        alt: "Side by side chat between Me and the waiter in two colours, about ordering pasta and a peanut allergy. A switch shows it's the waiter's turn, with a microphone button next to the text box.",
      },
      {
        type: "text",
        heading: "A conversation on one device",
        paragraphs: [
          "Flip the switch to change turns. A prompt shows them where to type.",
          "Swap sides to match where you're each standing.",
          "Add bold and highlights, quote a message, or drop in a template.",
        ],
      },
      {
        type: "text",
        heading: "They can speak instead",
        paragraphs: [
          "On their turn, the other person can tap the microphone and talk. Their words appear in the chat as text.",
          "It turns speech into text on your device, and the audio isn't kept.",
        ],
      },
    ],
    caption: [
      "For a proper back and forth, use Side by side. Pass it over and take turns, with each of you in your own colour so it's easy to follow who said what.",
      "On their turn, they can tap the microphone and speak, and their words appear as text.",
    ],
  },
  {
    id: "camera",
    feature: "Camera",
    headline: "Point. Tap. Add it.",
    cover: "screens/camera-pharmacy.webp",
    slides: [
      {
        type: "screen",
        src: "screens/camera-pharmacy.webp",
        caption: "Tap the line you need",
        alt: "The camera pointed at a pharmacy label for Layla Hassan, with the line Flucloxacillin 500mg Capsules selected and shown in the Selected text box.",
      },
      {
        type: "text",
        heading: "Words straight from the page",
        paragraphs: [
          "Point your camera at a menu, label, sign or letter and Deaftly boxes each line it can read.",
          "Tap lines, or drag across words, and add them to your message.",
          "Freeze the picture to make picking easier, and turn on the torch when it's dark.",
        ],
      },
      {
        type: "screen",
        src: "screens/camera-menu.webp",
        caption: "Menus too",
        alt: "The camera pointed at a printed Italian menu, with a box around each dish name and Pasta arrabbiata selected.",
      },
    ],
    caption: [
      "Medicine names, dishes, station names: no need to copy them out letter by letter.",
      "Point your camera at the text, tap the words you want and add them to your message. Deaftly doesn't store or send your pictures.",
    ],
  },
  {
    id: "names",
    feature: "Your name",
    headline: "Your name, filled in for you.",
    cover: "screens/fill-with-name.webp",
    slides: [
      {
        type: "screen",
        src: "screens/settings.webp",
        caption: "Add your name once in Settings",
        alt: "The Settings screen with First name Keisha and Last name Grant filled in, and Use my first name in chats ticked.",
      },
      {
        type: "screen",
        src: "screens/fill-with-name.webp",
        caption: "It's already there when you check in",
        alt: "The Check in template reading: Hi! I'm deaf. I'd like to check in. My name is Keisha Grant. If you need to reply, please type here. A Show button sits below.",
      },
      {
        type: "text",
        heading: "One less thing to type",
        paragraphs: [
          "Add your first and last name in Settings and Deaftly fills them into templates like Check in.",
          "If the name on your documents is different, add your legal name too.",
          "Your names stay on this device.",
        ],
      },
    ],
    caption: [
      "Checking in, seeing the doctor, picking up a prescription: they all start with your name.",
      "Add it once in Settings and Deaftly fills it in for you. Your names stay on your device.",
    ],
  },
  {
    id: "listen-for-me",
    feature: "Listen for me",
    headline: "Read what they say.",
    cover: "screens/listen.webp",
    slides: [
      {
        type: "screen",
        src: "screens/listen.webp",
        caption: "Their words appear as they speak",
        alt: "Listen for me. At the top, upside down for the host, the words I'm deaf. Please speak and I'll read what you say here. Below, what the host said: Hi, welcome in. A table for two by the window? Of course. Follow me, it's just over here. A live line reads Can I get you any drinks while.",
      },
      {
        type: "text",
        heading: "For when they'd rather talk",
        paragraphs: [
          "Open Listen for me and show them the message at the top: I'm deaf. Please speak and I'll read what you say here.",
          "Their words appear on your screen as they speak. It all happens on your device, and the audio isn't kept.",
        ],
      },
      {
        type: "text",
        heading: "Turn it, pause it, reply",
        paragraphs: [
          "Turn the message to face them, or the right way up to hold it out.",
          "Pause listening whenever you like.",
          "Want to reply? Tap Continue side by side, and what they said comes with you.",
        ],
      },
    ],
    caption: [
      "Some people would rather just talk. Open Listen for me and Deaftly turns what they say into text on your device, so you can read along.",
      "It all happens on your device and the audio isn't kept. When you want to reply, carry on side by side.",
    ],
  },
  {
    id: "shortcuts",
    feature: "Tip",
    headline: "Get there faster.",
    cover: "screens/add-to-home-screen.webp",
    coverFrom: 0.25,
    slides: [
      {
        type: "longpress",
        caption: "Long-press the Deaftly icon",
        shortcuts: [
          ["Start typing", "keyboard"],
          ["Face to face", "faceToFace"],
          ["Side by side", "sideBySide"],
          ["Listen for me", "mic"],
        ],
        alt: "The Deaftly app icon with a menu above it listing Start typing, Face to face, Side by side and Listen for me.",
      },
      {
        type: "text",
        heading: "Jump straight in",
        paragraphs: [
          "Long-press the Deaftly icon on your home screen or in your apps list, then tap where you want to go.",
          "Drag one out of the list to put it on your home screen as its own icon.",
        ],
      },
      {
        type: "screen",
        src: "screens/add-to-home-screen.webp",
        caption: "Or use its information button",
        alt: "The Listen for me information dialog on Deaftly's home screen, with an Add to home screen button under the explanation, and Close and Start below.",
      },
      {
        type: "steps",
        heading: "Add one to your home screen",
        steps: [
          "On Deaftly's home screen, tap the information button on Start typing, Face to face, Side by side or Listen for me.",
          "Tap Add to home screen.",
          "Confirm, and it's on your home screen.",
        ],
      },
      {
        type: "text",
        heading: "If you don't see them",
        paragraphs: [
          "Some devices don't offer shortcuts. If they don't appear, your device's home screen doesn't support them.",
        ],
      },
    ],
    caption: [
      "Tip: open the part of Deaftly you need in one tap.",
      "Long-press the Deaftly icon for Start typing, Face to face, Side by side and Listen for me. To keep one on your home screen, drag it out of the list, or tap its information button in Deaftly and then Add to home screen.",
    ],
  },
];

export const cta = { heading: "Deaftly is free.", line: "Get it for Android at", url: "deaftly.com" };

/** @param {typeof posts[number]} post */
export function slidesOf(post) {
  return [
    {
      type: "cover",
      headline: post.headline,
      feature: post.feature,
      src: post.cover,
      from: post.coverFrom ?? 0,
      alt: `${post.headline} ${post.feature} in Deaftly.`,
    },
    ...post.slides.map(slide => ({ ...slide, alt: slide.alt ?? textOf(slide) })),
    { type: "cta", ...cta, alt: `${cta.heading} ${cta.line} ${cta.url}.` },
  ];
}

/** @param {{ heading?: string, paragraphs?: string[], steps?: string[] }} slide */
function textOf(slide) {
  return [slide.heading, ...(slide.paragraphs ?? []), ...(slide.steps ?? [])].join(" ");
}

/** @param {typeof posts[number]} post */
export function captionOf(post) {
  return [...post.caption, getIt, tags].join("\n\n");
}
