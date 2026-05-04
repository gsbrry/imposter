export type Difficulty = 'easy' | 'medium' | 'hard';

export type CategoryKey =
  | 'general'
  | 'vehicles'
  | 'home'
  | 'food'
  | 'bollywood'
  | 'sports'
  | 'animals'
  | 'jobs'
  | 'festival';

export interface Category {
  id: CategoryKey;
  label: string;
  emoji: string;
  free: boolean;
}

export const CATEGORIES: Category[] = [
  { id: 'general', label: 'General', emoji: '🧠', free: true },
  { id: 'vehicles', label: 'Vehicles', emoji: '🚗', free: true },
  { id: 'home', label: 'Home & Household', emoji: '🏠', free: true },
  { id: 'food', label: 'Food & Drinks', emoji: '🍛', free: false },
  { id: 'bollywood', label: 'Bollywood & Movies', emoji: '🎬', free: false },
  { id: 'sports', label: 'Sports & Games', emoji: '🏏', free: false },
  { id: 'animals', label: 'Animals & Nature', emoji: '🦁', free: false },
  { id: 'jobs', label: 'Jobs & Professions', emoji: '💼', free: false },
  { id: 'festival', label: 'Festival & Celebration', emoji: '🎉', free: false },
];

export const WORDS: Record<CategoryKey, Record<Difficulty, string[]>> = {
  general: {
    easy: [
      'Chair', 'Table', 'Clock', 'Mirror', 'Pillow', 'Bucket', 'Lamp', 'Book', 'Pen', 'Door',
      'Window', 'Phone', 'Bag', 'Shoe', 'Hat', 'Sock', 'Cup', 'Plate', 'Fork', 'Knife',
      'Spoon', 'Bowl', 'Box', 'Key', 'Lock', 'Ball', 'Toy', 'Rope', 'Nail', 'Glue',
      'Tape', 'Brush', 'Comb', 'Ring', 'Watch', 'Belt', 'Wallet', 'Coin', 'Stamp', 'Card',
      'Map', 'Pen', 'Ruler', 'Eraser', 'Pencil', 'Notebook', 'Folder', 'Bottle', 'Can', 'Jar',
    ],
    medium: [
      'Compass', 'Telescope', 'Hammock', 'Lantern', 'Puzzle', 'Umbrella', 'Candle', 'Ladder',
      'Anchor', 'Magnifier', 'Microscope', 'Binoculars', 'Thermometer', 'Barometer', 'Calendar',
      'Calculator', 'Typewriter', 'Projector', 'Scanner', 'Printer', 'Stapler', 'Shredder',
      'Hourglass', 'Compass', 'Gyroscope', 'Pendulum', 'Metronome', 'Sundial', 'Abacus', 'Globe',
      'Atlas', 'Dictionary', 'Encyclopedia', 'Thesaurus', 'Blueprint', 'Diagram', 'Schematic',
      'Prototype', 'Specimen', 'Artifact', 'Relic', 'Fossil', 'Crystal', 'Prism', 'Lens',
      'Mirror', 'Periscope', 'Kaleidoscope', 'Telescope', 'Sextant', 'Astrolabe',
    ],
    hard: [
      'Abacus', 'Periscope', 'Astrolabe', 'Sextant', 'Orrery', 'Theodolite', 'Clinometer',
      'Spectrometer', 'Interferometer', 'Oscilloscope', 'Voltmeter', 'Galvanometer', 'Hygrometer',
      'Anemometer', 'Seismograph', 'Tachometer', 'Chronometer', 'Stethoscope', 'Ophthalmoscope',
      'Otoscope', 'Forceps', 'Scalpel', 'Retractor', 'Curette', 'Lancet', 'Trocar', 'Cannula',
      'Catheter', 'Tourniquet', 'Manometer', 'Rheometer', 'Viscometer', 'Refractometer',
      'Densitometer', 'Calorimeter', 'Photometer', 'Radiometer', 'Pyrometer', 'Bolometer',
      'Actinometer', 'Dosimeter', 'Geiger', 'Scintillator', 'Cyclotron', 'Synchrotron',
      'Magnetometer', 'Gravimeter', 'Inclinometer', 'Tiltmeter', 'Extensometer',
    ],
  },
  vehicles: {
    easy: [
      'Car', 'Bus', 'Train', 'Bike', 'Truck', 'Van', 'Taxi', 'Scooter', 'Tractor', 'Ferry',
      'Boat', 'Ship', 'Plane', 'Rocket', 'Helicopter', 'Cycle', 'Auto', 'Jeep', 'Cab', 'Cart',
      'Rickshaw', 'Tuk-tuk', 'Minibus', 'Lorry', 'Coach', 'Caravan', 'Ambulance', 'Firetruck', 'Police', 'School bus',
      'Subway', 'Tram', 'Monorail', 'Cable car', 'Gondola', 'Canoe', 'Kayak', 'Raft', 'Yacht', 'Catamaran',
      'Glider', 'Balloon', 'Airship', 'Drone', 'Segway', 'Skateboard', 'Surfboard', 'Toboggan', 'Sled', 'Chariot',
    ],
    medium: [
      'Submarine', 'Zeppelin', 'Hovercraft', 'Hydrofoil', 'Catamaran', 'Trimaran', 'Skiff',
      'Dinghy', 'Galleon', 'Frigate', 'Destroyer', 'Cruiser', 'Corvette', 'Frigate', 'Tanker',
      'Freighter', 'Container ship', 'Tugboat', 'Dredger', 'Icebreaker', 'Lifeboat', 'Speedboat',
      'Motorboat', 'Pontoon', 'Houseboat', 'Barge', 'Narrowboat', 'Paddleboat', 'Rowboat', 'Sailboat',
      'Paraglider', 'Hang glider', 'Ultralight', 'Seaplane', 'Float plane', 'Flying boat', 'Biplane',
      'Monoplane', 'Triplane', 'Fighter jet', 'Bomber', 'Cargo plane', 'Jumbo jet', 'Concorde',
      'Space shuttle', 'Spacecraft', 'Satellite', 'Rover', 'Lander', 'Probe',
    ],
    hard: [
      'Bathyscaphe', 'Bathysphere', 'Submersible', 'ROV', 'AUV', 'Hydroplane', 'Ground effect vehicle',
      'Wing in ground', 'Ekranoplan', 'Aerodyne', 'Ornithopter', 'Autogyro', 'Gyrodyne', 'Convertiplane',
      'Tiltrotor', 'Tiltwing', 'Vectored thrust', 'Cyclogyro', 'Flettner', 'Dynaship', 'Maglev',
      'Hyperloop', 'Vactrain', 'Scramjet', 'Ramjet', 'Pulsejet', 'Turbojet', 'Turboprop', 'Turbofan',
      'Turboshaft', 'Rocket sled', 'Linear motor', 'Monorail capsule', 'Personal rapid transit',
      'Automated guideway', 'Cable propelled', 'Funicular', 'Rack railway', 'Mountain railway', 'Cog railway',
      'Wuppertal', 'Aerobus', 'Peoplemover', 'Aerotrain', 'Tracked air cushion', 'Grumman', 'Beriev',
      'Caproni', 'Dornier', 'Latécoère',
    ],
  },
  home: {
    easy: [
      'Sofa', 'Bed', 'Wardrobe', 'Fridge', 'Oven', 'Microwave', 'Kettle', 'Toaster', 'Fan', 'AC',
      'TV', 'Radio', 'Vacuum', 'Mop', 'Broom', 'Dustpan', 'Bucket', 'Sponge', 'Soap', 'Shampoo',
      'Towel', 'Pillow', 'Blanket', 'Curtain', 'Mattress', 'Shelf', 'Mirror', 'Tap', 'Sink', 'Toilet',
      'Shower', 'Bathtub', 'Doorbell', 'Doormat', 'Flowerpot', 'Painting', 'Photo frame', 'Vase', 'Candle', 'Clock',
      'Table lamp', 'Floor lamp', 'Ceiling fan', 'Tubelight', 'Switchboard', 'Extension cord', 'Mixer', 'Grinder', 'Blender', 'Juicer',
    ],
    medium: [
      'Pressure cooker', 'Ladle', 'Rolling pin', 'Chopping board', 'Colander', 'Sieve', 'Whisk',
      'Spatula', 'Tongs', 'Peeler', 'Grater', 'Mortar', 'Pestle', 'Casserole', 'Dutch oven',
      'Wok', 'Steamer', 'Slow cooker', 'Bread maker', 'Ice cream maker', 'Waffle maker', 'Sandwich press',
      'Dehumidifier', 'Humidifier', 'Air purifier', 'Water purifier', 'Softener', 'Dispenser',
      'Garbage disposal', 'Dishwasher', 'Washing machine', 'Dryer', 'Iron', 'Ironing board',
      'Sewing machine', 'Loom', 'Spinning wheel', 'Weaving frame', 'Embroidery hoop', 'Knitting needle',
      'Crochet hook', 'Thimble', 'Bobbin', 'Shuttle', 'Needle threader', 'Seam ripper', 'Tailor chalk',
      'Pattern paper', 'Dress form', 'Mannequin',
    ],
    hard: [
      'Vermiculite', 'Perlite', 'Hydroponics', 'Aeroponics', 'Aquaponics', 'Vermicompost', 'Bokashi',
      'Biodigester', 'Composter', 'Wormery', 'Rainwater harvester', 'Greywater recycler', 'Soakaway',
      'French drain', 'Sump pump', 'Sewage treatment', 'Septic tank', 'Cesspit', 'Soilpipe', 'Standpipe',
      'Ballcock', 'Stopcock', 'Isolator valve', 'Pressure relief', 'Expansion vessel', 'Radiator bleed',
      'Thermostatic valve', 'Zone valve', 'Manifold', 'Header tank', 'Cold water cistern', 'Loft insulation',
      'Cavity wall insulation', 'Underfloor heating', 'Heat pump', 'MVHR', 'Biomass boiler', 'Solar thermal',
      'Photovoltaic', 'Battery storage', 'Smart meter', 'Occupancy sensor', 'PIR detector', 'Smoke ionisation',
      'Heat detector', 'CO detector', 'Radon sump', 'Damp proof course', 'Tanking slurry', 'Injection damp proof',
    ],
  },
  food: {
    easy: [
      'Rice', 'Roti', 'Dal', 'Curry', 'Chai', 'Samosa', 'Biryani', 'Dosa', 'Idli', 'Poha',
      'Upma', 'Paratha', 'Naan', 'Puri', 'Kulfi', 'Lassi', 'Mango', 'Banana', 'Apple', 'Potato',
      'Onion', 'Tomato', 'Spinach', 'Carrot', 'Peas', 'Lentil', 'Egg', 'Milk', 'Butter', 'Paneer',
      'Curd', 'Ghee', 'Mustard', 'Cumin', 'Turmeric', 'Ginger', 'Garlic', 'Chilli', 'Coriander', 'Pepper',
      'Sugar', 'Salt', 'Oil', 'Vinegar', 'Tamarind', 'Coconut', 'Cashew', 'Almond', 'Peanut', 'Raisin',
    ],
    medium: [
      'Paneer', 'Kulfi', 'Papad', 'Dhokla', 'Lassi', 'Rasam', 'Pav Bhaji', 'Chhole Bhature',
      'Rajma Chawal', 'Kadhi Pakora', 'Aloo Gobi', 'Matar Paneer', 'Saag', 'Palak', 'Methi',
      'Baingan Bharta', 'Jeera Rice', 'Pulao', 'Khichdi', 'Halwa', 'Gulab Jamun', 'Rasgulla',
      'Jalebi', 'Ladoo', 'Barfi', 'Peda', 'Kheer', 'Rabri', 'Phirni', 'Payasam',
      'Pongal', 'Appam', 'Uttapam', 'Pesarattu', 'Adai', 'Medu Vada', 'Rasam', 'Sambhar',
      'Kootu', 'Aviyal', 'Olan', 'Thoran', 'Pachadi', 'Raita', 'Chutney', 'Pickle', 'Papad',
      'Fryums', 'Poppadom', 'Kachori',
    ],
    hard: [
      'Kokum', 'Hing', 'Kalonji', 'Ajwain', 'Mace', 'Star anise', 'Cardamom', 'Fenugreek',
      'Asafoetida', 'Nigella', 'Carrom', 'Lovage', 'Dill', 'Fennel pollen', 'Sumac', 'Za\'atar',
      'Harissa', 'Ras el hanout', 'Berbere', 'Dukkah', 'Baharat', 'Chermoula', 'Mole', 'Sofrito',
      'Mirepoix', 'Brunoise', 'Julienne', 'Chiffonade', 'Tourner', 'Mandoline', 'Beurre blanc',
      'Hollandaise', 'Béarnaise', 'Velouté', 'Espagnole', 'Béchamel', 'Allemande', 'Suprême',
      'Soubise', 'Charon', 'Maltaise', 'Mousseline', 'Gribiche', 'Remoulade', 'Ravigote',
      'Vierge', 'Verjuice', 'Agrodolce', 'Mostarda', 'Gremolata',
    ],
  },
  bollywood: {
    easy: [
      'Hero', 'Villain', 'Song', 'Dance', 'Film', 'Actor', 'Actress', 'Director', 'Producer', 'Script',
      'Scene', 'Role', 'Makeup', 'Costume', 'Stage', 'Camera', 'Lights', 'Action', 'Cut', 'Take',
      'Trailer', 'Poster', 'Award', 'Fan', 'Star', 'Celebrity', 'Interview', 'Review', 'Rating', 'Sequel',
      'Remake', 'Comedy', 'Drama', 'Romance', 'Action', 'Horror', 'Thriller', 'Mystery', 'Musical', 'Biopic',
      'Debut', 'Release', 'Blockbuster', 'Flop', 'Hit', 'Superhit', 'Climax', 'Interval', 'Flashback', 'Plot',
    ],
    medium: [
      'Stunt double', 'Choreographer', 'Item number', 'Playback singer', 'Lyricist', 'Music director',
      'Cinematographer', 'Editor', 'Art director', 'Set designer', 'Costume designer', 'Casting director',
      'Dialogue writer', 'Screenplay', 'Narration', 'Voiceover', 'Dubbing', 'ADR', 'Foley',
      'Continuity', 'Location scout', 'Production designer', 'Visual effects', 'Motion capture',
      'Green screen', 'Post production', 'Color grading', 'Sound mixing', 'Background score',
      'Title track', 'Montage', 'Close-up', 'Pan shot', 'Crane shot', 'Dolly shot', 'Tracking shot',
      'Aerial shot', 'Point of view', 'Establishing shot', 'Reaction shot', 'Cutaway', 'Insert',
      'Freeze frame', 'Slow motion', 'Time lapse', 'Split screen', 'Wipe', 'Dissolve',
    ],
    hard: [
      'Auteur', 'Verisimilitude', 'Diegetic', 'Non-diegetic', 'Mise en scène', 'Cinematheque',
      'Nouvelle Vague', 'Neorealism', 'Expressionism', 'Surrealism', 'Dogme 95', 'Cinema verité',
      'Direct cinema', 'Found footage', 'Mockumentary', 'Pseudo-documentary', 'Mockbuster',
      'Deconstruction', 'Postmodern', 'Intertextuality', 'Metafiction', 'Metalepsis', 'Diegesis',
      'Focalization', 'Analepsis', 'Prolepsis', 'Ellipsis', 'Paralipsis', 'Polyphony', 'Heteroglossia',
      'Carnivalesque', 'Defamiliarisation', 'Ostranenie', 'Skaz', 'Unreliable narrator', 'Implied author',
      'Extradiegetic', 'Intradiegetic', 'Hypodiegetic', 'Fabula', 'Syuzhet', 'Exposition', 'Inciting incident',
      'Rising action', 'Climax', 'Falling action', 'Resolution', 'Denouement', 'Catharsis', 'Hamartia',
    ],
  },
  sports: {
    easy: [
      'Cricket', 'Football', 'Tennis', 'Badminton', 'Hockey', 'Basketball', 'Volleyball', 'Swimming', 'Running', 'Cycling',
      'Boxing', 'Wrestling', 'Kabaddi', 'Kho-kho', 'Carrom', 'Chess', 'Ludo', 'Carom', 'Snooker', 'Billiards',
      'Golf', 'Rugby', 'Baseball', 'Softball', 'Handball', 'Netball', 'Polo', 'Archery', 'Shooting', 'Fencing',
      'Judo', 'Karate', 'Taekwondo', 'Gymnastics', 'Athletics', 'Marathon', 'Triathlon', 'Pentathlon', 'Decathlon', 'Heptathlon',
      'Rowing', 'Sailing', 'Surfing', 'Skiing', 'Snowboard', 'Skating', 'Diving', 'Climbing', 'Hiking', 'Trekking',
    ],
    medium: [
      'Googly', 'Boundary', 'Hat-trick', 'Umpire', 'Penalty', 'Wicket', 'Referee', 'Free throw', 'Serve',
      'Deuce', 'Advantage', 'Love', 'Ace', 'Fault', 'Let', 'Rally', 'Smash', 'Drop shot', 'Lob',
      'Offside', 'Foul', 'Yellow card', 'Red card', 'Corner kick', 'Free kick', 'Penalty kick', 'Throw-in',
      'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger', 'Captain', 'Coach',
      'Innings', 'Over', 'Run rate', 'Duck', 'Century', 'Half-century', 'Maiden over', 'No-ball', 'Wide',
      'Bouncer', 'Yorker', 'Full toss', 'Reverse swing', 'Doosra', 'Carrom ball', 'Flipper', 'Chinaman',
    ],
    hard: [
      'Nascarcombe', 'Plyometrics', 'Proprioception', 'Periodisation', 'Supercompensation', 'VO2 max',
      'Lactate threshold', 'Anaerobic threshold', 'Oxygen debt', 'Phosphocreatine', 'Glycolysis',
      'Krebs cycle', 'Oxidative phosphorylation', 'Slow twitch', 'Fast twitch', 'Hypertrophy',
      'Sarcomere', 'Myofibril', 'Actin', 'Myosin', 'Tropomyosin', 'Troponin', 'Sarcolemma',
      'Sarcoplasm', 'Sarcoplasmic reticulum', 'Neuromuscular junction', 'Motor unit', 'Recruitment',
      'Rate coding', 'Fatigue', 'Glycogen depletion', 'Rhabdomyolysis', 'DOMS', 'Creatine kinase',
      'Lactate dehydrogenase', 'Cortisol', 'Testosterone', 'GH', 'IGF-1', 'EPO', 'Haematocrit',
      'VO2', 'RER', 'RQ', 'METs', 'EPOC', 'Cardiac output', 'Stroke volume', 'Heart rate variability',
      'Baroreceptor', 'Venous return',
    ],
  },
  animals: {
    easy: [
      'Dog', 'Cat', 'Cow', 'Horse', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Rabbit',
      'Bird', 'Fish', 'Snake', 'Frog', 'Butterfly', 'Bee', 'Ant', 'Spider', 'Fly', 'Mosquito',
      'Parrot', 'Crow', 'Sparrow', 'Eagle', 'Owl', 'Duck', 'Hen', 'Cock', 'Turkey', 'Peacock',
      'Deer', 'Fox', 'Wolf', 'Zebra', 'Giraffe', 'Hippo', 'Rhino', 'Camel', 'Kangaroo', 'Koala',
      'Penguin', 'Polar bear', 'Seal', 'Whale', 'Dolphin', 'Shark', 'Crocodile', 'Tortoise', 'Lizard', 'Chameleon',
    ],
    medium: [
      'Pangolin', 'Firefly', 'Chameleon', 'Albatross', 'Narwhal', 'Platypus', 'Axolotl', 'Tardigrade',
      'Sloth', 'Armadillo', 'Tapir', 'Capybara', 'Alpaca', 'Vicuna', 'Guanaco', 'Llama', 'Dromedary',
      'Bactrian', 'Yak', 'Buffalo', 'Gaur', 'Banteng', 'Kouprey', 'Anoa', 'Takin', 'Goral', 'Serow',
      'Chamois', 'Ibex', 'Markhor', 'Tahr', 'Nilgai', 'Chinkara', 'Blackbuck', 'Saiga', 'Pronghorn',
      'Okapi', 'Bongo', 'Sitatunga', 'Bushbuck', 'Kudu', 'Nyala', 'Eland', 'Gemsbok', 'Oryx',
      'Addax', 'Dik-dik', 'Klipspringer', 'Steenbok', 'Grysbok',
    ],
    hard: [
      'Proboscidea', 'Sirenia', 'Hyracoidea', 'Tenrecidae', 'Potamogalidae', 'Chrysochloridae',
      'Macroscelididae', 'Tubulidentata', 'Pholidota', 'Erinaceidae', 'Talpidae', 'Soricidae',
      'Crocidura', 'Suncus', 'Diplomesodon', 'Scutisorex', 'Nectogale', 'Chimarrogale', 'Neomys',
      'Episoriculus', 'Sorex', 'Microsorex', 'Cryptotis', 'Blarina', 'Blarinella', 'Notiosorex',
      'Megasorex', 'Limnosorex', 'Sylvisorex', 'Myosorex', 'Surdisorex', 'Ruwenzorisorex',
      'Congosorex', 'Suncidae', 'Potamogale', 'Micropotamogale', 'Geogale', 'Microgale',
      'Oryzorictes', 'Limnogale', 'Nesogale', 'Hemicentetes', 'Setifer', 'Tenrec', 'Echinops',
      'Dasogale', 'Cryptogale', 'Microgale', 'Nesophontes', 'Solenodon',
    ],
  },
  jobs: {
    easy: [
      'Doctor', 'Teacher', 'Engineer', 'Farmer', 'Driver', 'Cook', 'Nurse', 'Pilot', 'Police', 'Soldier',
      'Lawyer', 'Judge', 'Manager', 'Clerk', 'Cashier', 'Waiter', 'Barber', 'Tailor', 'Plumber', 'Electrician',
      'Carpenter', 'Painter', 'Mechanic', 'Welder', 'Mason', 'Gardener', 'Janitor', 'Guard', 'Postman', 'Cobbler',
      'Banker', 'Accountant', 'Economist', 'Journalist', 'Photographer', 'Designer', 'Architect', 'Programmer', 'Artist', 'Musician',
      'Actor', 'Singer', 'Dancer', 'Chef', 'Baker', 'Butcher', 'Fisherman', 'Hunter', 'Shepherd', 'Miner',
    ],
    medium: [
      'Archaeologist', 'Sommelier', 'Air traffic controller', 'Actuary', 'Taxidermist', 'Podiatrist',
      'Notary', 'Archivist', 'Cartographer', 'Cryptographer', 'Epidemiologist', 'Toxicologist',
      'Forensic scientist', 'Serologist', 'Odontologist', 'Anthropologist', 'Ethnographer',
      'Demographer', 'Geomorphologist', 'Hydrologist', 'Glaciologist', 'Volcanologist', 'Seismologist',
      'Meteorologist', 'Climatologist', 'Oceanographer', 'Limnologist', 'Pedologist', 'Edaphologist',
      'Phytologist', 'Bryologist', 'Pteridologist', 'Lichenologist', 'Mycologist', 'Algologist',
      'Protozoologist', 'Helminthologist', 'Entomologist', 'Arachnologist', 'Malacologist',
      'Carcinologist', 'Ichthyologist', 'Herpetologist', 'Ornithologist', 'Mammalogist',
      'Cetologist', 'Primatologist', 'Ethologist', 'Sociobiologist',
    ],
    hard: [
      'Phlebotomist', 'Cytopathologist', 'Histopathologist', 'Neuropathologist', 'Immunopathologist',
      'Haematopathologist', 'Dermatopathologist', 'Surgical pathologist', 'Forensic pathologist',
      'Veterinary pathologist', 'Plant pathologist', 'Avian pathologist', 'Aquatic pathologist',
      'Environmental pathologist', 'Molecular pathologist', 'Comparative pathologist', 'Teratologist',
      'Oncologist', 'Haematologist', 'Rheumatologist', 'Immunologist', 'Allergologist',
      'Endocrinologist', 'Diabetologist', 'Metabolologist', 'Lipidologist', 'Hepatologist',
      'Gastroenterologist', 'Proctologist', 'Colorectal surgeon', 'Hepatobiliary surgeon',
      'Pancreatologist', 'Nephrology', 'Urologist', 'Andrologist', 'Gynaecologist',
      'Perinatologist', 'Fetologist', 'Neonatologist', 'Paediatric cardiologist', 'Paediatric neurologist',
      'Child psychiatrist', 'Geriatrician', 'Gerontologist', 'Palliative care', 'Intensivist',
      'Hospitalist', 'Physiatrist', 'Occupational physician', 'Aviation medicine',
    ],
  },
  festival: {
    easy: [
      'Diwali', 'Holi', 'Eid', 'Christmas', 'Navratri', 'Durga Puja', 'Ganesh Chaturthi', 'Onam', 'Pongal', 'Baisakhi',
      'Lohri', 'Makar Sankranti', 'Ugadi', 'Bihu', 'Vishu', 'New Year', 'Easter', 'Dussehra', 'Janmashtami', 'Raksha Bandhan',
      'Firework', 'Cracker', 'Lamp', 'Candle', 'Gift', 'Sweet', 'Feast', 'Dance', 'Music', 'Decoration',
      'Flower', 'Garland', 'Rangoli', 'Mehendi', 'Diyas', 'Lantern', 'Balloon', 'Confetti', 'Ribbon', 'Cake',
      'Card', 'Present', 'Party', 'Invite', 'Costume', 'Mask', 'Parade', 'Procession', 'Puja', 'Prayer',
    ],
    medium: [
      'Rangoli', 'Mehendi', 'Iftar', 'Procession', 'Mithai', 'Crackers', 'Carol', 'Wassail',
      'Advent', 'Epiphany', 'Candlemas', 'Lent', 'Ash Wednesday', 'Palm Sunday', 'Good Friday',
      'Pentecost', 'Corpus Christi', 'All Saints', 'All Souls', 'Advent wreath', 'Nativity',
      'Yule log', 'Misletoe', 'Wassail bowl', 'Plum pudding', 'Mince pie', 'Panettone',
      'Stollen', 'Buche de Noel', 'Krampus', 'Sinterklaas', 'Zwarte Piet', 'Belsnickel',
      'Père Fouettard', 'Père Noël', 'Babbo Natale', 'Ded Moroz', 'Ježíšek', 'Christkind',
      'Weihnachtsmann', 'Santa Claus', 'Father Christmas', 'Julenisse', 'Joulupukki',
      'Väterchen Frost', 'Jultomten', 'Nisse', 'Tomte', 'Brownie',
    ],
    hard: [
      'Apophenia', 'Liminality', 'Communitas', 'Rites of passage', 'Threshold rites', 'Incorporation',
      'Separation', 'Aggregation', 'Betwixt and between', 'Social drama', 'Redressive action',
      'Schism', 'Reintegration', 'Breach', 'Crisis', 'Calendrical ritual', 'Life cycle ritual',
      'Rites of intensification', 'Rites of affliction', 'Rites of inversion', 'Anti-structure',
      'Ritual elders', 'Neophyte', 'Initiand', 'Liminar', 'Transitant', 'Liminars',
      'Ritual pollution', 'Ritual purity', 'Taboo', 'Totem', 'Mana', 'Tapu', 'Noa',
      'Hau', 'Potlatch', 'Kula', 'Moka', 'Tee', 'Wantok', 'Kastom', 'Bigman', 'Headman',
      'Shaman', 'Diviner', 'Medium', 'Possessed', 'Spirit possession', 'Trance', 'Ecstasy',
    ],
  },
};

export const HINTS: Record<CategoryKey, string[]> = {
  general: ['everyday item', 'common object', 'household thing', 'useful tool', 'found at home'],
  vehicles: ['way to travel', 'mode of transport', 'moves people', 'carries things', 'used for travel'],
  home: ['found in homes', 'used daily', 'household item', 'domestic object', 'in every house'],
  food: ['something edible', 'you can eat it', 'found in kitchens', 'tastes good', 'a food item'],
  bollywood: ['film related', 'part of movies', 'cinema element', 'entertainment', 'from Bollywood'],
  sports: ['sport related', 'used in games', 'athletic term', 'sports element', 'game concept'],
  animals: ['a creature', 'living being', 'found in nature', 'wild animal', 'animal kingdom'],
  jobs: ['a profession', 'someone who works', 'a career', 'job title', 'occupation'],
  festival: ['celebration related', 'festival element', 'cultural event', 'holiday tradition', 'part of festivals'],
};
