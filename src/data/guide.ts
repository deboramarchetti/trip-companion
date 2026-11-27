/**
 * "Vietnã 101" — editorial mini-guide about Vietnam (Portuguese).
 * Static content, shipped with the app (works offline, no API/LLM at runtime).
 * Every statistic carries its reference period, a definition when needed and a source id.
 * Figures are a snapshot reviewed on `reviewedAt`; they are NOT updated automatically.
 */

export const reviewedAt = 'novembro de 2026';

/* ---------------------------------------------------------------- sources */
export interface GuideSource { id: string; label: string; detail: string; url: string }
export const sources: GuideSource[] = [
  { id: 'nso-2025', label: 'National Statistics Office (Vietnã)', detail: 'Situação socioeconômica do 4º trimestre e de 2025', url: 'https://www.nso.gov.vn/en/data-and-statistics/2026/01/socio-economic-situation-in-the-fourth-quarter-and-2025/' },
  { id: 'nso-9m-2026', label: 'National Statistics Office (Vietnã)', detail: 'Desempenho socioeconômico do 3º trimestre e dos nove primeiros meses de 2026', url: 'https://www.nso.gov.vn/en/data-and-statistics/2026/11/report-socio-economic-performance-in-the-third-quarter-and-the-nine-months-of-2026/' },
  { id: 'wb', label: 'Banco Mundial', detail: 'Perfil do Vietnã', url: 'https://www.worldbank.org/ext/en/country/vietnam' },
  { id: 'unesco-vn', label: 'UNESCO', detail: 'Patrimônios Mundiais do Vietnã', url: 'https://whc.unesco.org/en/statesparties/vn/' },
  { id: 'unesco-trang-an', label: 'UNESCO', detail: 'Complexo Paisagístico de Tràng An', url: 'https://whc.unesco.org/en/list/1438/' },
  { id: 'vt-etiquette', label: 'Vietnam Travel (turismo oficial)', detail: 'Etiqueta vietnamita para viajantes', url: 'https://vietnam.travel/things-to-do/vietnamese-etiquette-travellers/' },
  { id: 'vt-coffee', label: 'Vietnam Travel (turismo oficial)', detail: 'A arte do café vietnamita', url: 'https://vietnam.travel/things-to-do/secret-art-vietnamese-coffee/' },
  { id: 'religion-vn', label: 'Portal do governo sobre religião', detail: 'Crenças, religiões e aplicação da lei no Vietnã', url: 'https://religion.vn/research/belief-religion-and-implementation-of-state-laws-on-belief-religion-in-vietnam-post2gn6zvZn4E.html' },
];

/* ------------------------------------------------------------- sections */
export const sections = [
  { id: 'numeros', chip: 'Em números' },
  { id: 'economia', chip: 'Economia' },
  { id: 'vida', chip: 'Qualidade de vida' },
  { id: 'historia', chip: 'História' },
  { id: 'crencas', chip: 'Crenças' },
  { id: 'ruas', chip: 'Vida nas ruas' },
  { id: 'cafe', chip: 'Café' },
  { id: 'comida', chip: 'Comida' },
  { id: 'regioes', chip: 'Regiões' },
  { id: 'cidades', chip: 'Cidades' },
  { id: 'etiqueta', chip: 'Etiqueta' },
  { id: 'curiosidades', chip: 'Você sabia?' },
  { id: 'idioma', chip: 'Vietnamita' },
  { id: 'pratico', chip: 'Prático' },
] as const;
export type SectionId = (typeof sections)[number]['id'];

/* ----------------------------------------------------------------- stats */
export interface Stat {
  id: string;
  label: string;
  /** Numeric value, formatted in pt-BR by the UI… */
  value?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** …or a text value. */
  text?: string;
  /** Reference period ("2025", "jan–set 2026"). */
  period?: string;
  /** Definition / methodology in one line. */
  note?: string;
  sourceId?: string;
}

export const intro = {
  lead: 'Um país de mais de 100 milhões de habitantes que saiu de décadas de guerra e pobreza para se tornar uma das economias industriais mais dinâmicas da Ásia.',
  hero: 'Do Delta do Rio Vermelho ao Delta do Mekong, são cerca de 1.650 km de norte a sul, séculos de história e uma economia que mudou de patamar em uma geração. Este guia é para ler no café, no barco ou no trânsito, sem internet.',
};

/** The big-number strip right under the hero. */
export const headline: Stat[] = [
  { id: 'pop', label: 'Habitantes', value: 102.3, decimals: 1, suffix: ' mi', period: '2025', sourceId: 'nso-2025' },
  { id: 'gdp-growth', label: 'Crescimento real do PIB', value: 8.02, decimals: 2, suffix: '%', period: '2025', sourceId: 'nso-2025' },
  { id: 'tourists', label: 'Chegadas de turistas internacionais', value: 21.2, decimals: 1, suffix: ' mi', period: '2025', sourceId: 'nso-2025' },
  { id: 'ethnic', label: 'Grupos étnicos reconhecidos', value: 54, period: 'classificação oficial' },
];

export const keyFacts: Stat[] = [
  { id: 'pop', label: 'População', value: 102.3, decimals: 1, suffix: ' milhões', period: '2025', sourceId: 'nso-2025' },
  { id: 'capital', label: 'Capital', text: 'Hanói' },
  { id: 'hub', label: 'Maior centro econômico urbano', text: 'Ho Chi Minh City', note: 'Também conhecida como Saigon.' },
  { id: 'currency', label: 'Moeda', text: 'Dong vietnamita (VND)' },
  { id: 'language', label: 'Idioma oficial', text: 'Vietnamita', note: 'Língua tonal escrita em alfabeto latino com sinais diacríticos.' },
  { id: 'ethnic', label: 'Grupos étnicos oficialmente reconhecidos', value: 54, period: 'classificação oficial', note: 'A maioria da população é Kinh; muitos dos outros 53 grupos vivem em regiões montanhosas.' },
  { id: 'gdp-growth', label: 'Crescimento real do PIB', value: 8.02, decimals: 2, suffix: '%', period: '2025', note: 'Variação real (descontada a inflação) em relação a 2024.', sourceId: 'nso-2025' },
  { id: 'gdp-pc', label: 'PIB per capita nominal', value: 5026, prefix: 'US$ ', period: '2025', note: 'Aproximado, em dólares correntes, segundo o órgão estatístico vietnamita.', sourceId: 'nso-2025' },
  { id: 'tourists', label: 'Turistas internacionais', value: 21.2, decimals: 1, suffix: ' milhões de chegadas', period: '2025', note: 'Conta chegadas, não pessoas: quem entra duas vezes conta duas.', sourceId: 'nso-2025' },
  { id: 'life', label: 'Expectativa de vida ao nascer', value: 74.7, decimals: 1, suffix: ' anos', period: '2025', sourceId: 'nso-2025' },
  { id: 'religion', label: 'Religião e espiritualidade', text: 'Budismo e culto aos antepassados', note: 'Forte influência, embora muitas pessoas não declarem religião formal.', sourceId: 'religion-vn' },
];

export const gdpPerCapitaExplainer = {
  title: 'PIB per capita não é salário',
  body: [
    'O PIB per capita divide tudo o que o país produz em um ano pelo número de habitantes, incluindo lucros de empresas, impostos, investimentos e a produção de multinacionais.',
    'Por isso ele não equivale ao que uma pessoa ganha. Para a renda das famílias, veja o indicador de renda média domiciliar na seção Qualidade de vida.',
  ],
};

/* -------------------------------------------------------------- economy */
export const economy = {
  title: 'Como o Vietnã se tornou uma potência industrial?',
  story: [
    'Durante boa parte do século XX, o país atravessou guerras, divisão territorial e anos de dificuldades econômicas, com uma economia centralmente planejada e fechada.',
    'Em 1986, o governo lançou as reformas Đổi Mới ("renovação"): abriu espaço para empresas privadas, passou a atrair capital estrangeiro e integrou o país ao comércio internacional.',
    'O crescimento acelerou nas décadas seguintes e a pobreza caiu drasticamente. Hoje o Vietnã é uma das grandes plataformas de manufatura e exportação da Ásia.',
  ],
  engines: [
    { title: 'Manufatura e exportações', text: 'Eletrônicos, smartphones, computadores, roupas, calçados, móveis e máquinas saem das fábricas vietnamitas para o mundo inteiro.' },
    { title: 'Investimento estrangeiro', text: 'Multinacionais e grandes cadeias globais de suprimentos se instalaram no país. A Samsung é um dos exemplos mais conhecidos.' },
    { title: 'Serviços e consumo interno', text: 'Varejo, logística, transportes, finanças e um mercado consumidor doméstico em expansão.' },
    { title: 'Turismo', text: 'Importante para os serviços, para o emprego e para as receitas locais, das grandes cidades às regiões rurais.' },
    { title: 'Agricultura', text: 'Arroz, café, frutas, pescados e outros produtos, para o mercado interno e para exportação.' },
  ],
  gdpShares: {
    title: 'Composição do PIB',
    period: 'jan–set 2026',
    note: 'Participação de cada setor no PIB (estrutura da economia), e não a contribuição de cada um para o crescimento. Valores somam 100,00%.',
    sourceId: 'nso-9m-2026',
    parts: [
      { id: 'services', label: 'Serviços', value: 42.97, color: 'var(--color-jade)' },
      { id: 'industry', label: 'Indústria e construção', value: 38.35, color: 'var(--color-lacquer)' },
      { id: 'agri', label: 'Agricultura, silvicultura e pesca', value: 10.65, color: 'var(--color-gold)' },
      { id: 'taxes', label: 'Impostos líquidos de subsídios sobre produtos', value: 8.03, color: 'var(--color-ink-3)' },
    ],
  },
  facts: [
    { id: 'growth-9m', label: 'Crescimento real do PIB', value: 9.01, decimals: 2, prefix: '≈ ', suffix: '%', period: 'jan–set 2026', note: 'Comparado aos mesmos nove meses de 2025.', sourceId: 'nso-9m-2026' },
    { id: 'fdi-exports', label: 'Exportações feitas por empresas com capital estrangeiro', value: 77.3, decimals: 1, suffix: '%', period: '2025', note: 'Participação no total das exportações de mercadorias.', sourceId: 'nso-2025' },
    { id: 'umic', label: 'Classificação do Banco Mundial', text: 'Renda média-alta', period: 'julho de 2026', note: 'Reclassificação feita pelo Banco Mundial.', sourceId: 'wb' },
  ] as Stat[],
  vulnerability: 'Por depender muito do comércio global, o país ganha com a abertura, mas também fica exposto a tarifas, crises e mudanças nas cadeias de suprimentos.',
};

/* ---------------------------------------------------------- quality of life */
export const lifeQuality = {
  title: 'De um dos países mais pobres da região à classe média emergente',
  intro: 'Em poucas décadas, milhões de pessoas saíram da pobreza. O avanço é real, mas desigual: depende de onde se vive e de quem se é.',
  indicators: [
    { id: 'poverty-national', label: 'Pobreza multidimensional', value: 1.3, decimals: 1, prefix: '≈ ', suffix: '%', period: '2025', note: 'Critério nacional: considera renda e também privações em saúde, educação, moradia, água e saneamento e acesso à informação. Estimativa divulgada pelo órgão estatístico.', sourceId: 'nso-2025' },
    { id: 'poverty-wb', label: 'Pobreza pela linha internacional', text: 'abaixo de 4%', period: '2025', note: 'Linha do Banco Mundial de US$ 4,20 por pessoa por dia, em paridade de poder de compra de 2021. Definição diferente da nacional: os dois números não são comparáveis entre si.', sourceId: 'wb' },
    { id: 'income', label: 'Renda média mensal por pessoa nos domicílios', value: 5.9, decimals: 1, prefix: '≈ ', suffix: ' milhões de VND', period: '2025', note: 'Renda total do domicílio dividida pelos moradores. Não é o salário médio individual nem o PIB per capita.', sourceId: 'nso-2025' },
  ] as Stat[],
  progress: ['Educação', 'Saúde', 'Acesso à eletricidade', 'Infraestrutura'],
  challenges: [
    { title: 'Cidade × campo', text: 'Há diferenças significativas de renda e serviços entre as grandes cidades e as áreas rurais.' },
    { title: 'Montanhas e minorias', text: 'Regiões montanhosas e alguns grupos étnicos enfrentam maiores vulnerabilidades.' },
    { title: 'Cidades sob pressão', text: 'Urbanização acelerada, trânsito e poluição do ar nas grandes cidades.' },
    { title: 'Envelhecimento', text: 'A população envelhece rápido, o que pressiona saúde e previdência.' },
    { title: 'Clima', text: 'Litoral extenso e deltas baixos tornam o país sensível a tempestades, enchentes e salinização.' },
  ],
};

/* -------------------------------------------------------------- history */
export interface TimelineEvent { id: string; when: string; title: string; text: string; detail?: string }
export const history = {
  title: 'História em 2 minutos',
  events: [
    { id: 'chinese', when: '111 a.C. – 938', title: 'Mil anos de domínio chinês', text: 'Reinos vietnamitas no Delta do Rio Vermelho passam por longos períodos de domínio e influência chinesa.', detail: 'Escrita, confucionismo e administração chinesas marcaram o país, mas houve revoltas famosas, como a das irmãs Trưng (século I). Em 938, Ngô Quyền venceu a batalha do rio Bạch Đằng e abriu caminho para a independência.' },
    { id: 'thang-long', when: '1010', title: 'Thăng Long, a futura Hanói', text: 'A dinastia Lý transfere a capital para Thăng Long, onde hoje fica Hanói.', detail: 'Seguiram-se séculos de dinastias vietnamitas (Lý, Trần, Lê), com o Templo da Literatura e a primeira universidade do país.' },
    { id: 'regions', when: 'Séculos II – XIX', title: 'Um território diverso', text: 'Os reinos Champa ocupavam o centro; o sul tinha presença de culturas khmer.', detail: 'Ao longo dos séculos, os vietnamitas avançaram para o sul (Nam tiến), incorporando terras Champa e, mais tarde, o Delta do Mekong. As torres de My Son e a cultura khmer do Mekong são heranças visíveis dessa diversidade.' },
    { id: 'nguyen', when: '1802', title: 'Dinastia Nguyễn em Huế', text: 'O país é unificado sob a dinastia Nguyễn, com capital em Huế.' },
    { id: 'french', when: 'Século XIX', title: 'Domínio colonial francês', text: 'A França estabelece progressivamente seu domínio, a partir de 1858, até formar a Indochina Francesa.', detail: 'Ferrovias, plantações, a arquitetura colonial e o café vieram nesse período, ao lado de exploração econômica e repressão a movimentos nacionalistas.' },
    { id: '1945', when: '1945', title: 'Independência proclamada', text: 'Ho Chi Minh proclama a independência da República Democrática do Vietnã. A última dinastia imperial termina.' },
    { id: '1954', when: '1954', title: 'Fim da guerra contra a França', text: 'Após a batalha de Điện Biên Phủ, os Acordos de Genebra dividem o país provisoriamente no paralelo 17.' },
    { id: 'war', when: '1955 – 1975', title: 'Guerra do Vietnã', text: 'Conflito entre o Norte e o Sul, com intenso envolvimento dos Estados Unidos.', detail: 'Foi também uma guerra civil e parte da Guerra Fria, com enorme custo humano para os vietnamitas, no Norte e no Sul, e efeitos duradouros como as minas e o agente laranja.' },
    { id: '1975', when: '1975', title: 'Queda de Saigon', text: 'Em 30 de abril, as forças do Norte tomam Saigon e a guerra termina.' },
    { id: '1976', when: '1976', title: 'Reunificação', text: 'Reunificação formal como República Socialista do Vietnã. Saigon passa a se chamar Ho Chi Minh City.' },
    { id: '1986', when: '1986', title: 'Đổi Mới', text: 'Reformas econômicas abrem espaço ao mercado, ao setor privado e ao capital estrangeiro.' },
    { id: 'today', when: 'Décadas seguintes', title: 'Integração global', text: 'Industrialização, exportações e entrada em acordos e organizações internacionais.', detail: 'Marcos como a normalização das relações com os EUA e a entrada na ASEAN (1995) e na OMC (2007) aceleraram a integração.' },
  ] as TimelineEvent[],
  politics: 'O Vietnã é governado por um sistema de partido único liderado pelo Partido Comunista. Sua economia, porém, combina orientação estatal com empresas privadas, investimento internacional e concorrência de mercado.',
};

/* ------------------------------------------------------------ beliefs */
export const beliefs = {
  title: 'Uma espiritualidade que vai além das religiões',
  intro: 'Muitas pessoas se declaram sem religião formal e, ainda assim, participam de rituais e práticas espirituais no dia a dia. Por isso, não é correto dizer que a maioria da população é formalmente budista.',
  sourceId: 'religion-vn',
  cards: [
    { title: 'Budismo', text: 'Uma das tradições historicamente mais influentes, sobretudo o budismo Mahayana entre a maioria étnica Kinh.' },
    { title: 'Culto aos antepassados', text: 'Muitos lares, lojas e famílias mantêm altares com fotografias, incenso e oferendas aos familiares falecidos.' },
    { title: 'Confucionismo', text: 'Influência histórica sobre educação, relações sociais, hierarquia, respeito aos mais velhos e vida familiar.' },
    { title: 'Taoismo e religiosidade popular', text: 'Práticas e crenças que se misturam livremente às outras tradições, como os cultos a espíritos e deusas protetoras.' },
    { title: 'Catolicismo', text: 'Comunidade expressiva, ligada historicamente ao contato com missionários europeus.' },
    { title: 'Cao Đài e Hòa Hảo', text: 'Tradições religiosas nascidas no próprio Vietnã, no século XX, sobretudo no sul.' },
  ],
  curiosity: 'Um pequeno altar com incenso em uma loja pode representar devoção familiar e espiritual, e não simplesmente decoração.',
};

/* --------------------------------------------------------------- street */
export const street = {
  title: 'A vida nas ruas',
  cards: [
    { title: 'A cultura das motos', text: 'O grande símbolo do transporte urbano: levam pessoas, entregas e mercadorias de todos os tamanhos.' },
    { title: 'Street food', text: 'Refeições acessíveis preparadas em pequenos estabelecimentos, mercados e calçadas, muitas vezes especializados em um único prato.' },
    { title: 'Banquinhos de plástico', text: 'Parte da vida social: é neles que se toma café, se come e se conversa na calçada.' },
    { title: 'Mercados locais', text: 'Comércio cotidiano, alimentos frescos, socialização e, em alguns contextos, negociação.' },
    { title: 'Altares e incensos', text: 'Presentes também em lojas, restaurantes e escritórios, com oferendas renovadas com frequência.' },
    { title: 'Arquitetura', text: 'Casas-tubo estreitas, prédios coloniais franceses e torres novas convivendo na mesma quadra.' },
    { title: 'Relações sociais', text: 'A idade orienta as formas de tratamento, e preservar a harmonia nas interações públicas é valorizado.' },
    { title: 'Tết', text: 'O Ano-Novo Lunar, entre janeiro e fevereiro, é um dos momentos culturais e familiares mais importantes do ano.' },
  ],
  observe: [
    'Quantos tipos diferentes de carga uma moto transporta?',
    'Onde estão os altares familiares ou comerciais?',
    'Como as calçadas são utilizadas?',
    'Como edifícios tradicionais convivem com construções novas?',
    'Como os moradores usam os espaços para comer e conversar?',
  ],
};

/* --------------------------------------------------------------- coffee */
export const coffee = {
  title: 'O segundo maior produtor de café do mundo',
  sourceId: 'vt-coffee',
  facts: [
    'O Vietnã é o segundo maior produtor mundial de café, atrás do Brasil.',
    'É líder mundial na produção de café robusta.',
    'O robusta tende a ter sabor mais intenso e mais cafeína do que o arábica.',
    'A cultura local inclui o phin, um pequeno filtro metálico individual, e muitos cafés de rua.',
  ],
  drinks: [
    { name: 'Cà phê sữa đá', pt: 'Café gelado com leite condensado', text: 'O clássico do dia a dia: café forte do phin sobre leite condensado e gelo.' },
    { name: 'Cà phê trứng', pt: 'Egg coffee', text: 'Especialidade de Hanói: café coberto por um creme de gema batida com leite condensado.' },
    { name: 'Cà phê dừa', pt: 'Coconut coffee', text: 'Café com coco, cremoso e gelado.' },
    { name: 'Cà phê muối', pt: 'Salt coffee', text: 'Café com creme levemente salgado, associado à região de Huế.' },
    { name: 'Cà phê đen đá', pt: 'Café preto gelado', text: 'Só café forte e gelo, sem leite.' },
  ],
  culture: 'A popularização do café está ligada à história colonial francesa, mas os vietnamitas o adaptaram com leite condensado, gelo, ovo, coco e sal, criando uma cultura própria.',
};

/* ----------------------------------------------------------------- food */
export interface Dish { name: string; text: string; note?: string }
export interface FoodRegion { id: 'norte' | 'centro' | 'sul'; name: string; profile: string; dishes: Dish[] }
export const food = {
  intro: 'A comida vietnamita muda conforme o clima, os ingredientes locais e a história de cada região.',
  regions: [
    { id: 'norte', name: 'Norte', profile: 'Em linhas gerais, mais delicado, com ênfase no equilíbrio de sabores.', dishes: [
      { name: 'Phở', text: 'Sopa de macarrão de arroz com caldo aromático e diferentes carnes.', note: 'Associado a Hanói e ao Norte.' },
      { name: 'Bún chả', text: 'Macarrão de arroz com carne suína grelhada, ervas e molho.', note: 'Clássico do almoço em Hanói.' },
      { name: 'Bánh cuốn', text: 'Delicados rolinhos de massa de arroz cozida no vapor.' },
      { name: 'Cà phê trứng', text: 'O egg coffee, tradição da capital.' },
    ] },
    { id: 'centro', name: 'Centro', profile: 'Pratos frequentemente mais condimentados e picantes.', dishes: [
      { name: 'Bún bò Huế', text: 'Sopa de noodles da tradição de Huế, normalmente com carne bovina e às vezes ingredientes suínos.' },
      { name: 'Mì Quảng', text: 'Noodles típicos de Quảng Nam, com pouco caldo e coberturas variadas.' },
      { name: 'Cao lầu', text: 'Noodles característicos de Hội An.' },
      { name: 'White rose', text: 'Bolinhos delicados associados a Hội An.', note: 'Em vietnamita, bánh bao bánh vạc.' },
      { name: 'Cozinha imperial de Huế', text: 'Tradição de preparações e apresentações refinadas, herdada da antiga corte.' },
    ] },
    { id: 'sul', name: 'Sul', profile: 'Uso mais marcante de doçura, ervas frescas e ingredientes tropicais.', dishes: [
      { name: 'Cơm tấm', text: 'Arroz quebrado servido com variados acompanhamentos.', note: 'Clássico de Saigon.' },
      { name: 'Gỏi cuốn', text: 'Rolinhos frescos de papel de arroz.' },
      { name: 'Bánh xèo', text: 'Panqueca crocante vietnamita.' },
      { name: 'Sabores do Mekong', text: 'Ervas frescas, agridoce e frutas tropicais do delta.' },
    ] },
  ] as FoodRegion[],
};

/* -------------------------------------------------------------- regions */
export const regions = {
  title: 'Norte, Centro e Sul',
  note: 'Diferenças culturais são tendências, não regras.',
  aspects: [
    { id: 'city', label: 'Cidades' },
    { id: 'identity', label: 'Perfil' },
    { id: 'landscape', label: 'Paisagem' },
    { id: 'history', label: 'História' },
    { id: 'climate', label: 'Clima' },
    { id: 'food', label: 'Culinária' },
  ],
  columns: [
    { id: 'norte', name: 'Norte', values: {
      city: 'Hanói',
      identity: 'Forte presença das instituições políticas e de tradições históricas.',
      landscape: 'Montanhas, arrozais, rios e formações calcárias.',
      history: 'Influência chinesa e cultura do Delta do Rio Vermelho.',
      climate: 'Subtropical, com inverno relativamente mais fresco.',
      food: 'Frequentemente mais suave.',
    } },
    { id: 'centro', name: 'Centro', values: {
      city: 'Hội An e Huế',
      identity: 'Monumentos, templos, cidadelas e cidades antigas.',
      landscape: 'Litoral, montanhas próximas ao mar e rios.',
      history: 'Capital imperial, antigo comércio marítimo e heranças Champa.',
      climate: 'Estações chuvosas marcantes e episódios de inundação em certas épocas.',
      food: 'Frequentemente mais intensa e condimentada.',
    } },
    { id: 'sul', name: 'Sul', values: {
      city: 'Ho Chi Minh City',
      identity: 'Grande polo comercial e financeiro, urbanização intensa e serviços.',
      landscape: 'Planícies e o Delta do Mekong.',
      history: 'Influências diversas, incluindo conexões khmer e com o Mekong.',
      climate: 'Tropical, geralmente quente o ano todo.',
      food: 'Mais sabores adocicados e ervas frescas.',
    } },
  ] as { id: string; name: string; values: Record<string, string> }[],
};

/* --------------------------------------------------------------- cities */
export interface GuideCity { id: string; cityId: string; name: string; localName: string; unesco?: string; lead: string; points: string[]; curiosity: string; sourceId?: string }
export const cities: GuideCity[] = [
  { id: 'hanoi', cityId: 'hanoi', name: 'Hanói', localName: 'Hà Nội', lead: 'Capital nacional e um dos grandes centros históricos e culturais do país.', points: [
    'Old Quarter: comércio tradicional e ruas ligadas a antigos ofícios.',
    'Arquitetura com traços franceses.',
    'Cultura de cafés, mercados e comida de rua.',
    'Importância política e histórica.',
  ], curiosity: 'A cidade combina ruas muito antigas com a sede do governo moderno.' },
  { id: 'ninh-binh', cityId: 'ninh-binh', name: 'Ninh Bình', localName: 'Ninh Bình', unesco: 'Tràng An · patrimônio misto (2014)', sourceId: 'unesco-trang-an', lead: 'Região famosa pelas formações calcárias, rios, cavernas e campos agrícolas.', points: [
    'Tràng An é patrimônio misto, cultural e natural, reconhecido pela UNESCO.',
    'Hoa Lư foi capital de antigas dinastias vietnamitas.',
    'Passeios de barco mostram a relação entre natureza, história e espiritualidade.',
  ], curiosity: 'A paisagem é moldada por longos processos geológicos.' },
  { id: 'ha-long', cityId: 'ha-long', name: 'Ha Long Bay', localName: 'Vịnh Hạ Long', unesco: 'Ha Long Bay – Cat Ba Archipelago', sourceId: 'unesco-vn', lead: 'Paisagem marítima marcada por milhares de ilhas e formações calcárias.', points: [
    'Parte do patrimônio mundial Ha Long Bay – Cat Ba Archipelago.',
    'Forte associação entre patrimônio natural, ecossistemas costeiros e turismo.',
    'Geologia desenvolvida ao longo de milhões de anos.',
  ], curiosity: 'As formações atuais são o resultado visível de uma história geológica muito antiga.' },
  { id: 'hoi-an', cityId: 'hoi-an', name: 'Hội An', localName: 'Hội An', unesco: 'Centro histórico (1999)', sourceId: 'unesco-vn', lead: 'Antigo porto comercial internacional.', points: [
    'Centro histórico reconhecido como patrimônio mundial pela UNESCO em 1999.',
    'Arquitetura com influências vietnamitas, chinesas, japonesas e europeias.',
    'Ruas antigas, lanternas, casas comerciais e mercados.',
    'Especialidades culinárias regionais, como o cao lầu.',
  ], curiosity: 'O patrimônio da cidade reflete sua posição nas antigas rotas comerciais.' },
  { id: 'hue', cityId: 'hue', name: 'Huế', localName: 'Huế', unesco: 'Complexo de monumentos (1993)', sourceId: 'unesco-vn', lead: 'Capital imperial da dinastia Nguyễn entre 1802 e 1945.', points: [
    'Cidadela, palácios e tumbas imperiais.',
    'Complexo de monumentos reconhecido pela UNESCO em 1993.',
    'Tradição culinária associada também à antiga corte.',
    'O Rio Perfume como referência geográfica e cultural.',
  ], curiosity: 'Grande parte da identidade da cidade está ligada à última dinastia imperial vietnamita.' },
  { id: 'hcmc', cityId: 'ho-chi-minh', name: 'Ho Chi Minh City', localName: 'Thành phố Hồ Chí Minh', lead: 'A antiga Saigon, nome ainda muito usado no dia a dia, sobretudo para a área central.', points: [
    'Principal polo comercial e financeiro do Vietnã.',
    'Arquitetura colonial, edifícios modernos e mercados movimentados.',
    'Forte importância na história da guerra e da reunificação.',
    'Ambiente urbano dinâmico, com contrastes econômicos e culturais.',
  ], curiosity: 'A cidade concentra camadas muito distintas da história recente do país.' },
];

/* ------------------------------------------------------------ etiquette */
export const etiquette = {
  title: 'Pequenos gestos que fazem diferença',
  sourceId: 'vt-etiquette',
  cards: [
    { title: 'Templos', text: 'Vista-se com respeito, cobrindo ombros e joelhos quando apropriado, e siga as orientações sobre tirar calçados e chapéus.' },
    { title: 'Fotografias', text: 'Peça permissão em situações sensíveis ou para fotografar pessoas de perto, e respeite restrições em locais religiosos.' },
    { title: 'Respeito aos mais velhos', text: 'Idade e relações familiares influenciam as formas de tratamento.' },
    { title: 'Conversas e conflitos', text: 'Fale com calma e evite constranger alguém em público; resolver com discrição costuma funcionar melhor.' },
    { title: 'Gorjetas', text: 'Não são obrigatórias de forma geral, mas costumam ser bem-vindas em serviços turísticos, spas e para guias.' },
    { title: 'Mercados', text: 'Negociar pode ser comum em alguns contextos; respeite preços fixos e negocie com educação e bom humor.' },
    { title: 'Dinheiro', text: 'A moeda é o VND. Pagamentos eletrônicos variam conforme o lugar e a região; ter algum dinheiro local costuma ser útil.' },
    { title: 'Trânsito', text: 'Use travessias sinalizadas e observe o tráfego com atenção, sem presumir que os veículos vão parar. Prefira os pontos mais seguros para atravessar.' },
  ],
};

/* --------------------------------------------------------- did you know */
export const didYouKnow: string[] = [
  'O Vietnã é um dos maiores produtores de café do planeta e o líder mundial em robusta.',
  'Grande parte da comida de rua é servida em pequenos banquinhos de plástico.',
  'O bánh mì é uma adaptação vietnamita de influências francesas: baguete leve recheada com patê, carnes, picles e ervas.',
  'Existem 54 grupos étnicos oficialmente reconhecidos.',
  'Muitas famílias mantêm altares domésticos para homenagear os antepassados.',
  'A última dinastia imperial vietnamita terminou em 1945.',
  'Huế foi capital imperial por mais de um século, de 1802 a 1945.',
  'Hội An foi um porto internacional com influências de diversos povos.',
  'A economia foi profundamente transformada pelas reformas Đổi Mới, de 1986.',
  'A reunificação formal do país ocorreu em 1976.',
  'A língua vietnamita usa escrita latina adaptada, com numerosos diacríticos.',
  'Os nomes Saigon e Ho Chi Minh City ainda coexistem no uso cotidiano.',
  'Tradições religiosas se misturam à vida cotidiana, das lojas às calçadas.',
  'Os cafés locais incluem preparações com ovo, coco e até creme salgado.',
  'Muitas paisagens famosas do norte foram formadas por processos geológicos de milhões de anos.',
];

/* -------------------------------------------------------------- phrases */
export const phrases = {
  note: 'O vietnamita é tonal: o mesmo conjunto de letras muda de sentido conforme o tom, indicado pelos diacríticos. Se a pronúncia não sair, mostrar a frase escrita na tela costuma resolver.',
  list: [
    { vi: 'Xin chào', pt: 'Olá' },
    { vi: 'Cảm ơn', pt: 'Obrigado(a)' },
    { vi: 'Xin lỗi', pt: 'Desculpe / com licença' },
    { vi: 'Bao nhiêu tiền?', pt: 'Quanto custa?' },
    { vi: 'Nhà vệ sinh ở đâu?', pt: 'Onde fica o banheiro?' },
    { vi: 'Không cay', pt: 'Sem pimenta / não picante' },
    { vi: 'Không đường', pt: 'Sem açúcar' },
    { vi: 'Nước', pt: 'Água' },
    { vi: 'Cà phê', pt: 'Café' },
    { vi: 'Tạm biệt', pt: 'Tchau / adeus' },
  ],
};

/* ------------------------------------------------------------ practical */
export const practical = {
  rows: [
    { label: 'Fuso horário', value: 'UTC+7, sem horário de verão' },
    { label: 'Prefixo telefônico', value: '+84' },
    { label: 'Moeda', value: 'Dong vietnamita (VND)' },
    { label: 'Trânsito', value: 'Mão direita' },
    { label: 'Energia', value: 'Predominantemente 220 V e 50 Hz; os formatos de tomada variam, então um adaptador universal ajuda' },
    { label: 'Calendário', value: 'Gregoriano na vida civil, com grande importância cultural das festas lunares' },
    { label: 'Clima', value: 'O país é extenso: estações e chuvas variam bastante entre norte, centro e sul' },
    { label: 'Segurança básica', value: 'Atenção ao atravessar ruas, a objetos pessoais em aglomerações e às condições do transporte' },
  ],
  caveat: 'Vistos, regras de entrada, alertas meteorológicos, taxas e horários mudam: consulte fontes oficiais atualizadas antes de decidir.',
};
