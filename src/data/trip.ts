import type { Activity, Airport, Booking, City, Day, Flight, Hotel, Place, TripData } from './types';
import { food } from './food';

/**
 * ============================================================
 *  DEMO DATA — a fictional Vietnam itinerary
 * ============================================================
 * Travellers, bookings, hotels, flights, codes, documents and expenses are
 * fictional. Attractions, restaurants and the cultural guide are public
 * places and information. Replace this file (and private/private.json) with
 * your own trip — see README → "Customize for your trip".
 * Booking codes live in private/private.json (encrypted at build), not here.
 */

// ---------------------------------------------------------------- cities
const cities: City[] = [
  { id: 'hanoi', name: 'Hanoi', localName: 'Hà Nội', region: 'Norte', coords: { lat: 21.0285, lng: 105.8542, verified: false }, artHue: 8, mapLabel: 'left', tagline: 'Cultura e gastronomia' },
  { id: 'ninh-binh', name: 'Ninh Binh', localName: 'Ninh Bình', region: 'Norte', coords: { lat: 20.2506, lng: 105.9745, verified: false }, artHue: 150, mapLabel: 'left', tagline: 'Natureza rural' },
  { id: 'ha-long', name: 'Ha Long Bay', localName: 'Vịnh Hạ Long', region: 'Norte', coords: { lat: 20.9101, lng: 107.1839, verified: false }, artHue: 185, tagline: 'Paisagem e barco' },
  { id: 'hoi-an', name: 'Hoi An', localName: 'Hội An', region: 'Centro', coords: { lat: 15.8801, lng: 108.338, verified: false }, artHue: 38, tagline: 'Charme e descanso' },
  { id: 'hue', name: 'Hue', localName: 'Huế', region: 'Centro', coords: { lat: 16.4637, lng: 107.5909, verified: false }, artHue: 280, mapLabel: 'left', tagline: 'Vietnã imperial' },
  { id: 'sao-paulo', name: 'São Paulo', region: 'Brasil', coords: { lat: -23.4356, lng: -46.4731, verified: false }, artHue: 140, abroad: true, timeZone: 'America/Sao_Paulo' },
  { id: 'doha', name: 'Doha', region: 'Catar · stopover', coords: { lat: 25.2854, lng: 51.531, verified: false }, artHue: 30, abroad: true, timeZone: 'Asia/Qatar' },
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', localName: 'Thành phố Hồ Chí Minh', region: 'Sul', coords: { lat: 10.7769, lng: 106.7009, verified: false }, artHue: 345, tagline: 'História, metrópole e Mekong Delta' },
];

// ---------------------------------------------------------------- places
const ll = (lat: number, lng: number) => ({ lat, lng, verified: false });
const places: Place[] = [
  {"id": "thang-long-puppets", "name": "Thang Long Water Puppet Theatre", "localName": "Nhà hát Múa rối Thăng Long", "cityId": "hanoi", "kind": "attraction", "address": "57B Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội", "description": "Espetáculo tradicional do norte do Vietnã: bonecos de madeira manipulados sobre a água, com música ao vivo. Cerca de 50 min, ao lado do lago Hoàn Kiếm. Há várias sessões por dia; compre o ingresso antes."},
  {"id": "st-joseph", "name": "St. Joseph's Cathedral", "localName": "Nhà thờ Lớn Hà Nội", "cityId": "hanoi", "kind": "attraction", "address": "40 Nhà Chung, Hàng Trống, Hoàn Kiếm, Hà Nội", "description": "Catedral neogótica de 1886, a 3 minutos a pé do hotel. A praça em frente é cheia de cafés e barracas de chá gelado com limão."},
  {"id": "hoa-lo", "name": "Hoa Lo Prison", "localName": "Di tích Nhà tù Hỏa Lò", "cityId": "hanoi", "kind": "attraction", "address": "1 Hỏa Lò, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội", "description": "Antiga prisão colonial francesa, depois usada para pilotos americanos (o \"Hanoi Hilton\"). Hoje é museu; cerca de 1 h, coberto."},
  {"id": "train-street", "name": "Train Street (trecho mais bonito)", "localName": "Phố đường tàu", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Train street most scenic part, Hanoi", "mapsUrl": "https://maps.app.goo.gl/G3mxN9ktd5tqwRTR6", "description": "Rua estreita onde a linha do trem passa colada às casas, com cafés à beira dos trilhos. Chegue cedo para conseguir lugar num café."},
  {"id": "women-museum", "name": "Vietnamese Women's Museum", "localName": "Bảo tàng Phụ nữ Việt Nam", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Vietnamese Women's Museum, Hanoi", "description": "Museu sobre família, costumes das etnias e o papel das mulheres na história do Vietnã, inclusive na guerra. Muito bem montado e com textos em inglês; ~1h30."},
  {"id": "history-museum", "name": "Vietnam National Museum of History", "localName": "Bảo tàng Lịch sử Quốc gia", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Vietnam National Museum of History, Hanoi", "description": "Da pré-história e dos tambores de bronze de Đông Sơn às dinastias imperiais, num prédio da época francesa perto da Ópera; ~1h30."},
  {"id": "ethnology-museum", "name": "Vietnam Museum of Ethnology", "localName": "Bảo tàng Dân tộc học Việt Nam", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Vietnam Museum of Ethnology, Hanoi", "description": "As 54 etnias do Vietnã, com casas tradicionais em tamanho real no jardim. Considerado um dos melhores museus do país; pede meio dia."},
  {"id": "tran-quoc", "name": "Tran Quoc Pagoda", "localName": "Chùa Trấn Quốc", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Tran Quoc Pagoda, Hanoi", "description": "O pagode mais antigo de Hanoi, numa ilhota do West Lake (Hồ Tây), com uma torre vermelha de vários andares. Visita rápida, ~30 min; ombros e joelhos cobertos."},
  {"id": "ta-hien", "name": "Ta Hien Beer Street", "localName": "Phố Tạ Hiện", "cityId": "hanoi", "kind": "attraction", "mapsQuery": "Ta Hien Street, Hanoi", "description": "Rua do Old Quarter tomada por banquinhos de plástico e bia hơi (chope fresco e baratíssimo). Fica animada depois do jantar; ótimo para ver o movimento."},
  {"id": "hoa-lu", "name": "Hoa Lu Ancient Capital", "localName": "Cố đô Hoa Lư", "cityId": "ninh-binh", "kind": "attraction", "mapsQuery": "Hoa Lu Ancient Capital, Ninh Binh", "description": "Primeira capital do Vietnã independente (século X), com os templos dos reis Đinh e Lê entre montanhas de calcário. Fica ao lado de Trang An; visita de cerca de 1 h."},
  {"id": "hoian-night-market", "name": "Hoi An Night Market", "localName": "Chợ đêm Nguyễn Hoàng", "cityId": "hoi-an", "kind": "market", "mapsQuery": "Hoi An Night Market, Nguyen Hoang", "description": "Mercado na ilha de An Hội, do outro lado do rio, com lanternas, lembrancinhas e comida de rua. Abre ao anoitecer."},
  {"id": "cam-thanh", "name": "Cam Thanh Basket Boats", "localName": "Rừng dừa Bảy Mẫu", "cityId": "hoi-an", "kind": "attraction", "mapsQuery": "Bay Mau Coconut Forest, Cam Thanh, Hoi An", "description": "Passeio nos barcos redondos de bambu (thúng chai) por canais entre coqueiros, a uns 15 min de carro de Hội An. Dura cerca de 30–45 min."},
  {"id": "marble-mountains", "name": "Marble Mountains", "localName": "Ngũ Hành Sơn", "cityId": "hoi-an", "kind": "attraction", "mapsQuery": "Marble Mountains, Da Nang", "description": "Cinco morros de mármore e calcário entre Hội An e Đà Nẵng, com cavernas, pagodes e mirantes. Fica no caminho do Hải Vân Pass; 1–1h30 de visita, com escadas."},
  {"id": "tu-duc", "name": "Tu Duc Tomb", "localName": "Lăng Tự Đức", "cityId": "hue", "kind": "attraction", "mapsQuery": "Tu Duc Tomb, Hue", "description": "Tumba e jardim de recreio do imperador Tự Đức (século XIX): lagos, pavilhões e pinheiros. Considerada a mais bonita de Huế junto com a de Khải Định."},
  {"id": "saigon-post-office", "name": "Saigon Central Post Office", "localName": "Bưu điện Trung tâm Sài Gòn", "cityId": "ho-chi-minh", "kind": "attraction", "address": "2 Công xã Paris, Bến Nghé, Quận 1, Hồ Chí Minh", "description": "Correio do fim do século XIX com projeto da escola de Gustave Eiffel: abóbada de ferro, mapas antigos pintados e ainda em funcionamento. Ao lado da catedral, a 10 min do Independence Palace."},
  {"id": "notre-dame-saigon", "name": "Saigon Notre-Dame Cathedral", "localName": "Nhà thờ Đức Bà Sài Gòn", "cityId": "ho-chi-minh", "kind": "attraction", "address": "01 Công xã Paris, Bến Nghé, Quận 1, Hồ Chí Minh", "description": "Catedral de tijolos vermelhos do século XIX. Está em restauração desde 2017 (andaimes saindo em 2026, obra prevista até 2027); vale a fachada e a praça, por dentro pode estar fechada."},
  {"id": "ao-show", "name": "AO Show", "cityId": "ho-chi-minh", "kind": "attraction", "address": "Saigon Opera House, 7 Công Trường Lam Sơn, Quận 1, Hồ Chí Minh", "description": "Espetáculo de circo contemporâneo com bambu e música ao vivo sobre a vida no sul do Vietnã, na Saigon Opera House (~1 h). Confira se há sessão nas datas e compre antes."},
  {"id": "cho-lon", "name": "Cho Lon & Binh Tay Market", "localName": "Chợ Bình Tây", "cityId": "ho-chi-minh", "kind": "market", "mapsQuery": "Binh Tay Market, District 6, Ho Chi Minh City", "description": "O bairro chinês de Saigon: mercado atacadista Bình Tây, ruas de lojas de ervas e templos. Cerca de 20–30 min de Grab do hotel."},
  {"id": "thien-hau", "name": "Thien Hau Temple", "localName": "Chùa Bà Thiên Hậu", "cityId": "ho-chi-minh", "kind": "attraction", "mapsQuery": "Thien Hau Temple, District 5, Ho Chi Minh City", "description": "Templo chinês de 1760 dedicado à deusa do mar, com incensos em espiral pendurados no teto. Fica em Chợ Lớn."},
  {"id": "ben-thanh", "name": "Ben Thanh Market", "localName": "Chợ Bến Thành", "cityId": "ho-chi-minh", "kind": "market", "mapsQuery": "Ben Thanh Market, Ho Chi Minh City", "description": "O mercado mais famoso de Saigon, a 5 min a pé do hotel: roupas, café, lembrancinhas e uma praça de comida. Pechinchar é normal."},
  {"id": "jade-emperor", "name": "Jade Emperor Pagoda", "localName": "Chùa Ngọc Hoàng", "cityId": "ho-chi-minh", "kind": "attraction", "mapsQuery": "Jade Emperor Pagoda, Ho Chi Minh City", "description": "Pagode taoísta de 1909, escuro e cheio de incenso, com estátuas de madeira entalhada. Visita rápida, a 10 min de Grab do centro."},
  {"id": "souq-waqif", "name": "Souq Waqif", "cityId": "doha", "kind": "market", "mapsQuery": "Souq Waqif, Doha", "description": "Mercado tradicional de Doha reconstruído no estilo antigo: vielas, especiarias, falcões, restaurantes e cafés com narguilé. Mais animado à noite."},
  {"id": "mia-doha", "name": "Museum of Islamic Art", "localName": "Museum of Islamic Art", "cityId": "doha", "kind": "attraction", "mapsQuery": "Museum of Islamic Art, Doha", "description": "Prédio de I. M. Pei à beira-mar com uma das maiores coleções de arte islâmica do mundo. O parque em volta tem vista do skyline. Domingo 09:00–19:00 (fecha às quartas)."},
  {"id": "mia-park", "name": "MIA Park", "localName": "MIA Park", "cityId": "doha", "kind": "attraction", "mapsQuery": "MIA Park, Doha", "description": "Parque à beira-mar ao lado do Museum of Islamic Art, com uma das melhores vistas dos arranha-céus de West Bay do outro lado da baía. Entrada gratuita, sem ingresso."},
  {"id": "mina-district", "name": "Old Doha Port (Mina District)", "localName": "Mina District, Old Doha Port", "cityId": "doha", "kind": "attraction", "mapsQuery": "Mina District, Old Doha Port, Doha", "description": "Antigo porto de Doha, ao lado do Museum of Islamic Art: prédios em tons pastel, ruas de pedra, cafés e lojinhas, com vista para os barcos tradicionais (dhows). Fica bonito também iluminado à noite."},
  {"id": "katara", "name": "Katara Cultural Village", "localName": "Katara Cultural Village", "cityId": "doha", "kind": "attraction", "mapsQuery": "Katara Cultural Village, Doha", "description": "Vila cultural à beira-mar com a mesquita azul de Katara, as torres de pombos de barro, anfiteatro, praia e muitos restaurantes. Boa para jantar e passear à noite. Ombros e joelhos cobertos para entrar na mesquita."},
  {"id": "the-pearl", "name": "The Pearl (Qanat Quartier)", "localName": "The Pearl-Qatar, Qanat Quartier", "cityId": "doha", "kind": "attraction", "mapsQuery": "Qanat Quartier, The Pearl, Doha", "description": "Ilha artificial ao lado de Katara. O Qanat Quartier tem canais e pontes no estilo de Veneza e casas coloridas; a marina de Porto Arabia tem cafés e restaurantes."},
  {"id": "nmoq", "name": "National Museum of Qatar", "localName": "National Museum of Qatar", "cityId": "doha", "kind": "attraction", "mapsQuery": "National Museum of Qatar, Doha", "description": "Museu de Jean Nouvel inspirado na \"rosa do deserto\", sobre a história do Catar. O prédio por si só vale a visita. Domingo 09:00–19:00 (fecha às terças)."},
  {"id": "doha-corniche", "name": "Doha Corniche", "cityId": "doha", "kind": "attraction", "mapsQuery": "Pearl Monument, Corniche, Doha", "description": "Calçadão de 7 km na baía, com vista dos arranha-céus e dos barcos dhow. Bom para caminhar no fim da tarde."},
  // Doha stopover (address from the Desert Falcon Airways booking confirmation)
  { id: 'hotel-doha', name: 'Pearl Gate Hotel', cityId: 'doha', kind: 'hotel', mapsQuery: 'Al Sadd, Doha', description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  // Hanoi
  { id: 'han-airport', name: 'Noi Bai International Airport', cityId: 'hanoi', kind: 'airport', mapsQuery: 'Noi Bai International Airport', coords: ll(21.2187, 105.8042) },
  { id: 'hotel-hanoi', name: 'Jade Lantern Hotel', cityId: 'hanoi', kind: 'hotel', mapsQuery: 'Hoan Kiem Lake, Hanoi', coords: ll(21.0297, 105.8503), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'old-quarter', name: 'Old Quarter', localName: 'Phố cổ Hà Nội', cityId: 'hanoi', kind: 'attraction', mapsQuery: 'Hanoi Old Quarter', coords: ll(21.034, 105.85), description: 'O bairro antigo de Hanoi, as "36 ruas" onde cada rua tinha um ofício (seda, prata, papel votivo). Ruas estreitas, motos, comida de rua e casas-tubo; o melhor é andar sem pressa.' },
  { id: 'hoan-kiem', name: 'Hoan Kiem Lake', localName: 'Hồ Hoàn Kiếm', cityId: 'hanoi', kind: 'attraction', mapsQuery: 'Hoan Kiem Lake, Hanoi', coords: ll(21.0288, 105.8525), description: 'Lago no coração de Hanoi, a 2 minutos do hotel. No meio fica o templo Ngọc Sơn, numa ilhota ligada à margem pela ponte vermelha Thê Húc. Nos fins de semana o entorno vira calçadão sem carros.' },
  { id: 'temple-literature', name: 'Temple of Literature', localName: 'Văn Miếu', cityId: 'hanoi', kind: 'attraction', mapsQuery: 'Temple of Literature, Hanoi', coords: ll(21.0293, 105.8355), description: 'Templo de Confúcio de 1070 que abrigou a primeira universidade do Vietnã. Pátios, jardins e estelas de pedra sobre tartarugas com os nomes dos doutores aprovados. Ingresso pago; vá com ombros e joelhos cobertos.' },
  { id: 'ho-chi-minh-area', name: 'Ho Chi Minh Mausoleum', cityId: 'hanoi', kind: 'attraction', mapsQuery: 'Ho Chi Minh Mausoleum, Hanoi', coords: ll(21.0368, 105.8346), description: 'Praça Ba Đình, com o mausoléu de Ho Chi Minh, a casa sobre palafitas onde ele viveu e o One Pillar Pagoda. O mausoléu abre só de manhã (fecha às segundas e sextas); fecha por algumas semanas para manutenção anual: confira antes. Vá cedo, de roupa discreta, e em silêncio.' },
  // Ninh Binh
  { id: 'hotel-ninh-binh', name: 'Lotus Valley Resort', cityId: 'ninh-binh', kind: 'hotel', mapsQuery: 'Tam Coc, Ninh Binh', coords: ll(20.2944, 105.9269), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'hang-mua', name: 'Hang Mua', localName: 'Hang Múa', cityId: 'ninh-binh', kind: 'attraction', mapsQuery: 'Hang Mua viewpoint, Ninh Binh', coords: ll(20.2292, 105.9353), description: 'Mirante no alto de uns 500 degraus de pedra, com vista para o rio e as montanhas de Tam Cốc e uma estátua de dragão no topo. Melhor no fim da tarde, para o pôr do sol. Leve água; a subida leva 20–30 min.' },
  { id: 'trang-an', name: 'Trang An', localName: 'Tràng An', cityId: 'ninh-binh', kind: 'pier', mapsQuery: 'Trang An boat tour, Ninh Binh', coords: ll(20.2556, 105.8939), description: 'Passeio de barco a remo (2–3 h) por rios entre montanhas de calcário, atravessando cavernas baixas e templos. Patrimônio Mundial da UNESCO; as remadoras conduzem e você só aprecia.' },
  { id: 'bich-dong', name: 'Bich Dong Pagoda', localName: 'Chùa Bích Động', cityId: 'ninh-binh', kind: 'attraction', mapsQuery: 'Bich Dong Pagoda, Ninh Binh', coords: ll(20.2188, 105.9175), description: 'Pagode construído em níveis na encosta de uma montanha, com uma parte dentro de uma caverna. Fica a poucos km de Tam Cốc; dá para ir de bicicleta.' },
  // Ha Long
  { id: 'tuan-chau', name: 'Tuan Chau Marina', cityId: 'ha-long', kind: 'pier', address: 'Tuan Chau Marina, Ha Long Bay, Ha Long, Vietnam', coords: { lat: 20.9216, lng: 106.9795, verified: true }, notes: 'Ponto de embarque do Emerald Bay Cruise.' },
  { id: 'cruise-ha-long', name: 'Emerald Bay Cruise', cityId: 'ha-long', kind: 'hotel', mapsQuery: 'Tuan Chau Marina, Ha Long', coords: ll(20.9216, 106.9795), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'hph-airport', name: 'Cat Bi International Airport (Hai Phong)', cityId: 'ha-long', kind: 'airport', mapsQuery: 'Cat Bi International Airport, Hai Phong', coords: ll(20.8194, 106.725) },
  // Hoi An
  { id: 'dad-airport', name: 'Da Nang International Airport', cityId: 'hoi-an', kind: 'airport', mapsQuery: 'Da Nang International Airport', coords: ll(16.0439, 108.1994) },
  { id: 'hotel-hoi-an', name: 'Riverside Lantern Boutique', cityId: 'hoi-an', kind: 'hotel', mapsQuery: 'Hoi An Ancient Town', coords: ll(15.8768, 108.3364), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'ancient-town', name: 'Hoi An Ancient Town', localName: 'Phố cổ Hội An', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Hoi An Ancient Town', coords: ll(15.877, 108.328), description: 'Centro histórico de Hội An, antigo porto comercial dos séculos XV–XIX e Patrimônio da UNESCO. Casas de mercadores, salões de assembleia chineses e lanternas. O ingresso para estrangeiros (120.000 ₫, válido por até 3 dias) inclui a Japanese Covered Bridge ou o Quan Cong Temple e mais um monumento à escolha.' },
  { id: 'japanese-bridge', name: 'Japanese Covered Bridge', localName: 'Chùa Cầu', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Japanese Covered Bridge, Hoi An', coords: ll(15.8771, 108.3262), description: 'Ponte coberta do fim do século XVI construída pela comunidade japonesa, símbolo de Hội An. Fica na ponta oeste da rua Trần Phú e fica iluminada à noite.' },
  { id: 'tra-que', name: 'Tra Que', localName: 'Làng rau Trà Quế', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Tra Que Vegetable Village, Hoi An', coords: ll(15.8985, 108.329), description: 'Vilarejo de hortas orgânicas a uns 3 km do centro, famoso pelas ervas usadas na cozinha de Hội An. Dá para ir de bicicleta, ver o cultivo e fazer aula de culinária.' },
  { id: 'lantern-workshop', name: 'Oficina de lanternas', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Lantern making workshop, Hoi An', description: 'Oficina de 1–1h30 em que cada um monta a própria lanterna de seda, com armação de bambu, para levar para casa (dobra para caber na mala). Há várias no centro; algumas pedem reserva.' },
  { id: 'thanh-ha', name: 'Thanh Ha Pottery Village', localName: 'Làng gốm Thanh Hà', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Thanh Ha Pottery Village, Hoi An', description: 'Vila de oleiros à beira do rio Thu Bồn, com famílias que fazem cerâmica de forma artesanal há séculos. Dá para tentar o torno.' },
  { id: 'kim-bong', name: 'Kim Bong Carpentry Village', localName: 'Làng mộc Kim Bồng', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Kim Bong Carpentry Village, Hoi An', description: 'Vila de marceneiros e construtores de barcos na ilha de Cẩm Kim, do outro lado do rio; acesso de barco ou pela ponte, bom de bicicleta.' },
  { id: 'hoi-an-memories', name: 'Hội An Memories Show', localName: 'Ký ức Hội An', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'Hoi An Memories Show, Hoi An Impression Theme Park', description: 'Grande espetáculo ao ar livre, numa ilha ao lado do centro, contando a história da cidade com centenas de artistas. Não acontece todos os dias: confiram datas e horário.' },
  { id: 'my-son', name: 'My Son', localName: 'Mỹ Sơn', cityId: 'hoi-an', kind: 'attraction', mapsQuery: 'My Son Sanctuary', coords: ll(15.764, 108.124), description: 'Ruínas de templos hindus do antigo reino Champa (séculos IV–XIII) no meio da mata, a cerca de 1 h de Hội An. Patrimônio da UNESCO.' },
  // Hai Van Pass road trip & Hue
  { id: 'hai-van', name: 'Hai Van Pass', localName: 'Đèo Hải Vân', cityId: 'hue', kind: 'attraction', mapsQuery: 'Hai Van Pass', coords: ll(16.1925, 108.13), description: 'Passo de montanha de uns 20 km entre Đà Nẵng e Huế, com curvas sobre o mar e um antigo forte no topo. Considerado uma das estradas mais bonitas do Vietnã.' },
  { id: 'lang-co', name: 'Lang Co', localName: 'Lăng Cô', cityId: 'hue', kind: 'attraction', mapsQuery: 'Lang Co Beach', coords: ll(16.27, 108.06), description: 'Praia e lagoa ao pé do Hải Vân Pass, do lado de Huế, conhecida pelos frutos do mar e pela paisagem de montanha e mar.' },
  { id: 'hotel-hue', name: 'Perfume River Hotel', cityId: 'hue', kind: 'hotel', mapsQuery: 'Hue Citadel', coords: ll(16.4631, 107.5944), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'khai-dinh', name: 'Khai Dinh Tomb', localName: 'Lăng Khải Định', cityId: 'hue', kind: 'attraction', mapsQuery: 'Khai Dinh Tomb, Hue', coords: ll(16.3989, 107.59), description: 'Tumba do imperador Khải Định, construída entre 1920 e 1931 — a mais ornamentada das tumbas reais, misturando estilo vietnamita e europeu, com uma sala interna coberta de mosaicos de porcelana e vidro.' },
  { id: 'imperial-city', name: 'Imperial City / Citadel', localName: 'Đại Nội Huế', cityId: 'hue', kind: 'attraction', mapsQuery: 'Imperial City, Hue', coords: ll(16.4698, 107.5786), description: 'A cidadela da dinastia Nguyễn, os últimos imperadores do Vietnã (1802–1945): muralhas, portões, palácios e a Cidade Púrpura Proibida. Parte foi destruída na guerra e está em restauração. Reserve 2–3 h.' },
  { id: 'thien-mu', name: 'Thien Mu Pagoda', localName: 'Chùa Thiên Mụ', cityId: 'hue', kind: 'attraction', mapsQuery: 'Thien Mu Pagoda, Hue', coords: ll(16.4534, 107.5446), description: 'Pagode à beira do Perfume River com uma torre octogonal de 7 andares, símbolo de Huế. Ainda é um mosteiro ativo; lá está o carro do monge Thích Quảng Đức.' },
  { id: 'perfume-river', name: 'Perfume River', localName: 'Sông Hương', cityId: 'hue', kind: 'attraction', mapsQuery: 'Perfume River, Hue', coords: ll(16.4637, 107.5856), description: 'O rio que corta Huế. Dá para fazer passeio de barco-dragão até o Thien Mu Pagoda ou caminhar pela orla, bonita no fim da tarde.' },
  { id: 'hui-airport', name: 'Phu Bai International Airport (Hue)', cityId: 'hue', kind: 'airport', mapsQuery: 'Phu Bai International Airport, Hue', coords: ll(16.4015, 107.7026) },
  // Ho Chi Minh City
  { id: 'hotel-saigon', name: 'Saigon Central Hotel', cityId: 'ho-chi-minh', kind: 'hotel', mapsQuery: 'Ben Thanh Market, Ho Chi Minh City', coords: ll(10.7733, 106.7010), description: 'Hotel fictício para a demonstração; o botão de Maps leva à região.' },
  { id: 'sgn-airport', name: 'Tan Son Nhat International Airport', cityId: 'ho-chi-minh', kind: 'airport', mapsQuery: 'Tan Son Nhat International Airport', coords: ll(10.8188, 106.652) },
  { id: 'war-remnants', name: 'War Remnants Museum', localName: 'Bảo tàng Chứng tích Chiến tranh', cityId: 'ho-chi-minh', kind: 'attraction', mapsQuery: 'War Remnants Museum, Ho Chi Minh City', coords: ll(10.7795, 106.6922), description: 'Museu sobre a Guerra do Vietnã com fotografias, armamentos e salas sobre o agente laranja. É forte e emocionante; reserve cerca de 2 h.' },
  { id: 'independence-palace', name: 'Independence Palace', localName: 'Dinh Độc Lập', cityId: 'ho-chi-minh', kind: 'attraction', mapsQuery: 'Independence Palace, Ho Chi Minh City', coords: ll(10.777, 106.6953), description: 'Palácio presidencial do antigo Vietnã do Sul, preservado como em 1975, quando tanques derrubaram seu portão no fim da guerra. Salas de reunião, bunker e tanques no jardim.' },
  { id: 'nguyen-hue', name: 'Nguyen Hue', localName: 'Phố đi bộ Nguyễn Huệ', cityId: 'ho-chi-minh', kind: 'attraction', mapsQuery: 'Nguyen Hue Walking Street, Ho Chi Minh City', coords: ll(10.774, 106.7038), description: 'Avenida-calçadão no centro de Saigon, entre a prefeitura colonial (com a estátua de Ho Chi Minh) e o rio. À noite enche de gente; ao lado ficam a Ópera e o prédio de cafés do nº 42.' },
  { id: 'cu-chi', name: 'Cu Chi Tunnels', localName: 'Địa đạo Củ Chi', cityId: 'ho-chi-minh', kind: 'attraction', mapsQuery: 'Cu Chi Tunnels', coords: ll(11.06, 106.52), description: 'Rede de túneis usada pelos guerrilheiros vietcongues durante a guerra, a cerca de 1h30 de Saigon. Dá para entrar em trechos alargados, ver armadilhas e entender a vida subterrânea. Use roupa que possa sujar.' },
  { id: 'ben-tre', name: 'Ben Tre (Mekong Delta)', localName: 'Bến Tre', cityId: 'ho-chi-minh', kind: 'attraction', mapsQuery: 'Ben Tre, Vietnam', coords: ll(10.2433, 106.3756), description: 'Província do Mekong Delta famosa pelos coqueiros. Passeios de barco por canais estreitos, oficinas de doce de coco e vilarejos.' },
];

// -------------------------------------------------------------- airports
const airports: Airport[] = [
  { code: 'GRU', name: 'Aeroporto Internacional de Guarulhos', city: 'São Paulo', timeZone: 'America/Sao_Paulo' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', timeZone: 'Asia/Qatar' },
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', timeZone: 'Asia/Ho_Chi_Minh', placeId: 'han-airport' },
  { code: 'HPH', name: 'Cat Bi International Airport', city: 'Hai Phong', timeZone: 'Asia/Ho_Chi_Minh', placeId: 'hph-airport' },
  { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', timeZone: 'Asia/Ho_Chi_Minh', placeId: 'dad-airport' },
  { code: 'HUI', name: 'Phu Bai International Airport', city: 'Hue', timeZone: 'Asia/Ho_Chi_Minh', placeId: 'hui-airport' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', timeZone: 'Asia/Ho_Chi_Minh', placeId: 'sgn-airport' },
];

// --------------------------------------------------------------- flights
// International legs: Desert Falcon Airways confirmations (outbound screenshot, return e-ticket PDF).
const flights: Flight[] = [
  { id: 'gru-doh', parties: ['couple'], airline: 'Desert Falcon Airways', flightNumber: 'DF 210', from: 'GRU', to: 'DOH', departDate: '2027-11-19', departTime: '20:25', arriveDate: '2027-11-20', arriveTime: '16:00', departTerminal: '3', baggage: 'Econômica · 2 malas por adulto', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ida, com stopover em Doha antes do voo para Hanoi.' },
  { id: 'doh-han', airline: 'Desert Falcon Airways', flightNumber: 'DF 476', from: 'DOH', to: 'HAN', departDate: '2027-11-22', departTime: '01:50', arriveDate: '2027-11-22', arriveTime: '12:20', arriveTerminal: '2', baggage: 'Econômica · 2 malas por adulto', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Chegada em Hanoi. Sam vem no mesmo voo (reserva própria).' },
  { id: 'hph-dad', airline: 'Lotus Air', flightNumber: 'LA 725', from: 'HPH', to: 'DAD', departDate: '2027-11-27', departTime: '16:30', arriveDate: '2027-11-27', arriveTime: '17:45', baggage: 'Por pessoa: 1 mala de mão 7 kg + 1 mala despachada 20 kg.', seats: '12A, 12B, 12C', status: 'confirmed', notes: 'Direto · 1h15. Uma reserva para os 3 viajantes.' },
  { id: 'hui-sgn', airline: 'Lotus Air', flightNumber: 'LA 1311', from: 'HUI', to: 'SGN', departDate: '2027-12-01', departTime: '17:50', arriveDate: '2027-12-01', arriveTime: '19:15', baggage: 'Por pessoa: 1 mala de mão 7 kg + 1 mala despachada 20 kg.', seats: '7D, 7E, 7F', status: 'confirmed', notes: 'Confirmação em Reservas → Documentos. Direto · 1h25.' },
  { id: 'sgn-doh', parties: ['couple'], airline: 'Desert Falcon Airways', flightNumber: 'DF 471', from: 'SGN', to: 'DOH', departDate: '2027-12-05', departTime: '19:40', arriveDate: '2027-12-05', arriveTime: '23:40', departTerminal: '2', baggage: 'Econômica · 2 malas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Chegar ao aeroporto 3 h antes; check-in online abre 48 h antes.' },
  { id: 'doh-gru', parties: ['couple'], airline: 'Desert Falcon Airways', flightNumber: 'DF 215', from: 'DOH', to: 'GRU', departDate: '2027-12-06', departTime: '00:25', arriveDate: '2027-12-06', arriveTime: '09:30', arriveTerminal: '3', baggage: 'Econômica · 2 malas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Último trecho, para São Paulo.' },
];

// ---------------------------------------------------------------- hotels
// Only bookings marked "RESERVADO" in the doc. Ho Chi Minh City: not booked yet.
const hotels: Hotel[] = [
  { id: 'h-doha', parties: ['couple'], placeId: 'hotel-doha', checkIn: '2027-11-20', checkOut: '2027-11-21', checkOutTime: '23:00', bookedVia: 'Companhia aérea (pacote voo + hotel)', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Pacote de stopover: check-in a qualquer hora e check-out até 23:00. Reserva fictícia para a demonstração.' },
  { id: 'h-hanoi', placeId: 'hotel-hanoi', checkIn: '2027-11-22', checkOut: '2027-11-24', checkInTime: '14:00', checkOutTime: '12:00', roomType: 'Quarto duplo com vista da cidade · café da manhã incluído', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo hotel, nas mesmas datas. Reserva fictícia para a demonstração.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
  { id: 'h-ninh-binh', placeId: 'hotel-ninh-binh', checkIn: '2027-11-24', checkOut: '2027-11-26', checkInTime: '14:00', checkOutTime: '11:00', roomType: 'Bangalô com vista das montanhas · café da manhã incluído', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo hotel, nas mesmas datas. Reserva fictícia para a demonstração.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
  { id: 'h-ha-long', placeId: 'cruise-ha-long', checkIn: '2027-11-26', checkOut: '2027-11-27', checkInTime: '11:30', checkOutTime: '11:30', roomType: 'Cabine com varanda · refeições a bordo incluídas', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo cruzeiro. Check-in no píer 11:30–12:00; desembarque até 11:30 do dia seguinte. Reserva fictícia.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
  { id: 'h-hoi-an', placeId: 'hotel-hoi-an', checkIn: '2027-11-27', checkOut: '2027-11-30', checkInTime: '14:00', checkOutTime: '12:00', roomType: 'Suíte com varanda · café da manhã incluído', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo hotel, nas mesmas datas. Reserva fictícia para a demonstração.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
  { id: 'h-hue', placeId: 'hotel-hue', checkIn: '2027-11-30', checkOut: '2027-12-01', checkInTime: '14:00', checkOutTime: '12:00', roomType: 'Quarto duplo · sem refeições', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo hotel, nas mesmas datas. Reserva fictícia para a demonstração.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
  { id: 'h-saigon', placeId: 'hotel-saigon', checkIn: '2027-12-01', checkOut: '2027-12-05', checkInTime: '14:00', checkOutTime: '12:00', roomType: 'Quarto duplo · café da manhã incluído', bookedVia: 'Site de reservas', status: 'confirmed', perParty: true, confirmations: ['couple'], notes: 'Ana e Leo: reserva para 2 adultos; Sam tem reserva própria no mesmo hotel, nas mesmas datas. Reserva fictícia para a demonstração.', notesFor: { sam: 'Você tem reserva própria neste hotel, nas mesmas datas.' } },
];

// ---------------------------------------------- transports & tours to book
// From the doc's booking table. None of these is marked as reserved yet.
const bookings: Booking[] = [
  { id: 'b-seguro', kind: 'other', title: 'Seguro viagem', date: '2027-11-19', status: 'confirmed', missingFor: { couple: ['apólice do Leo'], sam: ['sua apólice'] }, instructions: 'Problema de saúde: acione a central da seguradora antes de ir ao médico (em emergência, vá direto e avise depois).', notesFor: { sam: '' }, notes: 'Ana: Seguradora Exemplo, de 19/11 a 06/12. Apólice (fictícia) em Reservas → Documentos.' },
  { id: 'b-civp', kind: 'other', title: 'Certificado de vacina de febre amarela (CIVP)', date: '2027-11-22', status: 'confirmed', missingFor: { couple: ['CIVP do Leo'], sam: ['seu CIVP'] }, instructions: 'Leve impresso, junto com o passaporte.', notesFor: { sam: '' }, notes: 'Ana: certificado (fictício) em Reservas → Documentos.' },
  { id: 'b-sam-exit', parties: ['sam'], kind: 'other', title: 'Voo de saída do Sam do Vietnã', date: '2027-12-05', priority: 'medium', bookBy: 'informar companhia, nº do voo e horário', status: 'pending', notes: 'Sam volta separado dos voos de Ana e Leo.' },
  { id: 'b-visa', kind: 'other', title: 'Visto do Vietnã (e-visa)', date: '2027-11-22', status: 'confirmed', missingFor: { couple: ['código do e-visa do Leo'], sam: ['código do seu e-visa'] }, instructions: 'Leve o e-visa impresso e o PDF no celular, junto com o passaporte, para a imigração. Confira as regras de entrada em fontes oficiais.', notesFor: { sam: '' }, notes: 'Ana: e-visa (fictício) em Reservas → Documentos.' },
  { id: 'b-transfer-han-hotel', kind: 'transfer', title: 'Transfer Noi Bai Airport → Jade Lantern', date: '2027-11-22', fromPlaceId: 'han-airport', toPlaceId: 'hotel-hanoi', priority: 'low', bookBy: 'opcional (o roteiro cita o transfer; não está na tabela de reservas)', status: 'pending', notes: 'Na reserva do Jade Lantern pedimos informações sobre o shuttle do aeroporto — ver resposta do hotel.' },
  { id: 'b-transfer-han-nb', kind: 'transfer', title: 'Transfer Hanoi → Ninh Binh', date: '2027-11-24', time: '15:00', fromPlaceId: 'hotel-hanoi', toPlaceId: 'hotel-ninh-binh', meetingPlaceId: 'hotel-hanoi', meetingPoint: 'Saída do Jade Lantern', durationMin: 120, status: 'confirmed', notes: 'Agendado para 15:00, saindo do Jade Lantern até o Lotus Valley. Chegada prevista por volta das 17:00 (~2 h).' },
  { id: 'b-transfer-halong-hph', kind: 'transfer', title: 'Transfer Ha Long → Cat Bi Airport (HPH)', date: '2027-11-27', toPlaceId: 'hph-airport', priority: 'medium', bookBy: 'junto com o cruzeiro (voo às 16:30)', status: 'pending', notes: 'O Emerald Bay oferece transfer com custo extra. Desembarque até 11:30; voo às 16:30.' },
  { id: 'b-transfer-dad-hoian', kind: 'transfer', title: 'Transfer Da Nang Airport → Hoi An', date: '2027-11-27', fromPlaceId: 'dad-airport', toPlaceId: 'hotel-hoi-an', priority: 'low', bookBy: 'opcional (o hotel pode oferecer; Grab também atende)', status: 'pending' },
  { id: 'b-transfer-nb-tuan-chau', kind: 'transfer', title: 'Transfer Ninh Binh → Tuan Chau', date: '2027-11-26', fromPlaceId: 'hotel-ninh-binh', toPlaceId: 'tuan-chau', priority: 'medium', bookBy: '2–4 semanas antes', status: 'pending', notes: 'Chegar ao píer até 11:30 (check-in do cruzeiro 11:30–12:00). O Emerald Bay oferece transfer com custo extra.' },
  { id: 'b-hai-van', kind: 'car', title: 'Carro privado Hoi An → Hue via Hai Van Pass', date: '2027-11-30', fromPlaceId: 'hotel-hoi-an', toPlaceId: 'hotel-hue', priority: 'medium', bookBy: '1–3 semanas antes', status: 'pending', notes: 'Passando por Da Nang, Hai Van Pass e Lang Co.' },
  { id: 'b-food-tour', kind: 'tour', title: 'Food tour em Hanoi (opcional)', date: '2027-11-23', priority: 'low', bookBy: 'opcional, não reservado', status: 'suggestion', notes: 'Não reservado. Se der vontade, muitos tours aceitam reserva de véspera; ou façam por conta própria com a lista de comida do dia.' },
  { id: 'b-cu-chi', kind: 'tour', title: 'Cu Chi Tunnels — meio dia', date: '2027-12-03', priority: 'medium', bookBy: '1–2 semanas antes', status: 'pending', notes: 'Preferência por passeio de meio dia, pela manhã.' },
  { id: 'b-mekong', kind: 'tour', title: 'Mekong Delta — bate-volta a Ben Tre', date: '2027-12-04', priority: 'low', bookBy: 'perto da viagem, cancelável', status: 'pending', notes: 'Saída pela manhã, retorno no fim da tarde.' },
];

// ------------------------------------------------------------------ days
type A = Omit<Activity, 'status'> & { status?: Activity['status'] };
const sug = (xs: A[]): Activity[] => xs.map((a) => ({ status: 'suggestion', ...a }) as Activity);

const days: Day[] = [
  {
    date: '2027-11-19', cityIds: ['sao-paulo'], parties: ['couple'],
    title: 'Embarque em Guarulhos',
    summary: 'Voo noturno para Doha. Chegar ao aeroporto por volta das 17:30 (3 h antes).',
    stayNote: 'Noite no avião.',
    activities: sug([
      { id: 'd-2-insurance', kind: 'note', title: 'Seguro viagem ativo (19/11 a 06/12)', period: 'morning', bookingId: 'b-seguro', status: 'confirmed' },
      { id: 'd-2-to-gru', kind: 'transfer', title: 'Chegar a Guarulhos (Terminal 3)', time: '17:25', status: 'confirmed', description: 'A companhia recomenda chegar 3 h antes do voo internacional.' },
      { id: 'd-2-flight', kind: 'flight', title: 'Voo São Paulo → Doha', time: '20:25', flightId: 'gru-doh', status: 'confirmed' },
    ]),
  },
  {
    date: '2027-11-20', cityIds: ['doha'], parties: ['couple'], hotelId: 'h-doha',
    title: 'Chegada a Doha',
    summary: 'Chegada no fim da tarde. Noite de descanso perto do hotel; o Souq Waqif fica para amanhã à noite.',
    activities: sug([
      { id: 'd-1-arrival', kind: 'flight', title: 'Chegada a Doha', time: '16:00', flightId: 'gru-doh', status: 'confirmed' },
      { id: 'd-1-checkin', kind: 'check-in', title: 'Check-in no Pearl Gate Hotel', period: 'evening', hotelId: 'h-doha', placeId: 'hotel-doha', status: 'confirmed' },
    ]),
  },
  {
    date: '2027-11-21', cityIds: ['doha'], parties: ['couple'],
    title: 'Um dia em Doha',
    summary: 'Saída às 11:30: MIA Park, National Museum of Qatar, almoço em Mina District, Corniche ao pôr do sol e jantar no Souq Waqif. De volta ao hotel por volta das 20:00; o quarto fica com vocês até 23:00, quando sai o transfer para o voo de madrugada para Hanoi. Horários aproximados.',
    stayNote: 'Voo à 01:50 de 22/11: transfer sai do hotel às 23:00.',
    activities: sug([
      { id: 'd0-mia-park', kind: 'activity', title: 'MIA Park: skyline de West Bay e fotos', time: '11:30', endTime: '12:10', placeId: 'mia-park', travelMode: 'driving', transport: 'Uber saindo do hotel', description: 'Caminhada pelo parque à beira-mar, com a vista clássica dos arranha-céus de West Bay do outro lado da baía e o prédio do Museum of Islamic Art por fora. Entrada gratuita, sem ingresso (não vamos entrar no museu). ~40 min.' },
      { id: 'd0-nmoq', kind: 'activity', title: 'National Museum of Qatar', time: '12:25', endTime: '14:00', placeId: 'nmoq', travelMode: 'driving', transport: 'Uber 12:10–12:25 (~15 min) saindo do MIA Park', description: 'A única visita a museu do dia: história e cultura do Catar. O prédio de Jean Nouvel, inspirado na "rosa do deserto", já vale a visita. Com ~1h35, priorizem as galerias da vida no deserto e dos beduínos, da pesca de pérolas e da descoberta do petróleo, e o antigo palácio restaurado no meio do museu.' },
      { id: 'd0-mina', kind: 'activity', title: 'Mina District (Old Doha Port) e almoço', time: '14:15', endTime: '15:45', placeId: 'mina-district', travelMode: 'driving', transport: 'Uber 14:00–14:15 (~15 min) saindo do National Museum; lá dentro, tudo a pé', description: 'Passeio pelas construções coloridas e ruas de pedra do antigo porto, com vista dos barcos tradicionais (dhows), e almoço num dos cafés e restaurantes do bairro. ~1h30.' },
      { id: 'd0-corniche', kind: 'activity', title: 'Doha Corniche ao pôr do sol', time: '16:00', endTime: '17:00', placeId: 'doha-corniche', travelMode: 'driving', transport: 'Uber 15:45–16:00 (~15 min) até o Pearl Monument; depois a pé pelo calçadão', description: 'Calçadão à beira da baía, partindo do Pearl Monument (a escultura da ostra com a pérola): barcos tradicionais dhow, o skyline de West Bay e o pôr do sol por volta das 16:43. ~1 h.' },
      { id: 'd0-souq', kind: 'activity', title: 'Souq Waqif: explorar o mercado e jantar', time: '17:15', endTime: '19:30', placeId: 'souq-waqif', travelMode: 'walking', transport: 'A pé 17:00–17:15 (~15 min) saindo do Corniche', description: 'O mercado fica mais animado ao anoitecer. Percorram as vielas de especiarias, tecidos e lanternas, passem pela área dos falcões e jantem num dos restaurantes do souq (dá para fechar com um chá karak). ~2h15.' },
      { id: 'd0-back-hotel', kind: 'transfer', title: 'Retorno ao hotel', time: '19:30', endTime: '20:00', placeId: 'hotel-doha', travelMode: 'driving', transport: 'Uber saindo do Souq Waqif', description: 'De volta ao hotel por volta das 20:00, com tempo para banho, descanso e malas antes do check-out e do transfer das 23:00.' },
      { id: 'd0-checkout', kind: 'check-out', title: 'Check-out do hotel', time: '22:50', hotelId: 'h-doha', placeId: 'hotel-doha', status: 'confirmed', notes: 'Check-out até 23:00 (pacote stopover): o quarto fica com vocês o dia todo — voltem antes para um banho e descanso antes do voo.' },
      { id: 'd0-to-airport', kind: 'transfer', title: 'Transfer do hotel → aeroporto Hamad', time: '23:00', status: 'confirmed', placeId: 'hotel-doha', description: 'Transfer agendado, saindo do hotel às 23:00. Chegada por volta das 23:20–23:30, umas 2h20 antes do voo das 01:50.' },
      { id: 'd0-flight', kind: 'flight', title: 'Voo Doha → Hanoi (01:50 de 22/11)', period: 'evening', flightId: 'doh-han', status: 'confirmed' },
    ]),
  },
  {
    date: '2027-11-22', cityIds: ['hanoi'], hotelId: 'h-hanoi',
    weather: {"risk": "low", "note": "Novembro é época seca em Hanoi, com temperaturas amenas; leve um casaco leve para a noite.", "rainPlan": ["Thang Long Water Puppet Theatre (coberto, ao lado do lago)", "Cafés de egg coffee no Old Quarter", "Dong Xuan Market (coberto)", "St. Joseph’s Cathedral"]},
    title: 'Chegada + primeiro contato com o Vietnã',
    summary: 'Não tentamos transformar o dia da chegada em uma maratona. O Old Quarter já entrega imediatamente o caos, a comida e a atmosfera de Hanoi.',
    activities: sug([
      { id: 'd1-arrival', kind: 'flight', title: 'Chegada em Hanoi', time: '12:20', flightId: 'doh-han', placeId: 'han-airport', status: 'confirmed' },
      { id: 'd1-civp', kind: 'note', title: 'Imigração: certificado de febre amarela (CIVP)', period: 'afternoon', bookingId: 'b-civp', status: 'confirmed' },
      { id: 'd1-visa', kind: 'note', title: 'Imigração: e-visa impresso + passaporte', period: 'afternoon', bookingId: 'b-visa', status: 'confirmed', description: 'Na fila de "e-visa" da imigração do aeroporto Nội Bài, mostre o passaporte e o e-visa impresso. O visto é de entrada única: não saia do Vietnã durante a viagem.' },
      { id: 'd1-transfer', kind: 'transfer', title: 'Imigração e transfer para o hotel', period: 'afternoon', bookingId: 'b-transfer-han-hotel', status: 'pending', description: 'Do aeroporto Nội Bài ao Old Quarter são uns 30 km, cerca de 45–60 min de carro. A imigração com visto costuma levar de 30 min a 1 h.' },
      { id: 'd1-checkin', kind: 'check-in', title: 'Check-in no Jade Lantern (a partir das 14:00)', period: 'afternoon', hotelId: 'h-hanoi', placeId: 'hotel-hanoi', status: 'confirmed' },
      { id: 'd1-old-quarter', kind: 'activity', title: 'Old Quarter', period: 'afternoon', placeId: 'old-quarter', travelMode: 'walking', transport: 'A pé ~8 min saindo do hotel (o Jade Lantern fica na borda do Old Quarter)', description: 'Tarde livre para o primeiro contato com a cidade.', notes: 'Combine o preço de cyclo em dong antes de subir; vendedoras oferecem foto com a cesta de frutas e depois cobram.' },
      { id: 'd1-hoan-kiem', kind: 'activity', title: 'Hoan Kiem Lake', period: 'afternoon', placeId: 'hoan-kiem', travelMode: 'walking', transport: 'A pé ~10 min saindo do Old Quarter' },
      { id: 'd1-cafes', kind: 'meal', title: 'Cafés e egg coffee', period: 'afternoon', description: 'O egg coffee (cà phê trứng) é café forte coberto por um creme de gema batida com açúcar e leite condensado — lembra um tiramisù líquido. Nasceu em Hanoi nos anos 1940.' },
      { id: 'd1-dinner', kind: 'meal', title: 'Primeiro jantar vietnamita', period: 'evening', description: 'Veja as sugestões de "Onde comer" deste dia.' },
      {"id": "x23-ta-hien", "kind": "activity", "title": "Bia hơi na Ta Hien Beer Street", "period": "evening", "placeId": "ta-hien", "travelMode": "walking", "transport": "A pé ~8 min saindo do hotel", "durationMin": 60, "status": "suggestion", "extra": true},
      {"id": "x23-st-joseph", "kind": "activity", "title": "St. Joseph’s Cathedral", "period": "afternoon", "placeId": "st-joseph", "travelMode": "walking", "transport": "A pé ~7 min saindo do Hoan Kiem Lake (~3 min do hotel)", "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-11-23', cityIds: ['hanoi'], hotelId: 'h-hanoi',
    weather: {"risk": "low", "rainPlan": ["Hoa Lo Prison (museu coberto)", "Vietnam National Museum of History, perto da Ópera", "Temple of Literature tem pátios abertos: dá para ver de guarda-chuva, mas rende menos", "Food tour costuma acontecer com garoa; confirme com a operadora se chover forte"]},
    decisions: [
      { id: 'd24-food', question: 'Food tour guiado ou comer por conta?', context: 'O food tour não foi reservado; muitos aceitam reserva de véspera.', options: [
        { id: 'tour', label: 'Reservar um food tour', detail: 'Guia explicando os pratos; mais fácil para provar muita coisa.' },
        { id: 'diy', label: 'Por conta própria', detail: 'Usar a lista de comida do dia; mais livre e mais barato.' },
      ] },
      { id: 'd24-puppets', question: 'Ir ao Water Puppet Theatre à noite?', context: 'Sessões da noite costumam esgotar; comprem o ingresso antes.', options: [
        { id: 'yes', label: 'Sim, numa sessão antes ou depois do jantar', placeId: 'thang-long-puppets' },
        { id: 'no', label: 'Não desta vez' },
      ] },
    ],
    title: 'História + cidade + gastronomia',
    summary: 'É o dia para realmente entender Hanoi, misturando história com a vida cotidiana da cidade.',
    activities: sug([
      { id: 'd2-hcm-area', kind: 'activity', title: 'Área de Ho Chi Minh (mausoléu)', period: 'morning', placeId: 'ho-chi-minh-area', travelMode: 'driving', transport: 'Grab ~10–15 min saindo do hotel (~2,5 km)', notes: 'Chegar 07:30–08:00: o mausoléu abre só de manhã (fecha ~10:30–11:00). Grab ~10 min do hotel.' },
      {"id": "x24-tran-quoc", "kind": "activity", "title": "Tran Quoc Pagoda e West Lake", "period": "morning", "placeId": "tran-quoc", "travelMode": "driving", "transport": "Grab ~7 min saindo da área do mausoléu (~1,7 km); a pé ~20 min", "durationMin": 30, "status": "suggestion", "extra": true},
      { id: 'd2-literature', kind: 'activity', title: 'Temple of Literature', period: 'morning', placeId: 'temple-literature', travelMode: 'walking', transport: 'A pé ~15 min ou Grab ~5 min saindo da área do mausoléu (~1 km)' },
      { id: 'd2-old-quarter', kind: 'activity', title: 'Old Quarter', period: 'afternoon', placeId: 'old-quarter', travelMode: 'driving', transport: 'Grab ~10 min saindo do Temple of Literature (~2 km)' },
      { id: 'd2-markets', kind: 'activity', title: 'Mercados e cafés', period: 'afternoon', description: 'Dong Xuan Market, o maior mercado coberto de Hanoi, no próprio Old Quarter, e cafés de rua com banquinhos baixos na calçada.' },
      { id: 'd2-food-tour', kind: 'meal', title: 'Food tour (opcional)', period: 'evening', bookingId: 'b-food-tour', description: 'Passeio guiado a pé ou de moto pelas barracas de comida de rua, provando vários pratos típicos (phở, bún chả, bánh cuốn, chè) com explicação. Melhor no fim da tarde/noite. Opcional, não reservado: dá para fazer por conta própria com as sugestões de comida do dia.', status: 'suggestion' },
      {"id": "x24-puppets", "kind": "activity", "title": "Thang Long Water Puppet Theatre", "period": "evening", "placeId": "thang-long-puppets", "travelMode": "walking", "transport": "A pé ~5 min saindo do hotel (fica na margem norte do lago)", "durationMin": 50, "notes": "De novembro a março as sessões da noite costumam esgotar: compre o ingresso antes. Dá para encaixar numa sessão antes ou depois do food tour: confiram os horários no dia.", "status": "suggestion", "extra": true},
      {"id": "x24-hoa-lo", "kind": "activity", "title": "Hoa Lo Prison", "period": "afternoon", "placeId": "hoa-lo", "travelMode": "walking", "transport": "A pé ~15–20 min ou Grab ~5 min saindo do Old Quarter (~1,3 km); ~10 min a pé do hotel", "durationMin": 60, "status": "suggestion", "extra": true},
      { id: 'd2-train-street', kind: 'activity', title: 'Train Street', period: 'afternoon', placeId: 'train-street', travelMode: 'walking', transport: 'A pé ~15 min do hotel (~1,2 km), no lado oeste do Old Quarter', description: 'O trecho mais bonito da rua do trem, com cafés colados nos trilhos. Peçam um café e esperem o trem passar a centímetros.', notes: 'Cheguem cedo para garantir lugar num café. O acesso aos trilhos às vezes é restringido pela polícia; nos cafés costumam saber o horário do próximo trem. Sigam as orientações e saiam dos trilhos quando avisarem.' },
    ]),
  },
  {
    date: '2027-11-24', cityIds: ['hanoi', 'ninh-binh'], hotelId: 'h-ninh-binh',
    weather: {"risk": "low", "note": "Pouca chuva nesta época.", "rainPlan": ["Piscina, spa e descanso no Lotus Valley", "Jantar no próprio hotel em vez de ir a Tam Cốc"]},
    title: 'Começa a natureza',
    summary: 'Muda completamente o ritmo depois de Hanoi e entrega algumas das paisagens mais bonitas da viagem.',
    activities: sug([
      { id: 'd3-checkout', kind: 'check-out', title: 'Check-out do Jade Lantern', time: '08:15', hotelId: 'h-hanoi', placeId: 'hotel-hanoi', status: 'confirmed', notes: 'Façam o check-out antes de sair para o museu (o limite é 12:00) e deixem as malas na recepção até o transfer das 15:00.' },
      { id: 'd3-ethnology', kind: 'activity', title: 'Vietnam Museum of Ethnology', time: '09:00', endTime: '11:30', placeId: 'ethnology-museum', travelMode: 'driving', transport: 'Grab ~25–35 min saindo do hotel (~7 km); volta igual, para almoçar perto do hotel antes do transfer', description: 'As 54 etnias do Vietnã: roupas, objetos do dia a dia, rituais e, no jardim, casas tradicionais em tamanho real (casa comunal, casa sobre palafitas, túmulos). Reservem pelo menos 2 h; o jardim vale tanto quanto o prédio.', notes: 'Fecha às segundas; quarta está aberto. Confiram o horário no dia.' },
      { id: 'd3-transfer', kind: 'transfer', title: 'Transfer Hanoi → Ninh Binh', time: '15:00', endTime: '17:00', bookingId: 'b-transfer-han-nb', status: 'confirmed', description: 'Hanoi → Tam Cốc são uns 100 km, cerca de 2 h de carro pela rodovia.' },
      { id: 'd3-checkin', kind: 'check-in', title: 'Check-in no Lotus Valley Resort (14:00–23:00)', period: 'afternoon', hotelId: 'h-ninh-binh', placeId: 'hotel-ninh-binh', status: 'confirmed', notes: 'O Lotus Valley fica a ~9 km (15–20 min) dos restaurantes de Tam Cốc: combinar ida e volta com o hotel ou chamar Grab (pode demorar 10–15 min).', description: 'Hotel no meio da natureza.' },
    ]),
  },
  {
    date: '2027-11-25', cityIds: ['ninh-binh'], hotelId: 'h-ninh-binh',
    weather: {"risk": "low", "note": "Pouca chuva nesta época, mas os degraus de Hang Mua ficam escorregadios quando molhados.", "rainPlan": ["Pular Hang Mua se os degraus estiverem molhados", "Os barcos de Trang An saem com chuva fraca; com temporal podem suspender", "Trocar pelo pagode Bái Đính, com longos corredores cobertos", "Hoa Lu Ancient Capital", "Bich Dong tem parte dentro de caverna, mas escadas escorregadias"]},
    title: 'Trang An',
    summary: 'Trang An é um dos grandes highlights da viagem. O passeio de barco atravessando as formações de calcário é uma experiência muito diferente de simplesmente visitar um mirante.',
    activities: sug([
      { id: 'd4-trang-an', kind: 'activity', title: 'Passeio de barco em Trang An', placeId: 'trang-an', travelMode: 'driving', transport: 'Táxi ~15 min saindo do hotel (~7 km)', highlight: true, description: 'Cavernas, rios e montanhas calcárias. Não precisa reservar.' },
      { id: 'd4-bich-dong', kind: 'activity', title: 'Bich Dong Pagoda', placeId: 'bich-dong', travelMode: 'driving', transport: 'Táxi ~15 min saindo de Trang An (~6 km)' },
      { id: 'd4-free', kind: 'free-time', title: 'Bicicleta ou tempo livre no hotel', description: 'Bicicleta pelos arrozais e vilarejos, ou piscina no Lotus Valley, que fica no meio das montanhas.' },
      {"id": "x26-hoa-lu", "kind": "activity", "title": "Hoa Lu Ancient Capital", "period": "afternoon", "placeId": "hoa-lu", "travelMode": "driving", "transport": "Táxi ~10 min saindo do hotel (~3 km); de bicicleta, ~15–20 min", "durationMin": 60, "status": "suggestion", "extra": true},
      { id: 'd4-hang-mua', kind: 'activity', title: 'Hang Mua e seu mirante ao pôr do sol', period: 'afternoon', placeId: 'hang-mua', travelMode: 'driving', transport: 'Táxi ~20 min (~9–10 km) saindo de Hoa Lu ou do hotel; peça na recepção', notes: 'Pôr do sol por volta das 17:15: comecem a subir até umas 16:30 (20–30 min de degraus).' },
    ]),
  },
  {
    date: '2027-11-26', cityIds: ['ninh-binh', 'ha-long'], hotelId: 'h-ha-long',
    weather: {"risk": "low", "note": "Ha Long em novembro costuma ser seca e fresca; neblina é comum de manhã.", "rainPlan": ["O cruzeiro ajusta o roteiro: caiaque e paradas podem ser trocados por atividades a bordo", "Com tempo muito ruim, as autoridades podem suspender saídas; o Emerald Bay avisa"]},
    title: 'Cruzeiro pela baía',
    summary: 'Ha Long é uma das paisagens mais icônicas do país e dormir na baía é muito melhor do que fazer bate-volta.',
    activities: sug([
      { id: 'd5-checkout', kind: 'check-out', title: 'Check-out do Lotus Valley Resort (até 11:00)', time: '07:15', hotelId: 'h-ninh-binh', placeId: 'hotel-ninh-binh', status: 'confirmed' },
      { id: 'd5-transfer', kind: 'transfer', title: 'Transfer para Ha Long', time: '07:30', bookingId: 'b-transfer-nb-tuan-chau', status: 'pending', description: 'Ninh Bình → Tuan Chau: 2h30–3h30 de carro. Sair do Lotus Valley às 07:30 no máximo (peça café da manhã cedo) para chegar ao píer até 11:30.' },
      { id: 'd5-boarding', kind: 'check-in', title: 'Embarque no Emerald Bay Cruise', time: '11:30', endTime: '12:00', hotelId: 'h-ha-long', placeId: 'tuan-chau', status: 'confirmed', description: 'Check-in no píer de Tuan Chau entre 11:30 e 12:00. Almoço, jantar e café da manhã incluídos.' },
      { id: 'd5-cruise', kind: 'activity', title: 'Navegação pela baía', period: 'afternoon', highlight: true, description: 'Normalmente inclui caiaque e cavernas ou ilhas.' },
      { id: 'd5-sunset', kind: 'activity', title: 'Sunset no deck', period: 'evening', description: 'Fim de tarde no deck do barco, entre as ilhas de calcário da baía.' },
      { id: 'd5-dinner', kind: 'meal', title: 'Jantar a bordo', period: 'evening', description: 'Jantar incluído no cruzeiro, normalmente com frutos do mar.' },
    ]),
  },
  {
    date: '2027-11-27', cityIds: ['ha-long', 'hoi-an'], hotelId: 'h-hoi-an',
    weather: {"risk": "high", "note": "Chegada ao centro do Vietnã, na época de chuvas: voos e estradas podem atrasar.", "rainPlan": ["Acompanhar o voo LA 725 no app da companhia", "Jantar perto do hotel, na rua Phan Bội Châu", "Se as ruas do centro histórico alagarem, ir de Grab até a porta do hotel"]},
    title: 'Dia de deslocamento',
    summary: 'Ha Long → Cat Bi Airport (Hai Phong) → voo direto para Da Nang → transfer até Hoi An. Assim evitamos voltar para Hanoi depois do cruzeiro. Chegada em Hoi An no fim do dia.',
    activities: sug([
      { id: 'd6-cruise-morning', kind: 'activity', title: 'Manhã no cruzeiro', period: 'morning', description: 'Café, navegação, última atividade e brunch.' },
      { id: 'd6-disembark', kind: 'check-out', title: 'Desembarque em Tuan Chau', time: '11:30', hotelId: 'h-ha-long', placeId: 'tuan-chau', status: 'confirmed', notes: 'Check-out do cruzeiro até 11:30.' },
      { id: 'd6-transfer-hph', kind: 'transfer', title: 'Transfer até o Cat Bi Airport (HPH)', period: 'afternoon', placeId: 'hph-airport', bookingId: 'b-transfer-halong-hph', status: 'pending', description: 'Tuan Chau → Cat Bi Airport (Hai Phong) é cerca de 1h–1h30 de carro. Chegue com 1h30 de antecedência para o voo doméstico.' },
      { id: 'd6-flight', kind: 'flight', title: 'Voo Hai Phong → Da Nang', time: '16:30', endTime: '17:45', flightId: 'hph-dad', status: 'confirmed' },
      { id: 'd6-transfer-hoi-an', kind: 'transfer', title: 'Transfer Da Nang → Hoi An', period: 'evening', bookingId: 'b-transfer-dad-hoian', status: 'pending', description: 'Da Nang Airport → Hội An são uns 30 km, cerca de 40–50 min de carro. Grab funciona bem.' },
      { id: 'd6-checkin', kind: 'check-in', title: 'Check-in no Riverside Lantern (a partir das 14:00)', period: 'evening', hotelId: 'h-hoi-an', placeId: 'hotel-hoi-an', status: 'confirmed' },
    ]),
  },
  {
    date: '2027-11-28', cityIds: ['hoi-an'], hotelId: 'h-hoi-an',
    weather: {"risk": "high", "note": "Com chuva forte, o centro histórico pode alagar parcialmente (água no tornozelo).", "rainPlan": ["Casas antigas, salões de assembleia e museus do ingresso são cobertos", "Oficina de lanternas (coberta)", "Casa de chá Reaching Out e cafés", "Spa", "Se a cidade alagar, siga a orientação do hotel; barquinhos circulam nas ruas"]},
    title: 'Ancient Town + lanternas',
    summary: 'Uma das cidades mais charmosas e fotogênicas do Vietnã — e a experiência noturna é completamente diferente da diurna.',
    activities: sug([
      { id: 'd7-dawn', kind: 'activity', title: 'Centro histórico ao amanhecer', period: 'morning', placeId: 'ancient-town', travelMode: 'walking', transport: 'A pé ~15 min ou bicicleta ~5 min saindo do hotel (~1,2 km)', extra: true, description: 'Por volta das 6–7 h as ruas estão vazias, a luz é suave e o mercado está acordando: o melhor momento para fotos, antes dos grupos.' },
      { id: 'd7-ancient-town', kind: 'activity', title: 'Centro histórico', period: 'morning', placeId: 'ancient-town', travelMode: 'walking', transport: 'A pé ~15 min ou bicicleta ~5 min saindo do hotel (~1,2 km)', description: 'Casas históricas, templos, cafés, lojinhas e restaurantes. Não precisa reservar.', notes: 'Para entrar nas casas antigas, salões de assembleia e museus é preciso o ingresso combinado (vendido em guichês pelo centro), que dá direito a um número limitado de visitas. Sugestões: a casa Tân Ký, o salão de assembleia Phúc Kiến (Fujian), o templo Quan Công e um museu. Confiram preço e regras no guichê.' },
      { id: 'd7-bridge', kind: 'activity', title: 'Japanese Covered Bridge', period: 'morning', placeId: 'japanese-bridge', travelMode: 'walking', transport: 'A pé ~4 min dentro do centro histórico' },
      { id: 'd7-lantern-workshop', kind: 'activity', title: 'Oficina de lanternas', period: 'afternoon', placeId: 'lantern-workshop', travelMode: 'walking', transport: 'No centro histórico, a pé', durationMin: 90, extra: true },
      { id: 'd7-sunset-boat', kind: 'activity', title: 'Barco no rio Thu Bồn ao pôr do sol', time: '17:00', placeId: 'ancient-town', travelMode: 'walking', transport: 'Barquinhos saem da margem do rio, no centro histórico', extra: true, description: 'Ver a cidade acendendo as lanternas a partir da água e descer para jantar. Pôr do sol por volta das 17:10.', notes: 'Combinem o preço antes de embarcar.' },
      { id: 'd7-lanterns', kind: 'activity', title: 'Hoi An iluminada por lanternas', period: 'evening', placeId: 'ancient-town', travelMode: 'walking', transport: 'A pé ~15 min saindo do hotel (~1,2 km)', highlight: true, notes: 'Não coincide com a noite de lua cheia (21/11 e 21/12), mas as lanternas acendem todas as noites. Combine o preço do barquinho antes de embarcar.', description: 'Ao anoitecer, as ruas e o rio Thu Bồn se enchem de lanternas coloridas; dá para soltar uma lanterna de papel no rio a partir de um barquinho.' },
      {"id": "x29-night-market", "kind": "activity", "title": "Mercado noturno", "period": "evening", "placeId": "hoian-night-market", "travelMode": "walking", "transport": "A pé ~3 min saindo da Japanese Covered Bridge, atravessando a ponte para An Hội", "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-11-29', cityIds: ['hoi-an'], hotelId: 'h-hoi-an',
    weather: {"risk": "high", "rainPlan": ["Spa e piscina do hotel", "Trocar bicicleta e barco-cesto por Grab e cafés", "Vilas de cerâmica e marcenaria têm oficinas cobertas"]},
    title: 'Campo + gastronomia + descanso',
    summary: 'Deliberadamente o dia mais lento da viagem. Última noite em Hoi An.',
    activities: sug([
      { id: 'd8-tra-que', kind: 'activity', title: 'Tra Que', placeId: 'tra-que', travelMode: 'driving', transport: 'Bicicleta ~15 min ou Grab ~10 min saindo do hotel (~3 km)' },
      { id: 'd8-bike', kind: 'activity', title: 'Bicicleta pela zona rural', description: 'Estradinhas planas entre arrozais, búfalos e hortas, saindo do centro de Hội An.' },
      { id: 'd8-craft-villages', kind: 'activity', title: 'Vilas de cerâmica (Thanh Hà) e marcenaria (Kim Bồng)', period: 'morning', placeId: 'thanh-ha', travelMode: 'driving', transport: 'Grab ~10–15 min saindo do hotel, ou de bicicleta; Kim Bồng fica do outro lado do rio (barco ou ponte)', extra: true, description: 'O lado artesanal do interior de Hội An: oleiros que trabalham no torno e marceneiros que constroem barcos. Boa alternativa à bicicleta se chover.' },
      { id: 'd8-memories', kind: 'activity', title: 'Hội An Memories Show (opcional)', period: 'evening', placeId: 'hoi-an-memories', travelMode: 'driving', transport: 'Grab ~10 min saindo do hotel', extra: true, notes: 'Não acontece todos os dias: confiram a programação e comprem o ingresso antes.' },
      { id: 'd8-spa', kind: 'free-time', title: 'Spa ou piscina · tarde sem compromisso', period: 'afternoon', description: 'Hội An tem muitos spas com massagem a preço baixo; o Riverside Lantern tem piscina e spa.' },
      { id: 'd8-my-son', kind: 'note', title: 'Alternativa: My Son', placeId: 'my-son', description: 'Se houver bastante interesse por arqueologia. Opcional — com Hue no roteiro, não é considerado necessário.' },
      {"id": "x30-basket-boat", "kind": "activity", "title": "Cam Thanh Basket Boats", "period": "morning", "placeId": "cam-thanh", "travelMode": "driving", "transport": "Grab ~15 min saindo do hotel (~5 km); muitos passeios já incluem o transporte", "durationMin": 45, "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-11-30', cityIds: ['hoi-an', 'hue'], hotelId: 'h-hue',
    weather: {"risk": "high", "note": "Neblina e chuva no Hải Vân Pass são comuns nesta época.", "rainPlan": ["Pedir ao motorista para ir pelo túnel Hải Vân (mais rápido e seguro) e pular só o mirante; o túnel sai em Lăng Cô", "Marble Mountains têm cavernas, mas as escadas ficam escorregadias", "Em Huế, trocar as tumbas (ao ar livre, em morros) por café salgado e o mercado Đông Ba, coberto"]},
    title: 'Road trip pelo Hai Van Pass',
    summary: 'Em vez de perder um dia com deslocamento, a própria viagem entre Hoi An e Hue vira passeio.',
    activities: sug([
      { id: 'd9-checkout', kind: 'check-out', title: 'Check-out do Riverside Lantern (até 12:00)', time: '08:00', hotelId: 'h-hoi-an', placeId: 'hotel-hoi-an', status: 'confirmed' },
      { id: 'd9-road-trip', kind: 'transfer', title: 'Carro privado: Marble Mountains → Hai Van Pass → Lang Co → tumbas → Hue', period: 'morning', bookingId: 'b-hai-van', placeId: 'hai-van', highlight: true, status: 'pending' },
      { id: 'd9-lang-co', kind: 'activity', title: 'Lang Co (almoço ~12:00)', period: 'morning', placeId: 'lang-co' },
      { id: 'd9-khai-dinh', kind: 'activity', title: 'Khai Dinh Tomb', period: 'afternoon', placeId: 'khai-dinh' },
      { id: 'd9-checkin', kind: 'check-in', title: 'Check-in no Perfume River Hotel (~16:30)', period: 'evening', hotelId: 'h-hue', placeId: 'hotel-hue', status: 'confirmed' },
      {"id": "x01-marble", "kind": "activity", "title": "Marble Mountains", "period": "morning", "placeId": "marble-mountains", "durationMin": 75, "transport": "Primeira parada do carro, ~20 min de Hội An", "status": "suggestion", "extra": true},
      {"id": "x01-tu-duc", "kind": "activity", "title": "Tu Duc Tomb", "period": "afternoon", "placeId": "tu-duc", "durationMin": 60, "notes": "Se chegarem a Huế com tempo; fica perto da tumba de Khải Định.", "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-12-01', cityIds: ['hue', 'ho-chi-minh'], hotelId: 'h-saigon',
    weather: {"risk": "high", "note": "Se Huế alagar, a Imperial City pode fechar por alguns dias.", "rainPlan": ["Visitar só os pavilhões principais da Imperial City", "Pular o barco no Perfume River e ir de carro ao Thiên Mụ", "Acompanhar o voo LA 1311 (17:50) no app da Lotus Air", "Almoço coberto perto da Cidadela (veja \"Onde comer\")"]},
    title: 'Vietnã imperial',
    summary: 'Hue acrescenta algo que não existe no restante do roteiro: a história imperial vietnamita. Depois, voo para Ho Chi Minh City.',
    activities: sug([
      { id: 'd10-checkout', kind: 'check-out', title: 'Check-out do Perfume River Hotel (até 12:00)', period: 'morning', hotelId: 'h-hue', placeId: 'hotel-hue', status: 'confirmed', notes: 'Fazer check-out por volta das 07:00 e deixar as malas na recepção; a Cidadela abre ~07:00–07:30.' },
      { id: 'd10-imperial', kind: 'activity', title: 'Imperial City / Citadel', period: 'morning', placeId: 'imperial-city', travelMode: 'driving', transport: 'Grab ~10 min saindo do hotel (~2,5 km)', highlight: true },
      { id: 'd10-thien-mu', kind: 'activity', title: 'Thien Mu Pagoda', period: 'morning', placeId: 'thien-mu', travelMode: 'driving', transport: 'Grab ~15 min saindo da Imperial City (~5 km)' },
      { id: 'd10-perfume', kind: 'activity', title: 'Perfume River', period: 'morning', placeId: 'perfume-river', travelMode: 'driving', transport: 'No píer da Thien Mu Pagoda saem barcos-dragão que voltam pelo rio até o centro (~1 h); ou Grab ~15 min até a orla' },
      { id: 'd10-lunch', kind: 'meal', title: 'Almoço em Hue', period: 'afternoon', description: 'Huế tem cozinha própria, herdeira da corte imperial: bún bò Huế, bánh bèo, cơm hến. Veja "Onde comer".' },
      { id: 'd10-to-airport', kind: 'transfer', title: 'Ida ao Phu Bai Airport (Hue)', period: 'afternoon', placeId: 'hui-airport', description: 'Do centro de Huế ao aeroporto Phú Bài são uns 15 km, cerca de 30 min. Saia por volta das 15:30 para o voo das 17:50.' },
      { id: 'd10-flight', kind: 'flight', title: 'Voo Hue → Ho Chi Minh City', time: '17:50', endTime: '19:15', flightId: 'hui-sgn', status: 'confirmed' },
      { id: 'd10-checkin', kind: 'check-in', title: 'Check-in no Saigon Central Hotel', period: 'evening', hotelId: 'h-saigon', placeId: 'hotel-saigon', status: 'confirmed', notes: 'Saque dong num caixa de banco no desembarque de Tân Sơn Nhất (evite caixas soltos na rua). Caução de VND 1.000.000 em dinheiro; levar o cartão físico do pré-pagamento.' },
      { id: 'd10-dinner', kind: 'meal', title: 'Jantar', period: 'evening', description: 'Primeira noite em Saigon — veja "Onde comer" deste dia.' },
    ]),
  },
  {
    date: '2027-12-02', cityIds: ['ho-chi-minh'], hotelId: 'h-saigon',
    weather: {"risk": "low", "note": "Dezembro é o começo da estação seca em Saigon; calor perto de 30 °C.", "rainPlan": ["O dia já é quase todo em museus cobertos", "Rooftops fecham com temporal: troque por um bar coberto", "Saigon Centre e Takashimaya, ao lado do hotel"]},
    title: 'Guerra + Saigon moderna',
    summary: 'Provavelmente o dia historicamente mais forte da viagem — e também mostra o Vietnã moderno.',
    activities: sug([
      { id: 'd11-independence', kind: 'activity', title: 'Independence Palace', period: 'morning', placeId: 'independence-palace', travelMode: 'walking', transport: 'A pé ~13 min ou Grab ~5 min saindo do hotel (~1 km)', notes: 'Fecha mais cedo (~16:30) e pode fechar no almoço: melhor de manhã.' },
      { id: 'd11-war-remnants', kind: 'activity', title: 'War Remnants Museum', period: 'afternoon', placeId: 'war-remnants', travelMode: 'walking', transport: 'A pé ~15 min ou Grab ~5 min saindo do Central Post Office (~1,1 km)', notes: 'Aberto todo dia 07:30–17:30 (bilheteria até 17:00).', highlight: true },
      { id: 'd11-center', kind: 'activity', title: 'Centro histórico e Nguyen Hue', period: 'afternoon', placeId: 'nguyen-hue', travelMode: 'driving', transport: 'Grab ~8 min saindo do War Remnants Museum (a pé ~25 min, ~1,8 km)', description: 'Cafés e restaurantes.' },
      { id: 'd11-rooftop', kind: 'activity', title: 'Rooftop', period: 'evening', description: 'Saigon tem vários bares no alto de prédios com vista da cidade e do rio. Veja "Onde comer".' },
      {"id": "x03-post-office", "kind": "activity", "title": "Central Post Office e Notre-Dame Cathedral", "period": "morning", "placeId": "saigon-post-office", "travelMode": "walking", "transport": "A pé ~10 min saindo do Independence Palace", "durationMin": 45, "status": "suggestion", "extra": true},
      {"id": "x03-ao-show", "kind": "activity", "title": "AO Show na Ópera", "period": "evening", "placeId": "ao-show", "travelMode": "walking", "transport": "A pé ~5 min saindo da Nguyen Hue (~8 min do hotel)", "durationMin": 60, "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-12-03', cityIds: ['ho-chi-minh'], hotelId: 'h-saigon',
    weather: {"risk": "low", "rainPlan": ["Os túneis de Cu Chi funcionam com chuva, mas com muita lama: roupa velha", "À tarde: mercado Bình Tây (coberto), spa ou shopping"]},
    title: 'Cu Chi Tunnels — a guerra na prática',
    summary: 'Depois do War Remnants Museum, os túneis tornam muito mais concreta a compreensão de como a guerra funcionava no terreno.',
    activities: sug([
      { id: 'd12-cu-chi', kind: 'activity', title: 'Cu Chi Tunnels', period: 'morning', placeId: 'cu-chi', bookingId: 'b-cu-chi', highlight: true, status: 'pending', description: 'Preferência por passeio de meio dia.' },
      { id: 'd12-return', kind: 'transfer', title: 'Volta para Ho Chi Minh City', period: 'afternoon', description: 'Volta do passeio a Cu Chi; chega-se de novo ao centro por volta da hora do almoço.' },
      { id: 'd12-free', kind: 'free-time', title: 'Spa, compras, cafés e tempo livre', period: 'afternoon', description: 'Saigon é ótima para massagem barata e boa, compras (mercado Bến Thành, Saigon Centre ao lado do hotel) e cafés.' },
      {"id": "x04-cho-lon", "kind": "activity", "title": "Chợ Lớn: mercado Bình Tây e templo Thiên Hậu", "period": "afternoon", "placeId": "cho-lon", "travelMode": "driving", "transport": "Grab ~25 min saindo do hotel (~8 km)", "durationMin": 120, "status": "suggestion", "extra": true},
      {"id": "x04-food-moto", "kind": "activity", "title": "Tour noturno de comida de rua de moto", "period": "evening", "description": "Passeio guiado na garupa de motos (com motorista) por bairros fora do centro, provando comida de rua. Várias operadoras buscam no hotel; reserve com 1–2 dias de antecedência.", "status": "suggestion", "extra": true},
    ]),
  },
  {
    date: '2027-12-04', cityIds: ['ho-chi-minh'], hotelId: 'h-saigon',
    weather: {"risk": "low", "rainPlan": ["Os barcos saem com chuva fraca; com temporal, trocar o Mekong por Chợ Lớn, o Jade Emperor Pagoda e museus em Saigon", "Ao reservar, prefira passeio com cancelamento grátis"]},
    title: 'Mekong Delta — bate-volta a Ben Tre',
    summary: 'Uma paisagem e um modo de vida que ainda não aparecem em nenhum outro momento da viagem. Ben Tre em vez de um roteiro gigantesco pelo Delta.',
    activities: sug([
      { id: 'd13-departure', kind: 'transfer', title: 'Saída de Ho Chi Minh City', period: 'morning', description: 'Ben Tre fica a cerca de 2 h de carro de Saigon; os passeios costumam buscar no hotel.' },
      { id: 'd13-mekong', kind: 'activity', title: 'Navegação pelo Mekong em Ben Tre', period: 'morning', placeId: 'ben-tre', bookingId: 'b-mekong', highlight: true, status: 'pending', description: 'Pequenos canais cercados por coqueiros, sampan tradicional, vilarejos, bicicleta ou caminhada pela zona rural e pequenos produtores locais.' },
      { id: 'd13-lunch', kind: 'meal', title: 'Almoço na região', period: 'afternoon' },
      { id: 'd13-return', kind: 'transfer', title: 'Retorno para Ho Chi Minh City', period: 'afternoon', description: 'No fim da tarde.' },
    ]),
  },
  {
    date: '2027-12-05', cityIds: ['ho-chi-minh'],
    weather: {"risk": "low", "rainPlan": ["Ben Thanh Market, Saigon Centre, cafés e spa: tudo a poucos minutos do hotel"]},
    title: 'Último dia sem correria',
    summary: 'Voo somente às 19h40, então ainda existe boa parte do dia para aproveitar.',
    summaryFor: { sam: 'Último dia em Ho Chi Minh City, sem correria. O voo de saída do Sam ainda não foi informado.' },
    activities: sug([
      { id: 'd14-breakfast', kind: 'meal', title: 'Café da manhã sem pressa / brunch', period: 'morning', description: 'Café da manhã incluído no Saigon Central; ou brunch num café de Saigon (veja "Onde comer").' },
      { id: 'd14-shopping', kind: 'activity', title: 'Últimas compras e café vietnamita', period: 'morning', description: 'O café vietnamita é forte, coado no filtro de metal (phin) e servido com leite condensado (cà phê sữa đá, gelado).' },
      { id: 'd14-spa', kind: 'free-time', title: 'Massagem ou spa', period: 'morning', description: 'Uma última massagem antes do voo longo; vários spas no Distrito 1 perto do hotel.' },
      { id: 'd14-lunch', kind: 'meal', title: 'Almoço', period: 'afternoon', description: 'Último almoço vietnamita — veja "Onde comer".' },
      { id: 'd14-checkout', kind: 'check-out', title: 'Check-out do Saigon Central (até 12:00) — pedir late checkout', period: 'afternoon', hotelId: 'h-saigon', placeId: 'hotel-saigon', notes: 'Banho e troca de roupa antes do voo. Pegar de volta a caução. Se não houver late checkout, sair às 12:00, deixar as malas na recepção e aproveitar almoço/spa até as 15:15.' },
      { id: 'd14-to-airport', parties: ['couple'], kind: 'transfer', title: 'Sair do hotel para o aeroporto', time: '15:15', placeId: 'sgn-airport', notes: 'Entre 15h15 e 15h30, para chegar com boa antecedência para o voo internacional.', description: 'Do Distrito 1 ao aeroporto Tân Sơn Nhất são uns 8 km, mas o trânsito pode levar 40–60 min. Voo internacional: chegue 3 h antes.' },
      { id: 'd14-sam-exit', parties: ['sam'], kind: 'flight', title: 'Saída do Sam do Vietnã', period: 'evening', bookingId: 'b-sam-exit', status: 'pending', notes: 'Voo e horário ainda não informados.' },
      { id: 'd14-flight', parties: ['couple'], kind: 'flight', title: 'Voo Ho Chi Minh City → Doha', time: '19:40', flightId: 'sgn-doh', status: 'confirmed' },
      { id: 'd14-flight-gru', parties: ['couple'], kind: 'flight', title: 'Conexão Doha → São Paulo', period: 'evening', flightId: 'doh-gru', status: 'confirmed', description: 'Chegada em Doha às 23:40 (horário de Doha); voo para São Paulo às 00:25 de 06/12, chegada 09:30.' },
      {"id": "x06-ben-thanh", "kind": "activity", "title": "Ben Thanh Market", "period": "morning", "placeId": "ben-thanh", "travelMode": "walking", "transport": "A pé ~5 min saindo do hotel", "notes": "Pechinchar é normal; carregue bolsa do lado oposto à rua.", "status": "suggestion", "extra": true},
      {"id": "x06-jade", "kind": "activity", "title": "Jade Emperor Pagoda", "period": "morning", "placeId": "jade-emperor", "travelMode": "driving", "transport": "Grab ~12 min saindo do Ben Thanh Market (~3 km)", "durationMin": 40, "status": "suggestion", "extra": true},
    ]),
  },
];

export const tripData: TripData = {
  trip: {
    id: 'vietnam-demo',
    title: 'Our Vietnam Trip',
    subtitle: 'Vietnã · roteiro de exemplo',
    startDate: '2027-11-19',
    dayOneDate: '2027-11-22',
    endDate: '2027-12-05',
    datesConfirmed: true,
    timeZone: 'Asia/Ho_Chi_Minh',
    dataStatus: 'imported',
    // Who travels (used by expenses and documents) and the groups that hold their own bookings.
    travelers: [
      { id: 'ana', name: 'Ana' },
      { id: 'leo', name: 'Leo' },
      { id: 'sam', name: 'Sam' },
    ],
    parties: [
      { id: 'couple', name: 'Ana e Leo', members: ['ana', 'leo'] },
      { id: 'sam', name: 'Sam', members: ['sam'] },
    ],
    intro: 'Hanoi → Ninh Binh → Ha Long Bay → Hoi An → Hue → Ho Chi Minh City: 13 noites no Vietnã.',
  },
  cities,
  places,
  hotels,
  airports,
  flights,
  bookings,
  days,
  food,
};
