
// Words with positive sentiment
const POSITIVE_WORDS = new Set([
  'happy', 'joy', 'excited', 'great', 'good', 'wonderful', 'amazing',
  'fantastic', 'pleased', 'delighted', 'grateful', 'thankful', 'love',
  'enjoy', 'positive', 'optimistic', 'hopeful', 'confident', 'proud',
  // Additional positive words can be added here
  'accomplished', 'achievement', 'admire', 'appreciate', 'beautiful',
  'blessed', 'brilliant', 'celebrate', 'cheerful', 'comfortable',
  'courage', 'creative', 'determined', 'eager', 'energetic',
  'enthusiastic', 'excellent', 'exceptional', 'friendly', 'fulfilled',
  'generous', 'genuine', 'glorious', 'growth', 'honored',
  'inspired', 'inspiring', 'kind', 'laughter', 'loved',
  'meaningful', 'motivated', 'peaceful', 'perfect', 'pleasant',
  'productive', 'relaxed', 'relieved', 'respected', 'satisfied',
  'sincere', 'success', 'supportive', 'thrilled', 'valued'
]);

// Words with negative sentiment
const NEGATIVE_WORDS = new Set([
  'sad', 'angry', 'upset', 'frustrated', 'disappointed', 'worried',
  'anxious', 'stressed', 'depressed', 'unhappy', 'miserable', 'hate',
  'terrible', 'awful', 'bad', 'negative', 'pessimistic', 'hopeless',
  // Additional negative words can be added here
  'abandoned', 'afraid', 'agitated', 'alone', 'annoyed',
  'ashamed', 'betrayed', 'bitter', 'bored', 'broken',
  'confused', 'crushed', 'defeated', 'desperate', 'devastated',
  'disappointed', 'discouraged', 'disgusted', 'distressed', 'disturbed',
  'drained', 'embarrassed', 'empty', 'exhausted', 'fearful',
  'fragile', 'guilty', 'helpless', 'hurt', 'ignored',
  'inadequate', 'insecure', 'irritated', 'isolated', 'jealous',
  'lonely', 'lost', 'nervous', 'overwhelmed', 'painful',
  'rejected', 'regretful', 'scared', 'suffering', 'troubled'
]);

// Words that intensify sentiment
const INTENSITY_WORDS = new Set([
  'very', 'extremely', 'incredibly', 'really', 'so', 'absolutely',
  'completely', 'totally', 'utterly', 'deeply', 'profoundly',
  // Additional intensity words can be added here
  'especially', 'exceptionally', 'extraordinarily', 'highly', 'immensely',
  'intensely', 'particularly', 'remarkably', 'seriously', 'substantially',
  'thoroughly', 'tremendously', 'unbelievably', 'undoubtedly', 'vastly'
]);

// Common words to exclude from tracking (stop words)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
  'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'we', 'us', 'our', 'ours', 'ourselves', 'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'would', 'should', 'could', 'ought', 'will', 'shall', 'can', 'may', 'might',
  'must', 'in', 'of', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
]);

// Words specifically indicating distress (subset of negative words)
const DISTRESS_WORDS = new Set([
  'sad', 'angry', 'depressed', 'hopeless', 'miserable',
  'stressed', 'unhappy', 'anxious', 'frustrated',
  'overwhelmed', 'exhausted', 'worried', 'afraid', 'scared',
  'lonely', 'isolated', 'helpless', 'desperate', 'suicidal'
]);

// Words specifically indicating uplift/positive reflection
const UPLIFT_WORDS = new Set([
  'grateful', 'thankful', 'joy', 'hopeful',
  'optimistic', 'proud', 'confident', 'happy',
  'blessed', 'inspired', 'peaceful', 'accomplished',
  'fulfilled', 'appreciated', 'loved', 'supported'
]);

module.exports = {
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  INTENSITY_WORDS,
  STOP_WORDS,
  DISTRESS_WORDS,
  UPLIFT_WORDS
};
