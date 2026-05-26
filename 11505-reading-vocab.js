/* 閱讀三篇共用字庫（須在 11505-review.js 之後載入） */
(function () {
  const V = window.Review && window.Review.V;
  if (!V) {
    window.READING11505_VOCAB = {};
    return;
  }
  window.READING11505_VOCAB = {
  internet: V(3, 'n.', '網際網路', '/ˈɪntərnet/', 'rely on the internet', 'The world relies on the internet.'),
  hackers: V(4, 'n.', '駭客', '/ˈhækərz/', 'black hat hackers', 'Hackers divide into three groups.', 'hacker'),
  cybercriminals: V(5, 'n.', '網路罪犯', '/ˈsaɪbərˌkrɪmɪnlz/', 'cybercriminals steal data', 'Black hats are cybercriminals.', 'cybercriminal'),
  ethical: V(4, 'adj.', '合乎道德的', '/ˈeθɪkl/', 'ethical hackers', 'White hats are ethical hackers.'),
  nemesis: V(5, 'n.', '剋星；對手', '/ˈneməsɪs/', 'act like their nemesis', 'White hats act like black hats.'),
  unpredictable: V(4, 'adj.', '難以預測的', '/ˌʌnprɪˈdɪktəbl/', 'unpredictable figures', 'Gray hats are unpredictable.'),
  barbell: V(5, 'n.', '槓鈴', '/ˈbɑːrbel/', 'barbell strategy', 'The barbell strategy balances extremes.'),
  investors: V(4, 'n.', '投資人', '/ɪnˈvestərz/', 'investors stay away', 'Investors avoid the middle ground.', 'investor'),
  bonds: V(4, 'n.', '債券', '/bɑːndz/', 'government bonds', 'Safe choices include bonds.', 'bond'),
  layoffs: V(5, 'n.', '裁員', '/ˈleɪɔːfs/', 'sudden layoffs', 'Office jobs risk sudden layoffs.', 'layoff'),
  stagnation: V(5, 'n.', '停滯', '/stæɡˈneɪʃn/', 'mental stagnation', 'Day jobs may cause stagnation.'),
  pitcher: V(4, 'n.', '豬籠（捕蟲器）', '/ˈpɪtʃər/', 'pitcher plants', 'Tropical pitcher plants trap prey.'),
  nutrient: V(4, 'adj.', '營養的', '/ˈnuːtriənt/', 'nutrient-poor', 'They grow in nutrient-poor soil.'),
  extinction: V(4, 'n.', '滅絕', '/ɪkˈstɪŋkʃn/', 'in danger of extinction', 'The plant faces extinction.'),
  overharvesting: V(5, 'n.', '過度採集', '/ˌoʊvərˈhɑːrvɪstɪŋ/', 'due to overharvesting', 'Overharvesting threatens the species.')
};
})();
