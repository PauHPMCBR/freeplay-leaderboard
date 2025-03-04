import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data if needed
  await prisma.submission.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.gameType.deleteMany({});
  await prisma.bTD6Map.deleteMany({});

  console.log('Cleared existing data');

  // Create BTD6 Maps
  // Beginner Maps
  const beginnerMaps = [
    { name: 'Alpine Run', code: 'alpine_run', difficulty: 'BEGINNER' },
    { name: 'Candy Falls', code: 'candy_falls', difficulty: 'BEGINNER' },
    { name: 'Carved', code: 'carved', difficulty: 'BEGINNER' },
    { name: 'Cubism', code: 'cubism', difficulty: 'BEGINNER' },
    { name: 'End Of The Road', code: 'end_of_the_road', difficulty: 'BEGINNER' },
    { name: 'Four Circles', code: 'four_circles', difficulty: 'BEGINNER' },
    { name: 'Frozen Over', code: 'frozen_over', difficulty: 'BEGINNER' },
    { name: 'Hedge', code: 'hedge', difficulty: 'BEGINNER' },
    { name: 'In The Loop', code: 'in_the_loop', difficulty: 'BEGINNER' },
    { name: 'Logs', code: 'logs', difficulty: 'BEGINNER' },
    { name: 'Lotus Island', code: 'lotus_island', difficulty: 'BEGINNER' },
    { name: 'Middle of the Road', code: 'middle_of_the_road', difficulty: 'BEGINNER' },
    { name: 'Monkey Meadow', code: 'monkey_meadow', difficulty: 'BEGINNER' },
    { name: 'One Two Tree', code: 'one_two_tree', difficulty: 'BEGINNER' },
    { name: 'Park Path', code: 'park_path', difficulty: 'BEGINNER' },
    { name: 'Resort', code: 'resort', difficulty: 'BEGINNER' },
    { name: 'Scrapyard', code: 'scrapyard', difficulty: 'BEGINNER' },
    { name: 'Skates', code: 'skates', difficulty: 'BEGINNER' },
    { name: 'The Cabin', code: 'the_cabin', difficulty: 'BEGINNER' },
    { name: 'Tinkerton', code: 'tinkerton', difficulty: 'BEGINNER' },
    { name: 'Town Center', code: 'town_center', difficulty: 'BEGINNER' },
    { name: 'Tree Stump', code: 'tree_stump', difficulty: 'BEGINNER' },
    { name: 'Winter Park', code: 'winter_park', difficulty: 'BEGINNER' }
  ];

  // Intermediate Maps  
  const intermediateMaps = [
    { name: 'Adora\'s Temple', code: 'adoras_temple', difficulty: 'INTERMEDIATE' },
    { name: 'Balance', code: 'balance', difficulty: 'INTERMEDIATE' },
    { name: 'Bazaar', code: 'bazaar', difficulty: 'INTERMEDIATE' },
    { name: 'Bloonarius Prime', code: 'bloonarius_prime', difficulty: 'INTERMEDIATE' },
    { name: 'Chutes', code: 'chutes', difficulty: 'INTERMEDIATE' },
    { name: 'Covered Garden', code: 'covered_garden', difficulty: 'INTERMEDIATE' },
    { name: 'Cracked', code: 'cracked', difficulty: 'INTERMEDIATE' },
    { name: 'Downstream', code: 'downstream', difficulty: 'INTERMEDIATE' },
    { name: 'Encrypted', code: 'encrypted', difficulty: 'INTERMEDIATE' },
    { name: 'Firing Range', code: 'firing_range', difficulty: 'INTERMEDIATE' },
    { name: 'Haunted', code: 'haunted', difficulty: 'INTERMEDIATE' },
    { name: 'KartsNDarts', code: 'kartsndarts', difficulty: 'INTERMEDIATE' },
    { name: 'Luminous Cove', code: 'luminous_cove', difficulty: 'INTERMEDIATE' },
    { name: 'Moon Landing', code: 'moon_landing', difficulty: 'INTERMEDIATE' },
    { name: 'Polyphemus', code: 'polyphemus', difficulty: 'INTERMEDIATE' },
    { name: 'Protect The Yacht', code: 'protect_the_yacht', difficulty: 'INTERMEDIATE' },
    { name: 'Quarry', code: 'quarry', difficulty: 'INTERMEDIATE' },
    { name: 'Quiet Street', code: 'quiet_street', difficulty: 'INTERMEDIATE' },
    { name: 'Rake', code: 'rake', difficulty: 'INTERMEDIATE' },
    { name: 'Spice Islands', code: 'spice_islands', difficulty: 'INTERMEDIATE' },
    { name: 'Spring Spring', code: 'spring_spring', difficulty: 'INTERMEDIATE' },
    { name: 'Streambed', code: 'streambed', difficulty: 'INTERMEDIATE' },
    { name: 'Sulfur Springs', code: 'sulfur_springs', difficulty: 'INTERMEDIATE' },
    { name: 'Water Park', code: 'water_park', difficulty: 'INTERMEDIATE' }
  ];

  // Advanced Maps
  const advancedMaps = [
    { name: 'Ancient Portal', code: 'ancient_portal', difficulty: 'ADVANCED' },
    { name: 'Another Brick', code: 'another_brick', difficulty: 'ADVANCED' },
    { name: 'Cargo', code: 'cargo', difficulty: 'ADVANCED' },
    { name: 'Castle Revenge', code: 'castle_revenge', difficulty: 'ADVANCED' },
    { name: 'Cornfield', code: 'cornfield', difficulty: 'ADVANCED' },
    { name: 'Dark Path', code: 'dark_path', difficulty: 'ADVANCED' },
    { name: 'Enchanted Glade', code: 'enchanted_glade', difficulty: 'ADVANCED' },
    { name: 'Erosion', code: 'erosion', difficulty: 'ADVANCED' },
    { name: 'Geared', code: 'geared', difficulty: 'ADVANCED' },
    { name: 'High Finance', code: 'high_finance', difficulty: 'ADVANCED' },
    { name: 'Last Resort', code: 'last_resort', difficulty: 'ADVANCED' },
    { name: 'Mesa', code: 'mesa', difficulty: 'ADVANCED' },
    { name: 'Midnight Mansion', code: 'midnight_mansion', difficulty: 'ADVANCED' },
    { name: 'Off The Coast', code: 'off_the_coast', difficulty: 'ADVANCED' },
    { name: 'Pat\'s Pond', code: 'pats_pond', difficulty: 'ADVANCED' },
    { name: 'Peninsula', code: 'peninsula', difficulty: 'ADVANCED' },
    { name: 'Spillway', code: 'spillway', difficulty: 'ADVANCED' },
    { name: 'Sunken Columns', code: 'sunken_columns', difficulty: 'ADVANCED' },
    { name: 'Underground', code: 'underground', difficulty: 'ADVANCED' },
    { name: 'X Factor', code: 'x_factor', difficulty: 'ADVANCED' }
  ];

  // Expert Maps
  const expertMaps = [
    { name: '#ouch', code: 'ouch', difficulty: 'EXPERT' },
    { name: 'Blons', code: 'blons', difficulty: 'EXPERT' },
    { name: 'Bloody Puddles', code: 'bloody_puddles', difficulty: 'EXPERT' },
    { name: 'Dark Castle', code: 'dark_castle', difficulty: 'EXPERT' },
    { name: 'Dark Dungeons', code: 'dark_dungeons', difficulty: 'EXPERT' },
    { name: 'Flooded Valley', code: 'flooded_valley', difficulty: 'EXPERT' },
    { name: 'Glacial Trail', code: 'glacial_trail', difficulty: 'EXPERT' },
    { name: 'Infernal', code: 'infernal', difficulty: 'EXPERT' },
    { name: 'Muddy Puddles', code: 'muddy_puddles', difficulty: 'EXPERT' },
    { name: 'Quad', code: 'quad', difficulty: 'EXPERT' },
    { name: 'Ravine', code: 'ravine', difficulty: 'EXPERT' },
    { name: 'Sanctuary', code: 'sanctuary', difficulty: 'EXPERT' },
    { name: 'Workshop', code: 'workshop', difficulty: 'EXPERT' }
  ];

  // Combine all maps
  const allBtd6Maps = [
    ...beginnerMaps,
    ...intermediateMaps,
    ...advancedMaps,
    ...expertMaps
  ];

  const allMapCodes = allBtd6Maps.map(btd6Map => btd6Map.code);

  const createdMaps = await Promise.all(
    allBtd6Maps.map(map => 
      prisma.bTD6Map.create({
        data: map
      })
    )
  );

  console.log(`Created ${createdMaps.length} maps`);

  // Create Game Types
  const allGameTypes = [
    { name: 'Easy', code: 'easy', difficulty: 'Easy' },
    { name: 'Primary Only', code: 'primary_only', difficulty: 'Easy' },
    { name: 'Deflation', code: 'deflation', difficulty: 'Easy' },

    { name: 'Medium', code: 'medium', difficulty: 'Medium' },
    { name: 'Military Only', code: 'military_only', difficulty: 'Medium' },
    { name: 'Apopalypse', code: 'apopalypse', difficulty: 'Medium' },
    { name: 'Reverse', code: 'reverse', difficulty: 'Medium' },

    { name: 'Hard', code: 'hard', difficulty: 'Hard' },
    { name: 'Magic Only', code: 'magic_only', difficulty: 'Hard' },
    { name: 'Double HP MOABs', code: 'double_hp_moabs', difficulty: 'Hard' },
    { name: 'Half Cash', code: 'half_cash', difficulty: 'Hard' },
    { name: 'Alternate Bloon Rounds', code: 'alternate_bloons_rounds', difficulty: 'Hard' },
    
    { name: 'Impoppable', code: 'impoppable', difficulty: 'Hard' },  
    { name: 'CHIMPS', code: 'chimps', difficulty: 'Hard' },
  ];

  const allGameTypeCodes = allGameTypes.map(gameType => gameType.code);

  const createdGameTypes = await Promise.all(
    allGameTypes.map(gameType => 
      prisma.gameType.create({
        data: gameType
      })
    )
  );

  console.log(`Created ${createdGameTypes.length} game types`);

   // Create Heroes
   const heroes = [
    { name: 'None', code: 'none' },
    { name: 'Quincy', code: 'quincy' },
    { name: 'Gwendolin', code: 'gwendolin' },
    { name: 'Striker Jones', code: 'striker_jones' },
    { name: 'Obyn Greenfoot', code: 'obyn_greenfoot' },
    { name: 'Rosalia', code: 'rosalia' },
    { name: 'Captain Churchill', code: 'captain_churchill' },
    { name: 'Benjamin', code: 'benjamin' },
    { name: 'Pat Fusty', code: 'pat_fusty' },
    { name: 'Ezili', code: 'ezili' },
    { name: 'Adora', code: 'adora' },
    { name: 'Etienne', code: 'etienne' },
    { name: 'Sauda', code: 'sauda' },
    { name: 'Admiral Brickell', code: 'admiral_brickell' },
    { name: 'Psi', code: 'psi' },
    { name: 'Geraldo', code: 'geraldo' },
    { name: 'Corvus', code: 'corvus' }
  ];

  const createdHeroes = await Promise.all(
    heroes.map(hero => 
      prisma.hero.create({
        data: hero
      })
    )
  );

  console.log(`Created ${createdHeroes.length} heroes`);

  const challenges = [
    // Universal Challenges
    {
      name: 'No Legend of the Night',
      code: 'no_legend_of_the_night',
      maps: 'all', // Connect to all maps
      gameTypes: 'all' // Connect to all game types
    },
    {
      name: 'No Hero',
      code: 'no_hero',
      maps: 'all',
      gameTypes: 'all'
    },
    {
      name: 'No Powers',
      code: 'no_powers',
      maps: 'all',
      gameTypes: 'all'
    },
    {
      name: 'Used Modifiers',
      code: 'used_modifiers',
      maps: 'all',
      gameTypes: 'all'
    },
  
    // Game Mode Specific
    {
      name: 'No Monkey Knowledge',
      code: 'no_monkey_knowledge',
      maps: 'all',
      gameTypes: [
        'easy',
        'primary_only',
        'deflation',
        'medium',
        'military_only',
        'apopalypse',
        'reverse',
        'hard',
        'magic_only',
        'double_hp_moabs',
        'half_cash',
        'alternate_bloons_rounds',
        'impoppable',
      ] // Exclude CHIMPS
    },
  
    // Map Specific Challenges
    {
      name: 'No Harvest',
      code: 'no_harvest',
      maps: ['cornfield'],
      gameTypes: 'all'
    },
    {
      name: 'Water Only',
      code: 'water_only',
      maps: [
        'candy_falls', 'carved', 'cubism', 'end_of_the_road',
        'four_circles', 'frozen_over', 'in_the_loop',
        'logs', 'lotus_island', 'middle_of_the_road',
        'one_two_tree', 'park_path', 'resort', 'skates',
        'the_cabin', 'tinkerton', 'town_center', 'winter_park',
        'adoras_temple', 'balance', 'bazaar', 'bloonarius_prime',
        'chutes', 'covered_garden', 'cracked', 'downstream',
        'encrypted', 'firing_range', 'haunted', 'luminous_cove',
        'polyphemus', 'protect_the_yacht', 'quarry', 'rake',
        'spice_islands', 'spring_spring', 'streambed',
        'sulfur_springs', 'water_park', 'ancient_portal',
        'another_brick', 'cargo', 'castle_revenge', 'enchanted_glade',
        'erosion', 'high_finance', 'last_resort', 'off_the_coast',
        'pats_pond', 'peninsula', 'spillway', 'sunken_columns',
        'ouch', 'blons', 'bloody_puddles', 'dark_castle',
        'dark_dungeons', 'flooded_valley', 'glacial_trail',
        'infernal', 'muddy_puddles', 'quad', 'ravine', 'sanctuary',
      ],
      gameTypes: 'all'
    },
    {
      name: 'Space Restricted',
      code: 'space_restricted',
      maps: [
        'middle_of_the_road', 'tree_stump', 'one_two_tree', 'scrapyard',
        'resort', 'lotus_island', 'winter_park', 'carved', 'cubism',
        'four_circles', 'luminous_cove', 'sulfur_springs', 'water_park',
        'covered_garden', 'quarry', 'quiet_street', 'balance',
        'encrypted', 'adoras_temple', 'spring_spring', 'kartsndarts',
        'haunted', 'downstream', 'firing_range', 'protect_the_yacht',
        'enchanted_glade', 'ancient_portal', 'castle_revenge',
        'dark_path', 'erosion', 'sunken_columns', 'mesa', 'geared',
        'peninsula', 'high_finance', 'another_brick', 'off_the_coast',
        'cornfield', 'underground', 'sanctuary', 'dark_castle', 'ouch',
        'blons'
      ],
      gameTypes: 'all'
    }
  ];

  // Create challenges and connect with maps and game types
  for (const challenge of challenges) {
    const { name, code, maps, gameTypes } = challenge;
    
    await prisma.challenge.create({
      data: {
        name,
        code,
        btd6Maps: {
          connect: (typeof(maps) === 'string') // 'all'
                ? allMapCodes.map(mapCode => ({ code : mapCode }))
                : maps.map(mapCode => ({ code: mapCode }))
        },
        gameTypes: {
          connect: (typeof(gameTypes) === 'string') // 'all'
                ? allGameTypeCodes.map(gameTypeCode => ({ code: gameTypeCode }))
                : gameTypes.map(gameTypeCode => ({ code: gameTypeCode }))
              }
      }
    });
  }

  console.log(`Created ${challenges.length} challenges`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });