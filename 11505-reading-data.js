/* 11505 閱讀測驗｜三篇文章資料 */
window.READING11505 = {
  hackers: {
    key: 'hackers',
    title: '駭客三帽',
    range: '35～38',
    file: '11505-Reading35-38.html',
    prev: null,
    next: '11505-Reading39-42.html',
    fullTranslation:
      '現代世界高度依賴網際網路。這條資訊高速公路雖能即時通訊，也充滿危險。駭客用進階技術突破資安，依意圖分黑帽、白帽、灰帽：黑帽竊取資料；白帽受雇攻擊自家系統以修補漏洞；灰帽未必為惡但仍可能違法。',
    sentences: [
      { id: 'h0', html: 'The modern world relies heavily on the {internet}.', trans: '現代世界高度依賴網際網路。' },
      {
        id: 'h1',
        html: 'This vast digital network is often referred to as the information superhighway.',
        trans: '這龐大的數位網路常被稱為資訊高速公路。'
      },
      {
        id: 'h2',
        html: 'While this virtual highway allows users to communicate across the globe instantly, it is also filled with hidden dangers.',
        trans: '雖然這條虛擬高速公路讓使用者能瞬間與全球溝通，但它也充滿隱藏的危險。'
      },
      {
        id: 'h3',
        html: 'Among the most discussed figures in this online space are {hackers}.',
        trans: '在這個網路空間裡，最受討論的人物之一就是駭客。'
      },
      {
        id: 'h4',
        html: 'A hacker is essentially a person who uses advanced computer skills to overcome digital security barriers.',
        trans: '駭客基本上是指運用進階電腦技術來突破數位安全防線的人。'
      },
      {
        id: 'h5',
        html: 'However, not all hackers are villains. Their intentions divide them into three distinct groups, which are commonly identified by the "colors" of imaginary hats.',
        trans: '然而，並非所有駭客都是反派；他們的意圖把他們分成三個不同群體，通常以想像中的帽子顏色來區分。'
      },
      {
        id: 'h6',
        html: 'The most dangerous group is the black hat hackers. These are the {cybercriminals} that most people fear.',
        trans: '最危險的是黑帽駭客，也就是多數人害怕的網路罪犯。'
      },
      {
        id: 'h7',
        html: 'They break into computer systems to steal sensitive data, such as credit card numbers or passwords.',
        trans: '他們入侵電腦系統，竊取信用卡號或密碼等敏感資料。'
      },
      {
        id: 'h8',
        html: 'On the opposite side are the white hat hackers, also known as {ethical} hackers.',
        trans: '相對地，另一邊是白帽駭客，也稱為道德駭客。'
      },
      {
        id: 'h9',
        html: 'Large technology companies and banks hire them to deliberately "attack" their own networks.',
        trans: '大型科技公司與銀行會雇用他們，刻意「攻擊」自己的網路。'
      },
      {
        id: 'h10',
        html: 'By acting like their {nemesis}, white hat hackers can find unexpected weaknesses and fix them before the real bad guys have a chance to enter.',
        trans: '白帽駭客藉由扮演他們的宿敵，能在真正的壞人趁虛而入之前，找出意想不到的弱點並加以修補。'
      },
      { id: 'h11', html: 'Between these two extremes are gray hat hackers.', trans: '在這兩個極端之間，則是灰帽駭客。' },
      {
        id: 'h12',
        html: 'Unlike black hats, they generally do not want to steal money or cause damage.',
        trans: '與黑帽不同，他們通常並不想偷錢或造成破壞。'
      },
      {
        id: 'h13',
        html: 'Although their intent might not be evil, their actions can still be illegal, making them {unpredictable} figures in the digital world.',
        trans: '雖然他們的意圖未必邪惡，但行為仍可能違法，使他們成為數位世界中難以預測的角色。'
      }
    ],
    questions: [
      {
        no: 35,
        answer: 'C',
        prompt: 'Which statement is true?',
        evidenceIds: ['h13'],
        options: [
          ['A', 'White hats use more advanced tech than black hats.'],
          ['B', 'Black hats steal data mainly to prove skills.'],
          ['C', 'Gray hats may act unlawfully even when exposing flaws.'],
          ['D', 'All three types are illegal regardless of intent.']
        ],
        explain: {
          A: '文中未比較兩者技術高低。',
          B: '黑帽動機是竊取資料或惡意破壞，不是為了證明技術。',
          C: '✅ 灰帽即使意圖未必邪惡，行為仍可能 illegal。',
          D: '白帽是合法受雇修補漏洞，不是三者皆非法。'
        }
      },
      {
        no: 36,
        answer: 'A',
        prompt:
          'Which paragraph should end with: "Recognizing these differences enables governments and organizations to adopt more targeted cybersecurity strategies."?',
        evidenceIds: ['h5'],
        options: [
          ['A', 'Paragraph 1'],
          ['B', 'Paragraph 2'],
          ['C', 'Paragraph 3'],
          ['D', 'Paragraph 4']
        ],
        explain: {
          A: '✅ 第一段末說明三類駭客的「差異」，與 these differences 呼應。',
          B: '第二段聚焦黑帽，非總述差異。',
          C: '第三段聚焦白帽。',
          D: '第四段聚焦灰帽。'
        }
      },
      {
        no: 37,
        answer: 'B',
        prompt: 'What does "their nemesis" refer to?',
        evidenceIds: ['h10', 'h6'],
        options: [
          ['A', 'Ethical hackers.'],
          ['B', 'Cybercriminals.'],
          ['C', 'Computer experts.'],
          ['D', 'Security agencies.']
        ],
        explain: {
          A: '白帽就是 ethical hackers，不會是自己的 nemesis。',
          B: '✅ 白帽模仿會入侵系統的網路罪犯（黑帽）來找漏洞。',
          C: '太廣，非文中對比對象。',
          D: '文中未提及安全部門。'
        }
      },
      {
        no: 38,
        answer: 'D',
        prompt: 'Which diagram shows the relationship among three types of hackers?（原題為圖）',
        evidenceIds: ['h6', 'h8', 'h11', 'h12', 'h13'],
        options: [
          ['A', '(A)'],
          ['B', '(B)'],
          ['C', '(C)'],
          ['D', '(D)']
        ],
        explain: {
          A: '圖題請對照教師版示意圖。',
          B: '圖題請對照教師版示意圖。',
          C: '圖題請對照教師版示意圖。',
          D: '✅ 教師版：白帽合法修補；黑帽惡意；灰帽可能違法但動機未必邪惡。'
        }
      }
    ]
  },

  barbell: {
    key: 'barbell',
    title: '槓鈴策略',
    range: '39～42',
    file: '11505-Reading39-42.html',
    prev: '11505-Reading35-38.html',
    next: '11505-Reading43-46.html',
    fullTranslation:
      '槓鈴策略把多數資金放極安全標的、少數押高風險高報酬。職場槓鈴則是一端穩定日間工作、一端高風險創意副業；穩定收入來自 day job，創意追求才是高風險端。',
    sentences: [
      {
        id: 'b0',
        html: 'In finance, there is a unique approach to investing called the {barbell} strategy.',
        trans: '在金融領域，有一種獨特的投資方法稱為槓鈴策略。'
      },
      {
        id: 'b1',
        html: 'It advises {investors} to stay away from the "middle ground," a dangerous zone where investments carry a moderate amount of risk but offer only average returns.',
        trans: '它建議投資人遠離「中間地帶」——那是一個投資帶有中等風險、卻只能提供普通報酬的危險區域。'
      },
      {
        id: 'b2',
        html: 'A person following the barbell strategy places the majority of their money, up to 90 percent, into extremely safe choices, such as cash or government {bonds}.',
        trans: '採用槓鈴策略的人會把大部分資金（最高達百分之九十）投入極安全的選擇，例如現金或政府公債。'
      },
      {
        id: 'b3',
        html: 'The remaining portion is then used for high-risk investments that have a small chance of exploding in value.',
        trans: '其餘部分則用於高風險投資，這類投資只有很小的機會能讓價值暴增。'
      },
      {
        id: 'b4',
        html: 'Interestingly, this theory is also being used to describe a growing trend in the modern workplace: the barbell career.',
        trans: '有趣的是，這套理論也被用來描述現代職場中日益增長的趨勢：槓鈴式生涯。'
      },
      {
        id: 'b5',
        html: 'Modern experts argue that a typical 9-to-5 office job isn\'t as safe as it once might have been.',
        trans: '現代專家認為，典型的朝九晚五辦公室工作，已不像過去那麼安全。'
      },
      {
        id: 'b6',
        html: 'In a changing economy, such roles carry the hidden risk of sudden {layoffs} and often limit personal freedom.',
        trans: '在變動的經濟中，這類工作隱含突然裁員的風險，且往往限制個人自由。'
      },
      {
        id: 'b7',
        html: 'One end of the barbell is a "day job" that generates a steady income but might lead to mental {stagnation} after hours of work.',
        trans: '槓鈴的一端是帶來穩定收入的「日間工作」，但長時間工作後可能導致心智停滯。'
      },
      {
        id: 'b8',
        html: 'The other end is a high-risk, potentially high-reward pursuit, such as writing a novel or developing an app.',
        trans: '另一端則是高風險、可能高報酬的追求，例如寫小說或開發應用程式。'
      }
    ],
    questions: [
      {
        no: 39,
        answer: 'D',
        prompt: 'What can be inferred about barbell strategy in investing?',
        evidenceIds: ['b3'],
        options: [
          ['A', 'It eliminates all financial risks.'],
          ['B', 'Moderate-risk investments produce high returns.'],
          ['C', 'Safe investments alone are sufficient for long-term growth.'],
          ['D', 'A small amount of risky investments may yield a massive reward.']
        ],
        explain: {
          A: '策略仍包含高風險部分，無法消除所有風險。',
          B: '文中說 middle ground 只有 average returns。',
          C: '仍需少部分高風險投資，非只靠安全標的。',
          D: '✅ 小部分高風險若成功，報酬可能改變人生。'
        }
      },
      {
        no: 40,
        answer: 'C',
        prompt: 'Which question can the passage answer?',
        evidenceIds: ['b5', 'b6'],
        options: [
          ['A', 'Who invented the term?'],
          ['B', 'How many people adopted barbell careers?'],
          ['C', 'Why might day jobs be considered potentially risky?'],
          ['D', 'What economic changes influenced modern careers?']
        ],
        explain: {
          A: '文中未提及誰發明術語。',
          B: '未提供採用者人數。',
          C: '✅ 文章說 9-to-5 工作有 sudden layoffs 等隱藏風險。',
          D: '只泛稱 changing economy，未列具體變化。'
        }
      },
      {
        no: 41,
        answer: 'B',
        prompt: 'Closest meaning to "lead to mental stagnation"?',
        evidenceIds: ['b7'],
        options: [
          ['A', 'Promote intellectual growth.'],
          ['B', 'Cause the mind to become dull.'],
          ['C', 'Trigger emotional instability.'],
          ['D', 'Encourage spiritual reflection.']
        ],
        explain: {
          A: 'stagnation 與 growth 相反。',
          B: '✅ stagnation = 停滯、遲鈍。',
          C: '未談情緒不穩。',
          D: '未談精神反思。'
        }
      },
      {
        no: 42,
        answer: 'D',
        prompt: 'Which is NOT true about barbell careers?',
        evidenceIds: ['b7', 'b8'],
        options: [
          ['A', 'They involve two contrasting work roles.'],
          ['B', 'Passion projects carry considerable risks but significant benefits.'],
          ['C', 'They offer financial stability while enabling ambitions.'],
          ['D', 'Creative pursuits are viewed as a stable source of income for daily expenses.']
        ],
        explain: {
          A: '文中有 day job 與 creative pursuit 兩端。',
          B: 'high-risk, potentially high-reward 呼應。',
          C: '穩定與冒險並存呼應槓鈴概念。',
          D: '✅ 穩定收入來自 day job，創意端是高風險，非日常開銷來源。'
        }
      }
    ]
  },

  pitcher: {
    key: 'pitcher',
    title: '熱帶豬籠草',
    range: '43～46',
    file: '11505-Reading43-46.html',
    prev: '11505-Reading39-42.html',
    next: null,
    fullTranslation:
      '熱帶豬籠草能在貧瘠環境生存，以瓶狀豬籠捕蟲。昆蟲被蜜汁與色彩吸引落入後，蠟質內壁使其難以逃脫。人類採食豬籠草飯使物種面臨過度採集威脅。',
    sentences: [
      {
        id: 'p0',
        html: 'Scientifically classified under the genus Nepenthes, they are more commonly known as tropical {pitcher} plants.',
        trans: '在科學上分類於豬籠草屬（Nepenthes），它們更常被人稱為熱帶豬籠草。'
      },
      {
        id: 'p1',
        html: 'They are able to survive in {nutrient}-poor environments, such as sandy soils and volcanic regions.',
        trans: '它們能在營養貧瘠的環境中生存，例如沙質土壤與火山地區。'
      },
      {
        id: 'p2',
        html: 'The plant\'s structure resembles a hollow pitcher extending from a long leaf, with a protective lid above the opening and a rim known as the lip.',
        trans: '植株結構像從長葉延伸出的中空豬籠，開口上方有保護蓋，邊緣稱為唇緣。'
      },
      {
        id: 'p3',
        html: 'Insects and small animals that fall into the plant\'s large "pitcher" are often attracted by its nectar, smell, or vibrant colors.',
        trans: '落入巨大豬籠的昆蟲與小動物，往往被蜜汁、氣味或鮮豔色彩所吸引。'
      },
      {
        id: 'p4',
        html: 'Once an animal falls inside, liquid surrounds the prey, and escape is almost impossible due to the waxy inner walls.',
        trans: '一旦動物掉入其中，液體會包圍獵物，而蠟質的內壁也使逃脫幾乎不可能。'
      },
      {
        id: 'p5',
        html: 'The resulting treat has proven so tasty that the tropical pitcher plant is in danger of {extinction} due to {overharvesting}.',
        trans: '這種由此產生的「美食」已被證明非常可口，以致熱帶豬籠草因過度採集而面臨滅絕危機。'
      }
    ],
    questions: [
      {
        no: 43,
        answer: 'B',
        prompt: 'Which picture best represents the tropical pitcher plant?（原題為圖片題）',
        evidenceIds: ['p2'],
        options: [
          ['A', '一般闊葉植物'],
          ['B', '瓶狀捕蟲器，上有蓋與唇緣'],
          ['C', '仙人掌'],
          ['D', '藤蔓']
        ],
        explain: {
          A: '非中空豬籠結構。',
          B: '✅ 原文描述 hollow pitcher、lid、lip。',
          C: '與豬籠草結構不符。',
          D: '雖有 long leaf，關鍵是 pitcher trap。'
        }
      },
      {
        no: 44,
        answer: 'C',
        prompt: 'How is the passage organized?',
        evidenceIds: ['p0', 'p2', 'p4', 'p5'],
        options: [
          ['A', 'Background → Function → Impact'],
          ['B', 'Comparison → Process → Application'],
          ['C', 'Introduction → Mechanism → Threats'],
          ['D', 'Overview → Classification → Conclusion']
        ],
        explain: {
          A: 'Impact 可算，但 mechanism 更精準。',
          B: '非 comparison 開頭。',
          C: '✅ 介紹 → 捕蟲機制 → 人類採集威脅。',
          D: 'Classification 非主軸。'
        }
      },
      {
        no: 45,
        answer: 'A',
        prompt: 'Idiom closest to "in danger of extinction"?',
        evidenceIds: ['p5'],
        options: [
          ['A', 'On its last legs.'],
          ['B', 'In hot water.'],
          ['C', 'Back on track.'],
          ['D', 'Under the weather.']
        ],
        explain: {
          A: '✅ on its last legs = 瀕臨消失。',
          B: '陷入麻煩，未必指滅絕。',
          C: '恢復正常。',
          D: '身體不舒服。'
        }
      },
      {
        no: 46,
        answer: 'C',
        prompt: 'Which statement is true?',
        evidenceIds: ['p1', 'p4'],
        options: [
          ['A', 'They depend on dry weather to capture prey.'],
          ['B', 'Sticky inner walls trap insects.'],
          ['C', 'They are adapted to grow in areas with limited nutrients.'],
          ['D', 'They absorb nutrients from liquids produced by prey.']
        ],
        explain: {
          A: '文中強調 waxy walls 與 liquid，非 depend on dry。',
          B: '是 waxy inner walls，非 sticky。',
          C: '✅ nutrient-poor environments 呼應 limited nutrients。',
          D: '養分來自捕獲獵物，非 prey-produced liquids 為主。'
        }
      }
    ]
  }
};
