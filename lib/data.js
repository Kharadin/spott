// Event Categories
export const CATEGORIES = [
  {
    id: "tech",
    label: "Технологии",
    icon: "💻",
    description: "Технические митапы, хакатоны, конференции",
  },
  {
    id: "music",
    label: "Музыка",
    icon: "🎵",
    description: "Концерты, фестивали, выступления",
  },
  {
    id: "physical",
    label: "Физкультура",
    icon: "🏃",
    description: "Мероприятия для физического зроровья и развития",
  },
  {
    id: "art",
    label: "Искусство",
    icon: "🎨",
    description: "Выставки искусства, культурные события, креативные семинары",
  },
  {
    id: "food",
    label: "Еда и напитки",
    icon: "🥦",
    description: "Фестивали еды, классы кулинарии",
  },
  {
    id: "business",
    label: "Бизнес",
    icon: "💼",
    description: "Бизнес-встречи, конференции, стартапы",
  },
  {
    id: "energyNspiritual",
    label: "Энерго и духовность",
    icon: "🧘",
    description: "Йога, медитация, Цигун, и другие практики",
  },
  {
    id: "education",
    label: "Образование",
    icon: "📚",
    description: "Семинары, занятия и другие обучающие мероприятия",
  },
  {
    id: "psychology",
    label: "Психология",
    icon: "Ψ",
    description: "Психология, психотерапия, психологические тренинги и семинары",
  },
  {
    id: "networking",
    label: "Нетворкинг",
    icon: "🤝",
    description: "Профессиональный нетворкинг и знакомства",
  },
  {
    id: "outdoor",
    label: "Природа и приключения",
    icon: "🏕️",
    description: "Походы, кэмпинг, мероприятия на природе",
  },
  {
    id: "community",
    label: "Коммьюнити",
    icon: "👥",
    description: "Собрания местного коммьюнити и социальные мероприятия",
  },
];

// Get category by ID
export const getCategoryById = (id) => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// Get category label by ID
export const getCategoryLabel = (id) => {
  const category = getCategoryById(id);
  return category ? category.label : id;
};

// Get category icon by ID
export const getCategoryIcon = (id) => {
  const category = getCategoryById(id);
  return category ? category.icon : "📅";
};