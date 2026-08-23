// Scenario content for N5 conversation practice.
//
// Text conventions:
//   - `text`: Japanese with furigana markup:  漢字[かんじ]  renders as <ruby>漢字<rt>かんじ</rt></ruby>.
//     A kana-only version is derived by replacing each kanji[reading] block with its reading.
//   - `romaji`: plain Hepburn-style romaji of the line.
//   - `english`: translation / meaning.
//   - For user lines (`role: "user"`):
//       - `task`: English instruction shown to the learner.
//       - `answers`: accepted responses. "〇〇" is a wildcard matching any text
//         (used where a personal answer like a name or country is expected).
//
// Vocabulary and grammar are kept within JLPT N5 scope.

export const scenarios = [
  {
    id: "self-intro",
    title: "自己紹介",
    titleEn: "Self-Introduction",
    icon: "👋",
    description: "Meet Tanaka-san for the first time. Greet, say your name, country, and what you study.",
    lines: [
      {
        role: "partner",
        text: "こんにちは。はじめまして。たなかです。",
        romaji: "Konnichiwa. Hajimemashite. Tanaka desu.",
        english: "Hello. Nice to meet you. I'm Tanaka.",
      },
      {
        role: "user",
        text: "こんにちは。はじめまして。〇〇です。",
        romaji: "Konnichiwa. Hajimemashite. (name) desu.",
        english: "Hello. Nice to meet you. I'm ___ .",
        task: "Greet back and introduce yourself with your name.",
        answers: [
          "こんにちは。はじめまして。〇〇です。",
          "はじめまして。〇〇です。",
          "こんにちは。〇〇です。",
        ],
      },
      {
        role: "partner",
        text: "メキシコから来[き]ました。あなたはどちらからですか。",
        romaji: "Mekushiko kara kimashita. Anata wa dochira kara desu ka.",
        english: "I came from Mexico. Where are you from?",
      },
      {
        role: "user",
        text: "アメリカから来ました。",
        romaji: "Amerika kara kimashita.",
        english: "I came from America.",
        task: "Say which country you come from.",
        answers: [
          "アメリカから来ました。",
          "わたしはアメリカから来ました。",
          "アメリカからきました。",
        ],
      },
      {
        role: "partner",
        text: "そうですか。学生[がくせい]ですか。",
        romaji: "Sou desu ka. Gakusei desu ka.",
        english: "Is that so? Are you a student?",
      },
      {
        role: "user",
        text: "はい、学生です。",
        romaji: "Hai, gakusei desu.",
        english: "Yes, I am a student.",
        task: "Confirm that you are a student.",
        answers: ["はい、学生です。", "はい、がくせいです。", "はい、そうです。"],
      },
      {
        role: "partner",
        text: "いいですね。どんなことを勉強[べんきょう]していますか。",
        romaji: "Ii desu ne. Donna koto o benkyou shite imasu ka.",
        english: "That's nice. What are you studying?",
      },
      {
        role: "user",
        text: "日本語を勉強しています。",
        romaji: "Nihongo o benkyou shite imasu.",
        english: "I am studying Japanese.",
        task: "Say that you study Japanese.",
        answers: [
          "日本語を勉強しています。",
          "にほんごをべんきょうしています。",
          "日本語を勉強します。",
        ],
      },
      {
        role: "partner",
        text: "すばらしいですね。どうぞよろしくお願[ねが]いします。",
        romaji: "Subarashii desu ne. Douzo yoroshiku onegaishimasu.",
        english: "That's wonderful. Nice to meet you (lit. please treat me well).",
      },
      {
        role: "user",
        text: "こちらこそ、よろしくお願いします。",
        romaji: "Kochira koso, yoroshiku onegaishimasu.",
        english: "Nice to meet you too (lit. it's me who should say so).",
        task: "Return the greeting politely.",
        answers: [
          "こちらこそ、よろしくお願いします。",
          "こちらこそよろしくお願いします。",
          "こちらこそ、よろしくおねがいします。",
        ],
      },
    ],
  },

  {
    id: "konbini",
    title: "コンビニで",
    titleEn: "At the Convenience Store",
    icon: "🏪",
    description: "Buy onigiri at a konbini. Ask about items, pay by card, and thank the clerk.",
    lines: [
      {
        role: "partner",
        text: "いらっしゃいませ。",
        romaji: "Irasshaimase.",
        english: "Welcome! (said by staff to customers)",
      },
      {
        role: "user",
        text: "すみません、おにぎりはありますか。",
        romaji: "Sumimasen, onigiri wa arimasu ka.",
        english: "Excuse me, do you have onigiri?",
        task: "Get the clerk's attention and ask if they have onigiri.",
        answers: [
          "すみません、おにぎりはありますか。",
          "すみません、おにぎりがありますか。",
          "おにぎりはありますか。",
        ],
      },
      {
        role: "partner",
        text: "はい、ここにあります。",
        romaji: "Hai, koko ni arimasu.",
        english: "Yes, they are here.",
      },
      {
        role: "user",
        text: "では、それを二つください。",
        romaji: "Dewa, sore o futatsu kudasai.",
        english: "Then, please give me two of those.",
        task: "Ask for two onigiri.",
        answers: [
          "それを二つください。",
          "おにぎりを二つください。",
          "それをふたつください。",
          "これを二つください。",
        ],
      },
      {
        role: "partner",
        text: "はい。ぜんぶで220円[えん]です。",
        romaji: "Hai. Zenbu de nihyaku nijuu en desu.",
        english: "Sure. That's 220 yen in total.",
      },
      {
        role: "user",
        text: "カードでもいいですか。",
        romaji: "Kaado demo ii desu ka.",
        english: "Is it okay to pay by card?",
        task: "Ask if paying by card is OK.",
        answers: [
          "カードでもいいですか。",
          "カードではらってもいいですか。",
          "カードは大丈夫ですか。",
        ],
      },
      {
        role: "partner",
        text: "はい、大丈夫[だいじょうぶ]ですよ。",
        romaji: "Hai, daijoubu desu yo.",
        english: "Yes, that's fine.",
      },
      {
        role: "user",
        text: "どうもありがとうございました。",
        romaji: "Doumo arigatou gozaimashita.",
        english: "Thank you very much.",
        task: "Thank the clerk warmly.",
        answers: [
          "ありがとうございます。",
          "どうもありがとうございます。",
          "ありがとうございました。",
          "どうもありがとうございました。",
        ],
      },
      {
        role: "partner",
        text: "ありがとうございました。またどうぞ。",
        romaji: "Arigatou gozaimashita. Mata douzo.",
        english: "Thank you. Please come again.",
      },
    ],
  },

  {
    id: "cafe",
    title: "カフェで",
    titleEn: "Ordering at a Café",
    icon: "☕",
    description: "Order a coffee at a café. Choose your drink, ask the price, and pay.",
    lines: [
      {
        role: "partner",
        text: "いらっしゃいませ。メニューはこちらです。どれにしますか。",
        romaji: "Irasshaimase. Menyuu wa koko desu. Dore ni shimasu ka.",
        english: "Welcome. Here is the menu. Which one will you have?",
      },
      {
        role: "user",
        text: "コーヒーをお願いします。",
        romaji: "Koohii o onegaishimasu.",
        english: "Coffee, please.",
        task: "Order a coffee.",
        answers: ["コーヒーをお願いします。", "コーヒーをください。", "コーヒーにします。"],
      },
      {
        role: "partner",
        text: "ホットとアイス、どちらにしますか。",
        romaji: "Hotto to aisu, dochira ni shimasu ka.",
        english: "Hot or iced — which would you like?",
      },
      {
        role: "user",
        text: "ホットでお願いします。",
        romaji: "Hotto de onegaishimasu.",
        english: "Hot, please.",
        task: "Choose the hot one.",
        answers: ["ホットでお願いします。", "ホットをください。", "ホットのコーヒーをお願いします。"],
      },
      {
        role: "partner",
        text: "はい、わかりました。……どうぞ。ホットコーヒーです。",
        romaji: "Hai, wakarimashita. ... Douzo. Hotto koohii desu.",
        english: "Yes, understood. ... Here you are. One hot coffee.",
      },
      {
        role: "user",
        text: "いくらですか。",
        romaji: "Ikura desu ka.",
        english: "How much is it?",
        task: "Ask how much it costs.",
        answers: ["いくらですか。", "これはいくらですか。"],
      },
      {
        role: "partner",
        text: "350円です。",
        romaji: "Sanbyaku gojuu en desu.",
        english: "It's 350 yen.",
      },
      {
        role: "user",
        text: "はい、これです。どうぞ。",
        romaji: "Hai, kore desu. Douzo.",
        english: "OK, here you are. (handing money)",
        task: "Hand over the money.",
        answers: [
          "はい、これです。",
          "はい、どうぞ。",
          "はい、これでお願いします。",
          "じゃ、これです。",
        ],
      },
      {
        role: "partner",
        text: "ありがとうございます。またどうぞ。",
        romaji: "Arigatou gozaimasu. Mata douzo.",
        english: "Thank you. Please come again.",
      },
    ],
  },

  {
    id: "directions",
    title: "道を聞く",
    titleEn: "Asking for Directions",
    icon: "🗺️",
    description: "You are lost. Stop someone politely and ask the way to the station.",
    lines: [
      {
        role: "user",
        text: "すみません、駅はどこですか。",
        romaji: "Sumimasen, eki wa doko desu ka.",
        english: "Excuse me, where is the station?",
        task: "Stop someone politely and ask where the station is.",
        answers: [
          "すみません、駅はどこですか。",
          "すみません、えきはどこですか。",
          "すみません、駅はどこでしょうか。",
        ],
      },
      {
        role: "partner",
        text: "駅ですか。この道[みち]をまっすぐ行[い]ってください。",
        romaji: "Eki desu ka. Kono michi o massugu itte kudasai.",
        english: "The station? Go straight down this road, please.",
      },
      {
        role: "user",
        text: "まっすぐですね。駅は遠いですか。",
        romaji: "Massugu desu ne. Eki wa tooi desu ka.",
        english: "Straight ahead, got it. Is the station far?",
        task: "Confirm ('straight, right?') and ask if it's far.",
        answers: [
          "まっすぐですね。駅は遠いですか。",
          "はい、まっすぐですね。遠いですか。",
          "まっすぐですね。遠いですか。",
        ],
      },
      {
        role: "partner",
        text: "いいえ、近[ちか]いですよ。歩[ある]いて5分ぐらいです。",
        romaji: "Iie, chikai desu yo. Aruite gofun gurai desu.",
        english: "No, it's close. About five minutes on foot.",
      },
      {
        role: "user",
        text: "わかりました。どうもありがとうございます。",
        romaji: "Wakarimashita. Doumo arigatou gozaimasu.",
        english: "I understand. Thank you very much.",
        task: "Say you understand and thank them.",
        answers: [
          "わかりました。ありがとうございます。",
          "わかりました。どうもありがとうございます。",
          "はい、わかりました。ありがとう。",
        ],
      },
      {
        role: "partner",
        text: "どういたしまして。気[き]をつけてください。",
        romaji: "Douitashimashite. Ki o tsukete kudasai.",
        english: "You're welcome. Take care.",
      },
    ],
  },
];
