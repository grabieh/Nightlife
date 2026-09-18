import type { Venue, Profile, Vibe, ChatMessage } from './types';

export const VIBES: Vibe[] = [
  'En la barra',
  'Bailando',
  'En reservados',
  'En la terraza',
  'Buscando compañía',
];

export const ICEBREAKERS = [
  '¿Te invito a una copa?',
  '¿Bailamos?',
  '¿De dónde eres?',
  '¡Te vi desde la barra!',
  '¿Nos vamos a la terraza?',
];

export const VENUES: Venue[] = [
  {
    id: 'santa_rita',
    name: 'Santa Rita',
    address: 'Calle Tejón y Farinós 4, Málaga',
    coverImage: 'https://images.pexels.com/photos/5192307/pexels-photo-5192307.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    goingCount: 187,
    music: 'Reggaeton · Commercial',
    rating: 4.5,
    distance: '0.8 km',
    openUntil: '06:00',
  },
  {
    id: 'la_bro',
    name: 'La Bro',
    address: 'Calle Marqués de Larios 12, Málaga',
    coverImage: 'https://images.pexels.com/photos/8448547/pexels-photo-8448547.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    goingCount: 134,
    music: 'House · Tech House',
    rating: 4.3,
    distance: '1.2 km',
    openUntil: '05:30',
  },
];

const womenPhotos = [
  'https://images.pexels.com/photos/19550604/pexels-photo-19550604.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/12488451/pexels-photo-12488451.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19564205/pexels-photo-19564205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14708214/pexels-photo-14708214.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/27495706/pexels-photo-27495706.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/12182735/pexels-photo-12182735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/38540948/pexels-photo-38540948.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/23196449/pexels-photo-23196449.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14892751/pexels-photo-14892751.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10971245/pexels-photo-10971245.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14519289/pexels-photo-14519289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/29725117/pexels-photo-29725117.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const menPhotos = [
  'https://images.pexels.com/photos/15870127/pexels-photo-15870127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14961755/pexels-photo-14961755.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10009960/pexels-photo-10009960.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/29293306/pexels-photo-29293306.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/31478077/pexels-photo-31478077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/36055181/pexels-photo-36055181.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/34909468/pexels-photo-34909468.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32860765/pexels-photo-32860765.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37181729/pexels-photo-37181729.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32778912/pexels-photo-32778912.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/18178722/pexels-photo-18178722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/17894645/pexels-photo-17894645.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const womenNames = [
  'Lucía', 'Valeria', 'Carmen', 'Martina', 'Sofía', 'Isabella',
  'Daniela', 'Paula', 'Noa', 'Julia', 'Alma', 'Caye',
];

const menNames = [
  'Diego', 'Álvaro', 'Marc', 'Iker', 'Pablo', 'Gonzalo',
  'Nicolás', 'Hugo', 'Mateo', 'Leo', 'Biel', 'Álex',
];

const bios = [
  'Buscando buena música y mejor compañía',
  'La noche es joven y yo con ella',
  'Si bailas bien, nos llevamos bien',
  'Aquí por las copas, me quedo por la gente',
  'No prometo nada, pero diversion garantizada',
  'Mi vibe: bailar hasta que cierren',
  'Solo aquí por el ambiente',
  'Buscando a alguien que me invite a una copa',
  'En la barra esperando mi momento',
  'La fiesta no empieza hasta que yo llego',
];

const vibes: Vibe[] = ['En la barra', 'Bailando', 'En reservados', 'En la terraza', 'Buscando compañía'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildProfiles(): Profile[] {
  const profiles: Profile[] = [];
  let wIdx = 0;
  let mIdx = 0;

  for (let i = 0; i < 6; i++) {
    const photoSet = [womenPhotos[wIdx % womenPhotos.length], womenPhotos[(wIdx + 1) % womenPhotos.length], womenPhotos[(wIdx + 2) % womenPhotos.length]];
    profiles.push({
      id: `p_w_${i}`,
      name: pick(womenNames, i),
      age: 20 + ((i * 3) % 8),
      instagram: `@${pick(womenNames, i).toLowerCase()}_${(i + 10)}`,
      vibe: pick(vibes, i),
      photos: photoSet,
      bio: pick(bios, i),
      venueId: VENUES[i % VENUES.length].id,
      gender: 'female',
    });
    wIdx += 3;
  }

  for (let i = 0; i < 6; i++) {
    const photoSet = [menPhotos[mIdx % menPhotos.length], menPhotos[(mIdx + 1) % menPhotos.length], menPhotos[(mIdx + 2) % menPhotos.length]];
    profiles.push({
      id: `p_m_${i}`,
      name: pick(menNames, i),
      age: 22 + ((i * 3) % 8),
      instagram: `@${pick(menNames, i).toLowerCase()}_${(i + 10)}`,
      vibe: pick(vibes, i + 2),
      photos: photoSet,
      bio: pick(bios, i + 3),
      venueId: VENUES[i % VENUES.length].id,
      gender: 'male',
    });
    mIdx += 3;
  }

  return profiles;
}

export const ALL_PROFILES: Profile[] = buildProfiles();

export function getProfilesForVenue(venueId: string): Profile[] {
  return ALL_PROFILES.filter((p) => p.venueId === venueId);
}

export const INSTAGRAM_MOCK_PHOTOS = [
  womenPhotos[0],
  womenPhotos[1],
  womenPhotos[2],
  womenPhotos[3],
  menPhotos[0],
  menPhotos[1],
  menPhotos[2],
  menPhotos[3],
];

export const MOCK_CHAT_REPLIES: string[] = [
  '¡Jaja sí! ¿Y tú qué tal?',
  '¿Estás en la barra? Te invito entonces',
  '¡Me encanta esa vibra! ¿Bailamos?',
  'Acabo de llegar, ¿cómo está el ambiente?',
  '¡Sí! Nos vemos en la pista',
  '¿De dónde eres? Soy de Málaga',
  '¡Qué guay! Pues nos vemos dentro',
  'Estoy en reservados, ¿te acercas?',
];

export function makeInitialMessages(profileId: string): ChatMessage[] {
  return [
    {
      id: `msg_${profileId}_0`,
      senderId: profileId,
      text: '¡Hey! Nos cruzamos esta noche',
      timestamp: Date.now() - 600000,
    },
  ];
}
