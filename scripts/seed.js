const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing keys!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// مقالات تجريبية لكل قسم - 2-3 مقالات لكل قسم
const dummyPosts = [
  // ===== الأدب =====
  {
    title: "صدى الآلة في أروقة الروح: هل تحلم الحواسيب بالشعر؟",
    slug: "echoes-of-the-machine-lit",
    category: "literature",
    cover_image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=900",
    content: "<h2>مقدمة في فلسفة العصر الحديث</h2><p>في زحام العالم الرقمي، حيث تتسارع البيانات في شرايين من السيليكون، نقف للحظة لنتساءل: هل يمكن للآلة أن تستوعب عمق الشعور البشري؟</p><p>نحن لا نكتب الكود فقط لنصنع برامج، بل لنبني جسوراً بين المنطق الصارم والخيال اللامحدود. الكلمة تنبع من الألم قبل أن تنبع من القلم.</p>"
  },
  {
    title: "رسائل إلى مدينة لم أزرها بعد",
    slug: "letters-to-unvisited-city",
    category: "literature",
    cover_image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=900",
    content: "<h2>يا مدينة الأحلام</h2><p>أكتب إليكِ من على حافة مدينتي، حيث الشوارع تعرف خطواتي وتملّ منها. أكتب إليكِ لأنكِ في كل قصيدة لم أكتبها بعد، في كل صورة لم تُلتقط.</p><p>هل انتظرتِ من لم يأتِ قط؟ أم أنكِ تعوّدتِ أن تكوني في القلب قبل الخطوة؟</p>"
  },
  {
    title: "الاستعارة كأسلوب حياة: حين نتحدث بلغة الصور",
    slug: "metaphor-as-lifestyle",
    category: "literature",
    cover_image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=900",
    content: "<h2>اللغة تصنع الواقع</h2><p>لا نقول \"أنا حزين\" فقط، بل نقول \"قلبي كالحجر في قاع بحيرة جامدة\". الاستعارة ليست زينة للكلام، إنها طريقة التفكير الأولى التي تعلّمها الإنسان قبل أن يعرف المنطق.</p>"
  },

  // ===== التقنية =====
  {
    title: "مستقبل الذكاء الاصطناعي: بين طموح الآلة وعجز اللغة",
    slug: "future-of-ai-tech",
    category: "tech",
    cover_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=900",
    content: "<h2>حدود الوعي المصطنع</h2><p>نحن نعلم الآلة كيف تقرأ وتكتب، ولكن متى ستتعلم كيف تفهم؟ في هذا المقال نستعرض التحديات التقنية لنمذجة العقل البشري.</p><pre><code>console.log('مرحباً بالعالم.. هل من أحد هنا؟');</code></pre>"
  },
  {
    title: "WebAssembly: الثورة الصامتة التي تُعيد بناء الويب",
    slug: "webassembly-silent-revolution",
    category: "tech",
    cover_image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=900",
    content: "<h2>ما وراء JavaScript</h2><p>منذ عقود وJavaScript هي اللغة الوحيدة التي يفهمها المتصفح. الآن WebAssembly يفتح الباب أمام لغات مثل Rust وC++ لتعمل في البيئة ذاتها بسرعة تقترب من السرعة الحقيقية للمعالج.</p>"
  },
  {
    title: "أمان التطبيقات في عصر API-First: دليل المطوّر",
    slug: "api-security-guide",
    category: "tech",
    cover_image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=900",
    content: "<h2>الحماية من الداخل</h2><p>كل نقطة API هي باب محتمل للاختراق. نتعلم اليوم كيف نصمم نظام مصادقة حديثاً يعتمد على JWT وRole-based Access Control دون التضحية بتجربة المستخدم.</p>"
  },

  // ===== العلم =====
  {
    title: "ميكانيكا الكم وتفسير العوالم المتعددة",
    slug: "quantum-mechanics-sci",
    category: "science",
    cover_image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=900",
    content: "<h2>هل نعيش في عالم واحد؟</h2><p>تفتح ميكانيكا الكم الباب لأسئلة تفوق الخيال العلمي، حيث كل تفاعل كمي قد يخلق كوناً موازياً يعيش فيه انعكاسنا الآخر.</p>"
  },
  {
    title: "النيوروبلاستيسيتي: دماغك يتغير كل يوم",
    slug: "neuroplasticity-brain",
    category: "science",
    cover_image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=900",
    content: "<h2>العقل قابل للإعادة البرمجة</h2><p>كنا نعتقد أن الدماغ يكتمل بعد سن الطفولة. العلم الحديث كشف عكس ذلك تماماً - الخلايا العصبية تبني روابط جديدة في كل لحظة تعلّم فيها شيئاً مختلفاً.</p>"
  },

  // ===== الفن =====
  {
    title: "فلسفة الألوان في الفن الانطباعي: رقصة الضوء",
    slug: "philosophy-of-colors-art",
    category: "art",
    cover_image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=900",
    content: "<h2>تجاوز الواقع بالخيال</h2><p>لم يكن هدف الانطباعيين رسم الواقع كما هو، بل رسم إحساسهم باللحظة، وكيف يتلاعب الضوء بالألوان في أجزاء من الثانية.</p>"
  },
  {
    title: "موسيقى العمارة: حين تُصبح المباني قصائد حجرية",
    slug: "architecture-as-music",
    category: "art",
    cover_image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=900",
    content: "<h2>الإيقاع والتناسق في الفضاء</h2><p>قال المعماري الشهير Le Corbusier ذات مرة: \"العمارة موسيقى متجمدة في الزمن\". الأعمدة المتكررة إيقاع، والأقواس لحن، والفضاء الفارغ صمت موسيقي لا يقل أهمية عن النغمة.</p>"
  },
];

async function resetAndSeed() {
  console.log("⚠️  Clearing old dummy articles...");

  // حذف المقالات القديمة بالـ slugs المعروفة لتجنب التكرار
  const slugsToDelete = dummyPosts.map(p => p.slug);
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .in('slug', slugsToDelete);

  if (deleteError) {
    console.error("Error deleting:", deleteError.message);
  } else {
    console.log("✅ Old dummy articles cleared.");
  }

  console.log("\n📝 Inserting fresh articles...");
  let count = 0;
  for (const post of dummyPosts) {
    const { error } = await supabase.from('posts').insert([post]);
    if (error) {
      console.error(`❌ Error inserting: ${post.title}`, error.message);
    } else {
      console.log(`✅ [${post.category}] ${post.title}`);
      count++;
    }
  }
  console.log(`\n🎉 Successfully published ${count}/${dummyPosts.length} articles!`);
}

resetAndSeed();
