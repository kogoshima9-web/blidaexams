import { SchoolYear, Subject, Exam, Question, University } from './types';

const STORAGE_KEYS = {
  SCHOOL_YEARS: 'admin_school_years',
  SUBJECTS: 'admin_subjects',
  EXAMS: 'admin_exams',
  QUESTIONS: 'admin_questions',
  UNIVERSITIES: 'admin_universities',
};

const defaultUniversities: University[] = [
  { id: 'blida', name: 'Université de Blida', city: 'Blida', order: 1 },
  { id: 'oran', name: 'Université d\'Oran', city: 'Oran', order: 2 },
  { id: 'constantine', name: 'Université de Constantine', city: 'Constantine', order: 3 },
  { id: 'sidi_bel_abbes', name: 'Université de Sidi Bel Abbès', city: 'Sidi Bel Abbes', order: 4 },
];

const defaultSchoolYears: SchoolYear[] = [
  { id: '1', name: '1ère Année', shortLabel: '1ère', order: 1 },
  { id: '2', name: '2ème Année', shortLabel: '2ème', order: 2 },
  { id: '3', name: '3ème Année', shortLabel: '3ème', order: 3 },
  { id: '4', name: '4ème Année', shortLabel: '4ème', order: 4 },
  { id: '5', name: '5ème Année', shortLabel: '5ème', order: 5 },
  { id: '6', name: '6ème Année', shortLabel: '6ème', order: 6 },
  { id: '7', name: '7ème Année', shortLabel: '7ème', order: 7 },
];

const defaultSubjects: Subject[] = [
  { id: '1', name: 'Anatomie', schoolYearId: '1', description: 'Étude du corps humain' },
  { id: '2', name: 'Physiologie', schoolYearId: '1', description: 'Fonctions vitales' },
  { id: '3', name: 'Biochimie', schoolYearId: '1', description: 'Chimie du vivant' },
  { id: '4', name: 'Histologie', schoolYearId: '2', description: 'Étude des tissus' },
  { id: '5', name: 'Embryologie', schoolYearId: '2', description: 'Développement embryonnaire' },
  { id: '6', name: 'Microbiologie', schoolYearId: '3', description: 'Agents pathogènes' },
  { id: '7', name: 'Pathologie', schoolYearId: '3', description: 'Maladies et mécanismes' },
  { id: '8', name: 'Pharmacologie', schoolYearId: '4', description: 'Médicaments et effets' },
  { id: '9', name: 'Sémiologie', schoolYearId: '4', description: 'Signes cliniques' },
  { id: '10', name: 'Cardiologie', schoolYearId: '5', description: 'Maladies cardiovasculaires' },
  { id: '11', name: 'Pharmacologie', schoolYearId: '3', description: 'Médicaments et effets - QCM Constantine 2020' },
];

const pharmacoQuestions: Question[] = [
  { id: 'p1', examId: 'pharmaco1', order: 1, text: 'Quelle est la réponse fausse :', options: ['La yohimbine est un antagoniste alpha 2', 'La prazosine (Minipress®) est un antagoniste alpha 1', 'Le labétalol (Trandate®) est un antagoniste alpha 1', 'La néosynéphrine est un agoniste alpha 2', "L'adrénaline est un agoniste alpha 1 et alpha 2"], correctAnswer: 3, correctAnswers: [3] },
  { id: 'p2', examId: 'pharmaco1', order: 2, text: 'Les effets suivants sont dose-dépendants :', options: ['Effets latéraux de type pharmacologique (exemple : réaction atropinique d\'antidépresseurs imipraminiques)', 'Effets toxiques (nécrose hépatique par paracétamol)', 'Réaction immunoallergique (agranulocytose à la noramidopyrine)', 'Réaction idiosyncrasiques (anémie hémolytique en cas de déficit en G6PD)', 'Réaction d\'hypersensibilité (réponse exagérée de sujets âgés aux atropiniques)'], correctAnswer: 1, correctAnswers: [0, 1] },
  { id: 'p3', examId: 'pharmaco1', order: 3, text: 'Le temps de ½-vie d\'élimination de digoxine chez l\'insuffisant cardiaque :', options: ['1 heure', '6 heures', '36 heures', '5 heures', '10 heures'], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p4', examId: 'pharmaco1', order: 4, text: 'Une molécule médicamenteuse traverse les membranes biologiques par diffusion passive sans possibilité de passage au travers des pores membranaires. La diffusibilité de cette molécule est conditionnée par :', options: ['Sa liposolubilité', 'Son degré d\'ionisation', 'Sa liaison aux protéines', 'La nécessité de la présence d\'un transporteur', "La nécessité d'un apport d'énergie"], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { id: 'p5', examId: 'pharmaco1', order: 5, text: 'La théophylline', options: ['Est une base xanthique', 'Inhibe la libération des catécholamines', 'Possède des propriétés diurétiques', "A une action spasmolytique sur le muscle lisse"], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { id: 'p6', examId: 'pharmaco1', order: 6, text: 'Les glucosides cardiotoniques :', options: ['Leur action est inotrope positive à doses thérapeutiques', "Ils inhibent l'ATPase membranaire du myocarde", 'La digoxine a une meilleure biodisponibilité que la digitoxine', "L'élimination de la digoxine se fait par dégradation hépatique", 'La ½-vie d\'élimination de la digoxine est d\'environ 5 à 3 jours'], correctAnswer: 4, correctAnswers: [0, 1, 4] },
  { id: 'p7', examId: 'pharmaco1', order: 7, text: 'La biotransformation des médicaments peut être influencée par :', options: ['Age', 'Sexe', 'Dose administrée', "Association d'autres médicaments"], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { id: 'p8', examId: 'pharmaco1', order: 8, text: 'La résorption d\'une molécule médicamenteuse à travers la muqueuse digestive peut être influencée par :', options: ['Le pH', 'La forme pharmaceutique utilisée', 'La liposolubilité de la molécule', 'La présence simultanée d\'autres médicaments'], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { id: 'p9', examId: 'pharmaco1', order: 9, text: "On administre à un malade en 2 prises quotidiennes un médicament dont la ½ vie est de 12 heures. Au bout de combien de temps la concentration plasmatique de ce médicament aura-t-elle atteint un plateau :", options: ['Un jour', 'Deux jours', 'Six jours'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p10', examId: 'pharmaco1', order: 10, text: "Quel est l'antispasmodique qui possède des propriétés atropiniques :", options: ['Mébévérine (Duspatalin®)', 'Trimébutine (Débridat®)', 'Tiémonium (Viscéralgine®)'], correctAnswer: 1, correctAnswers: [1, 2] },
  { id: 'p11', examId: 'pharmaco1', order: 11, text: 'Effet dopaminergique périphérique :', options: ['Augmentation de la fréquence cardiaque', 'Bronchodilatation', 'Vasodilatation rénale'], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p12', examId: 'pharmaco1', order: 12, text: 'La prazosine (Minipress®) :', options: ['Bloque les récepteurs α1 postsynaptique', 'Bloque les récepteurs α2 postsynaptique', "Bloque les récepteurs β et α postsynaptiques"], correctAnswer: 2, correctAnswers: [0, 2] },
  { id: 'p13', examId: 'pharmaco1', order: 13, text: 'Le volume de distribution du médicament dans l\'organisme :', options: ['Est un volume fictif', 'Peut dépasser le volume total de l\'organisme', "Varie en fonction du degré de fixation protéique du médicament", "Est corrélé à la concentration plasmatique de ce médicament", 'Augmente avec l\'âge'], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { id: 'p14', examId: 'pharmaco1', order: 14, text: "L'atropine exerce les effets suivants :", options: ['Tachycardie', 'Bronchoconstriction', 'Augmentation des sécrétions salivaires, gastriques et intestinales', 'Mydriase', 'Diminution des péristaltismes intestinal et vésical'], correctAnswer: 3, correctAnswers: [0, 3, 4] },
  { id: 'p15', examId: 'pharmaco1', order: 15, text: 'La modification de la fixation protéique des médicaments est influencée par :', options: ['Syndrome néphrotique', 'Syndrome inflammatoire', 'Prématurité', 'Insuffisance thyroïdienne'], correctAnswer: 3, correctAnswers: [0, 1, 2] },
  { id: 'p16', examId: 'pharmaco1', order: 16, text: 'Effets alpha-adrénergiques :', options: ['Augmentation de la pression artérielle diastolique', 'Mydriase passive', 'Vasoconstriction des artères rénales', 'Augmentation de la sécrétion de rénine'], correctAnswer: 3, correctAnswers: [1, 2] },
  { id: 'p17', examId: 'pharmaco1', order: 17, text: "Quel effet indésirable n'est pas classique avec la clonidine :", options: ['Anémie hémolytique', 'Bradycardie sinusale', 'Somnolence', 'Hypotension orthostatique', 'Rebond hypertensif à l\'arrêt du médicament'], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p18', examId: 'pharmaco1', order: 18, text: "L'activité anticholinergique, source d'effets indésirables, peut se rencontrer dans les classes médicamenteuses suivantes sauf, une :", options: ['Morphinique', 'Antidépresseurs tricycliques', 'Neuroleptiques', 'Antihistaminiques', 'Antispasmodiques du tube digestif'], correctAnswer: 0, correctAnswers: [1, 2, 3, 4] },
  { id: 'p19', examId: 'pharmaco1', order: 19, text: "L'acétylcholine :", options: ['Produit un myosis actif', "Agit sur les récepteurs muscariniques", 'Agit sur les récepteurs alpha 2 adrénergiques', "Est contre-indiquée en cas d'hypertrophie prostatique"], correctAnswer: 1, correctAnswers: [0, 1] },
  { id: 'p20', examId: 'pharmaco1', order: 20, text: "La fixation d'un médicament aux protéines plasmatiques dépend :", options: ['Du nombre de sites de fixation', "De l'affinité", 'De la concentration plasmatique du médicament', 'De la concentration plasmatique de la protéine porteuse'], correctAnswer: 3, correctAnswers: [0, 1, 3] },
  { id: 'p21', examId: 'pharmaco1', order: 21, text: "L'isoprénaline :", options: ['Est un sympathomimétique agoniste bêta', "Exerce des actions cardiaques inotropes et chronotropes positives", "Est vasodilatatrice sur les artères rénales et mésentériques", 'Ne modifie pas le débit cardiaque'], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { id: 'p22', examId: 'pharmaco1', order: 22, text: 'Le métoclopramide :', options: ['Est un antiémétique', "Augmente la pression du sphincter inférieur de l'œsophage", 'Diminue les contractions antrales', 'Appartient au groupe des benzamides neuroleptiques', 'Peut être responsable de dyskinésie'], correctAnswer: 3, correctAnswers: [0, 3, 4] },
  { id: 'p23', examId: 'pharmaco1', order: 23, text: 'Les effets indésirables des corticoïdes administrés au long cours comporte :', options: ['Une fuite rénale de sodium', 'Une rétention de potassium', 'Une amyotrophie', 'Une hyperglycémie', 'Une hypercalcémie'], correctAnswer: 3, correctAnswers: [2, 3] },
  { id: 'p24', examId: 'pharmaco1', order: 24, text: 'Tous les médicaments suivants sont inducteurs enzymatiques, sauf deux lesquels :', options: ['Phénytoïne', 'Carbamazépine', 'Aspirine', 'Érythromycine', 'Rifampicine'], correctAnswer: 2, correctAnswers: [0, 1, 3, 4] },
  { id: 'p25', examId: 'pharmaco1', order: 25, text: "L'administration de dopamine chez un malade en état de choc peut provoquer :", options: ['Une vasodilatation des artères rénales par l\'intermédiaire des récepteurs dopaminergiques', "Une vasoconstriction périphérique par l'intermédiaire des récepteurs adrénergiques", 'Une augmentation du débit cardiaque'], correctAnswer: 2, correctAnswers: [0, 2] },
  { id: 'p26', examId: 'pharmaco1', order: 26, text: "Les médicaments qui peuvent entraîner une gynécomastie :", options: ['Corticoïdes', 'Spironolactone', 'Alpha-méthyldopa', 'Furosémide', 'Cimétidine'], correctAnswer: 3, correctAnswers: [1, 3, 4] },
  { id: 'p27', examId: 'pharmaco1', order: 27, text: 'Le traitement par corticoïdes provoque le ou les effets suivants :', options: ['Une fuite rénale de sodium', 'Une rétention de potassium', 'Une amyotrophie', 'Une hyperglycémie', 'Une hypercalcémie'], correctAnswer: 3, correctAnswers: [2, 3] },
  { id: 'p28', examId: 'pharmaco1', order: 28, text: 'Les antagonistes des AVK sont les suivants :', options: ['Protamine', 'Vitamine K', 'Antifibrinolytiques', 'PPSB'], correctAnswer: 2, correctAnswers: [1] },
  { id: 'p29', examId: 'pharmaco1', order: 29, text: 'Signes observés lors du syndrome de sevrage aux opiacés :', options: ['Rhinorrhée', 'Horripilation cutanée', 'Mydriase', 'Douleurs musculaires'], correctAnswer: 2, correctAnswers: [0, 1, 2, 3] },
  { id: 'p30', examId: 'pharmaco1', order: 30, text: "Les corticoïdes peuvent avoir comme effets :", options: ['Hypercalcémie', 'Rétention hydrosodée', 'Augmentation du catabolisme protidique', 'Diminution des éosinophiles circulants'], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { id: 'p31', examId: 'pharmaco1', order: 31, text: 'Les antidépresseurs tricycliques peuvent induire les effets indésirables suivants :', options: ['Sécheresse de la bouche', 'Abaissement du seuil épileptogène', 'Toxicité myocardique', 'Pigmentation cutanée'], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { id: 'p32', examId: 'pharmaco1', order: 32, text: "Le passage transmembranaire d'une substance par diffusion passive :", options: ["S'effectue selon le gradient de concentration", "Est indépendant du pH", "Dépend de l'épaisseur de la membrane", "Est indépendant du pKa de la substance"], correctAnswer: 2, correctAnswers: [0, 2] },
  { id: 'p33', examId: 'pharmaco1', order: 33, text: "On peut attribuer aux benzodiazépines un effet :", options: ['Anticonvulsivant', 'Amnésiant', 'Hypnotique', 'Myorelaxant', 'De rétention urinaire'], correctAnswer: 4, correctAnswers: [0, 1, 2, 3] },
  { id: 'p34', examId: 'pharmaco1', order: 34, text: 'Effets indésirables suivants, lesquels :', options: ['Agranulocytose', 'Alopécie', 'Nécrose cutanée', 'Thrombopénie'], correctAnswer: 2, correctAnswers: [0, 2, 3] },
  { id: 'p35', examId: 'pharmaco1', order: 35, text: "Quelle est la propriété que n'ont pas en commun les neuroleptiques et les antidépresseurs tricycliques :", options: ['Alpha bloquant', 'Anticholinergique', 'Antisérotonine', 'Antihistamine H1', "Inhibition du recaptage de la noradrénaline"], correctAnswer: 4, correctAnswers: [4] },
  { id: 'p36', examId: 'pharmaco1', order: 36, text: "Quel est l'antihypertenseur susceptible de provoquer une hypertrichose :", options: ['La dihydralazine', 'Le propranolol', 'Le minoxidil', 'Le furosémide'], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p37', examId: 'pharmaco1', order: 37, text: "Le principal effet secondaire des agents bloquants les récepteurs α-1 post-synaptiques :", options: ['Céphalée', 'Hypotension orthostatique', 'Rétention urinaire', 'Douleurs angineuses'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p38', examId: 'pharmaco1', order: 38, text: 'Tous les médicaments suivants sont capables de potentialiser l\'action des AVK à l\'exception d\'un seul, lequel :', options: ['Aspirine', 'Indométacine', 'Phénobarbital', 'Phénylbutazone', 'Clofibrate'], correctAnswer: 2, correctAnswers: [0, 1, 3, 4] },
  { id: 'p39', examId: 'pharmaco1', order: 39, text: "L'action stimulante intrinsèque d'un bêta-bloquant :", options: ["Se manifeste plus au repos qu'à l'effort", "Se manifeste plus lors d'une émotion que pendant le sommeil", "Peut s'expliquer par un effet dit agoniste partiel sur les récepteurs β-adrénergiques", "Peut s'expliquer par un effet partiel sur récepteur α-adrénergique", "Favorise le passage de la barrière hémato-encéphalique"], correctAnswer: 4, correctAnswers: [0, 2] },
  { id: 'p40', examId: 'pharmaco1', order: 40, text: "La néphrotoxicité et l'ototoxicité de la gentamicine sont potentialisées par :", options: ['Ampicilline', 'Furosémide', 'Cimétidine'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p41', examId: 'pharmaco1', order: 41, text: 'Une corticothérapie prolongée peut être responsable :', options: ["D'une hypercholestérolémie", "D'une hypokaliémie", "D'une ostéonécrose aseptique de la tête fémorale", "D'une hyponatrémie", "D'un retard de croissance"], correctAnswer: 1, correctAnswers: [0, 1, 2, 4] },
  { id: 'p42', examId: 'pharmaco1', order: 42, text: "Les effets d'une stimulation des récepteurs dopaminergiques :", options: ['Diminution de la fréquence cardiaque', 'Vasoconstriction cutanée', 'Bronchoconstriction', 'Vasodilatation rénale'], correctAnswer: 3, correctAnswers: [3] },
  { id: 'p43', examId: 'pharmaco1', order: 43, text: "La biodisponibilité d'un médicament désigne :", options: ["La fraction non liée aux protéines plasmatiques", "La fraction de la dose résorbée à l'état actif", "La vitesse de résorption", "La concentration plasmatique maximum"], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p44', examId: 'pharmaco1', order: 44, text: "Un médicament β-mimétique possède parmi les propriétés pharmacologiques suivantes :", options: ['Action vasoconstrictrice', 'Action inotrope positive', 'Action ocytocique', 'Action chronotrope positive'], correctAnswer: 3, correctAnswers: [1, 3] },
  { id: 'p45', examId: 'pharmaco1', order: 45, text: 'La demi-vie d\'un médicament :', options: ["Est la moitié du temps que met une dose unique de médicament pour disparaître en totalité de l'organisme", "Est paramètre pharmacocinétique caractéristique d'un médicament donné, pour un sujet donné", "Est le temps au bout duquel la moitié, d'une dose unique de médicament est éliminée", "Peut être mesurée graphiquement sur la courbe de décroissance de la concentration sanguine d'un médicament", "Est le temps nécessaire pour que la concentration plasmatique initiale diminue de moitié"], correctAnswer: 4, correctAnswers: [1, 4] },
  { id: 'p46', examId: 'pharmaco1', order: 46, text: 'La fixation protéique des médicaments de type acide faible dans le plasma :', options: ['Se fait surtout sur l\'albumine', 'Est réversible', "Est plus forte chez l'homme que chez la femme", 'Est généralement saturable', "Diminue en cas de prise concomitante d'un médicament base faible"], correctAnswer: 4, correctAnswers: [0, 1] },
  { id: 'p47', examId: 'pharmaco1', order: 47, text: 'Une substance susceptible de bloquer les récepteurs dopaminergiques :', options: ['Dompéridone', 'Propranolol', 'Yohimbine'], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p48', examId: 'pharmaco1', order: 48, text: 'Le furosémide est responsable de tous les effets suivants sauf un, lequel :', options: ['Hypokaliémie', 'Hyperglycémie', "Élévation de l'uricémie", 'Hypoprotidémie', 'Hyponatrémie'], correctAnswer: 3, correctAnswers: [0, 1, 2, 4] },
  { id: 'p49', examId: 'pharmaco1', order: 49, text: "L'administration de doxycycline chez un patient de 60 ans qui a une insuffisance rénale sévère :", options: ["On ne modifie ni la dose, ni l'intervalle d'administration", "On diminue de moitié la dose sans modifier l'intervalle", "On ne modifie pas la dose mais on augmente l'intervalle", "On diminue la dose de moitié et on triple l'intervalle"], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p50', examId: 'pharmaco1', order: 50, text: "Les médicaments suivants contenant la structure hydrazine : isoniazide, dihydralazine, sont en majeure partie excrétée :", options: ['Après hydroxylation hépatique', 'Après acétylation hépatique', "Après glycuro-conjugaison hépatique", 'Directement par filtration glomérulaire rénale', 'Directement par sécrétion tubulaire rénale'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p51', examId: 'pharmaco1', order: 51, text: "La filtration glomérulaire d'un médicament est favorisée directement par :", options: ['Une forte lipophilie', "Une forte ionisation au pH du plasma", "Une forte fixation aux protéines plasmatiques"], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p52', examId: 'pharmaco1', order: 52, text: 'Les transformations métaboliques des médicaments :', options: ["Conduisent, dans la plupart des cas, à des dérivés plus liposolubles", "Peuvent conduire à des dérivés actifs", "S'effectuent toujours dans le foie", "Peuvent être l'objet de variations inter individuelles"], correctAnswer: 3, correctAnswers: [0, 1, 3] },
  { id: 'p53', examId: 'pharmaco1', order: 53, text: "On peut éviter ou réduire l'importance de l'effet de premier passage pour un médicament :", options: ["En le prescrivant en suppositoire", "En le prescrivant par voie intramusculaire sous une forme retard", "En le prescrivant sous une forme pour application cutanée", "En évitant de réitérer le traitement à intervalles de temps trop rapprochés"], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p54', examId: 'pharmaco1', order: 54, text: "Le bêtabloquant qui a l'activité sympathomimétique intrinsèque marquée :", options: ['Propranolol', 'Pindolol', 'Aténolol', 'Métoprolol', 'Nadolol'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p55', examId: 'pharmaco1', order: 55, text: "Médicament qui peut conduire à la production de métabolite toxique qui peut être responsables d'une hépatite :", options: ['Phénobarbital', 'Isoniazide', 'Digitoxine', 'Gentamycine'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p56', examId: 'pharmaco1', order: 56, text: "La clairance totale d'un médicament peut être estimée en connaissant :", options: ["La ½-vie plasmatique d'élimination de ce médicament", 'Le flux plasmatique rénal', "La clairance rénale de ce médicament"], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p57', examId: 'pharmaco1', order: 57, text: "La pratique de la dose de charge donnée au début d'un traitement prolongé est réalisée pour :", options: ["Les médicaments dont la ½-vie plasmatique est moins de 6 heures", "Les médicaments dont la ½-vie est de plusieurs jours", "Raccourcir le délai d'installation de la concentration plasmatique stationnaire du médicament", "Saturer les mécanismes d'élimination du médicament", "Raccourcir la durée totale du traitement"], correctAnswer: 4, correctAnswers: [2] },
  { id: 'p58', examId: 'pharmaco1', order: 58, text: "Parmi les médicaments suivants, lequel stimule directement les récepteurs :", options: ['Trihexyphénidyle (Artane®)', 'Halopéridol (Haldol®)', 'Bromocriptine (Parlodel®)', 'L-dopa + bensérazide (Modopar®)', 'Dompéridone (Motilium®)'], correctAnswer: 2, correctAnswers: [2, 3] },
  { id: 'p59', examId: 'pharmaco1', order: 59, text: "La plupart des AINS peuvent majorer dangereusement l'effet des anticoagulants oraux et des hypoglycémiants sulfamidés. Cela s'explique par :", options: ['Une induction enzymatique', 'Une inhibition enzymatique', 'La défixation protéique par compétition'], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p60', examId: 'pharmaco1', order: 60, text: "Le mécanisme le plus vraisemblable de l'action thérapeutique des neuroleptiques est essentiellement :", options: ["Un blocage des récepteurs α-adrénergiques", "Un blocage des récepteurs β-adrénergiques", "Un blocage des récepteurs dopaminergiques", "Une inhibition du recaptage présynaptique des catécholamines", "Un blocage des récepteurs sérotoninergiques"], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p61', examId: 'pharmaco1', order: 61, text: "La stimulation des récepteurs β-adrénergiques provoque :", options: ['Une vasodilatation', "Un relâchement de l'utérus gravide", "Une augmentation de la sécrétion d'insuline"], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p62', examId: 'pharmaco1', order: 62, text: "Les corticostéroïdes par voie orale :", options: ["N'ont pas d'action curative sur les maladies rhumatismales", "N'exercent pas d'interactions pharmacocinétiques connues par défixation protéique", "N'exercent pas d'interactions pharmacocinétiques connues par induction enzymatique"], correctAnswer: 2, correctAnswers: [0] },
  { id: 'p63', examId: 'pharmaco1', order: 63, text: "Les amphétamines sont des sympathomimétiques dont l'action prédominante s'exerce au niveau central. Quels sont les effets sur le SNV que l'on peut noter :", options: ['Myosis', 'Tachycardie', 'HTA', "Diminution de l'excitabilité myocardique", "Hyperpéristaltisme intestinal"], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p64', examId: 'pharmaco1', order: 64, text: "Quel antibiotique qui a la meilleure diffusion dans les espaces arachnoïdiens :", options: ['Pénicilline G', 'Céphalosporine G1', 'Colimycine', 'Chloramphénicol'], correctAnswer: 3, correctAnswers: [3] },
  { id: 'p65', examId: 'pharmaco1', order: 65, text: "L'alpha-méthyldopa est susceptible d'induire :", options: ["Une anémie hémolytique auto-immune", "Une anémie hémolytique immunoallergique médicamenteuse"], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p66', examId: 'pharmaco1', order: 66, text: 'Médicaments qui peuvent être responsable de l\'apparition d\'un lupus érythémateux disséminé :', options: ['Aspirine', 'Bêtabloquants', 'Procaïnamide', 'Quinidine'], correctAnswer: 2, correctAnswers: [2, 3] },
  { id: 'p67', examId: 'pharmaco1', order: 67, text: "La biodisponibilité d'un médicament administré par voie IV vraie est de :", options: ['Imprévisible', '50 %', '100 %'], correctAnswer: 2, correctAnswers: [2] },
  { id: 'p68', examId: 'pharmaco1', order: 68, text: "Le volume de distribution du médicament dans l'organisme :", options: ['Est un volume théorique', 'Peut dépasser le volume total de l\'organisme', "Varie en fonction du degré de fixation protéique du médicament", "A une incidence sur la concentration plasmatique du médicament"], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { id: 'p69', examId: 'pharmaco1', order: 69, text: "Parmi les effets suivants des neuroleptiques phénothiaziniques (chlorpromazine), quels sont ceux qui s'expliquent par leur action antidopaminergique :", options: ['Hyperprolactinémie', 'Eruption', 'Syndrome extrapyramidal', 'Constipation', 'Indifférence psychique'], correctAnswer: 3, correctAnswers: [0, 2] },
  { id: 'p70', examId: 'pharmaco1', order: 70, text: "L'état d'équilibre des concentrations plasmatiques de la digoxine :", options: ['En 7 à 9 jours (5 x ½ vies)'], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p71', examId: 'pharmaco1', order: 71, text: "La morphine :", options: ['Provoque un myosis', 'Déprime les centres respiratoires', 'Peut être administrée par voie orale', 'Est toxicomanogène'], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { id: 'p72', examId: 'pharmaco1', order: 72, text: "La toxicité de la digoxine peut être accrue en cas de :", options: ['Traitement associé par le fénofibrate', 'Hypokaliémie', "Traitement associé à la rifampicine", 'Hypercalcémie', 'Hypoxie'], correctAnswer: 4, correctAnswers: [1, 3, 4] },
  { id: 'p73', examId: 'pharmaco1', order: 73, text: "Les substances suivantes peuvent induire une hyperprolactinémie, sauf une laquelle :", options: ['Benzamide (Ex : Primpéran®)', 'Phénothiazines (ex : Largactil®)', 'Analgésique morphinique', 'Cimétidine'], correctAnswer: 2, correctAnswers: [0, 1, 3] },
  { id: 'p74', examId: 'pharmaco1', order: 74, text: 'Médicaments qui augmentent le tonus du sphincter inférieur de l\'œsophage :', options: ['La dompéridone', 'La nifédipine', 'Le métoclopramide', "L'atropine"], correctAnswer: 2, correctAnswers: [0, 2] },
  { id: 'p75', examId: 'pharmaco1', order: 75, text: "La biodisponibilité d'un médicament :", options: ['Est strictement dose dépendante', 'Dépend de la voie d\'administration', "Est diminuée par l'effet de premier passage"], correctAnswer: 2, correctAnswers: [1, 2] },
  { id: 'p76', examId: 'pharmaco1', order: 76, text: 'Les médicaments qui peuvent être cause de constipation sont :', options: ['Le phosphate d\'aluminium', 'Les opiacés', "L'ampicilline", 'Les antidépresseurs tricycliques'], correctAnswer: 3, correctAnswers: [1, 3] },
  { id: 'p77', examId: 'pharmaco1', order: 77, text: 'Médicaments qui ↓ le tonus du SIO :', options: ['La dompéridone', 'La nifédipine', 'Les dérivés nitrés retard', 'Le métoclopramide', "L'atropine"], correctAnswer: 4, correctAnswers: [1, 2, 3, 4] },
  { id: 'p78', examId: 'pharmaco1', order: 78, text: 'Tous les médicaments suivants sont utilisés dans le traitement de fond de la migraine sauf un :', options: ['Carbamazépine', 'Méthysergide', 'Propranolol', 'Pizotifène (Sanmigran)', 'Dihydroergotamine'], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p79', examId: 'pharmaco1', order: 79, text: 'Quels sont les médicaments pour lesquels un surdosage peut être observé dans l\'association à un AINS :', options: ['Anticoagulant', 'Lithium'], correctAnswer: 1, correctAnswers: [1] },
  { id: 'p80', examId: 'pharmaco1', order: 80, text: 'Effets secondaires de la Dépakine :', options: ['Thrombopénie', 'Hépatite médicamenteuse'], correctAnswer: 1, correctAnswers: [0, 1] },
  { id: 'p81', examId: 'pharmaco1', order: 81, text: "Médicaments qui stimulent directement les récepteurs dopaminergiques :", options: ['Bromocriptine'], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p82', examId: 'pharmaco1', order: 82, text: "Effets secondaires d'un AINS en IM :", options: ['Polynévrite', 'Syndrome de Lyell', 'Abcès local', 'Ulcère gastrique'], correctAnswer: 3, correctAnswers: [2, 3] },
  { id: 'p83', examId: 'pharmaco1', order: 83, text: "Cocaïne : sympathomimétique indirect ; effet anesthésique local :", options: ['Vrai'], correctAnswer: 0, correctAnswers: [0] },
  { id: 'p84', examId: 'pharmaco1', order: 84, text: "Quel est le diurétique qui n'est pas contre-indiqué au cours de l'insuffisance rénale sévère :", options: ['Le clopamide', 'Le furosémide'], correctAnswer: 1, correctAnswers: [1] },
];

const defaultExams: Exam[] = [
  {
    id: 'pharmaco1',
    university: 'Université de Constantine',
    year: 2020,
    schoolYearId: '3',
    subjectId: '11',
    isPublished: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    questions: pharmacoQuestions,
  },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const schoolYearsStore = {
  getAll: (): SchoolYear[] => getFromStorage(STORAGE_KEYS.SCHOOL_YEARS, defaultSchoolYears),
  
  create: (schoolYear: Omit<SchoolYear, 'id'>): SchoolYear => {
    const items = schoolYearsStore.getAll();
    const newItem = { ...schoolYear, id: crypto.randomUUID() };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.SCHOOL_YEARS, items);
    return newItem;
  },
  
  update: (id: string, data: Partial<SchoolYear>): SchoolYear | null => {
    const items = schoolYearsStore.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    setToStorage(STORAGE_KEYS.SCHOOL_YEARS, items);
    return items[index];
  },
  
  delete: (id: string): boolean => {
    const items = schoolYearsStore.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.SCHOOL_YEARS, filtered);
    return true;
  },
};

export const universitiesStore = {
  getAll: (): University[] => getFromStorage(STORAGE_KEYS.UNIVERSITIES, defaultUniversities),
  
  create: (university: Omit<University, 'id'>): University => {
    const items = universitiesStore.getAll();
    const newItem = { ...university, id: university.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.UNIVERSITIES, items);
    return newItem;
  },
  
  update: (id: string, data: Partial<University>): University | null => {
    const items = universitiesStore.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    setToStorage(STORAGE_KEYS.UNIVERSITIES, items);
    return items[index];
  },
  
  delete: (id: string): boolean => {
    const items = universitiesStore.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.UNIVERSITIES, filtered);
    return true;
  },
};

export const subjectsStore = {
  getAll: (): Subject[] => getFromStorage(STORAGE_KEYS.SUBJECTS, defaultSubjects),
  
  getBySchoolYear: (schoolYearId: string): Subject[] => {
    return subjectsStore.getAll().filter(s => s.schoolYearId === schoolYearId);
  },
  
  create: (subject: Omit<Subject, 'id'>): Subject => {
    const items = subjectsStore.getAll();
    const newItem = { ...subject, id: crypto.randomUUID() };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.SUBJECTS, items);
    return newItem;
  },
  
  update: (id: string, data: Partial<Subject>): Subject | null => {
    const items = subjectsStore.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    setToStorage(STORAGE_KEYS.SUBJECTS, items);
    return items[index];
  },
  
  delete: (id: string): boolean => {
    const items = subjectsStore.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.SUBJECTS, filtered);
    return true;
  },
};

export const examsStore = {
  getAll: (): Exam[] => getFromStorage(STORAGE_KEYS.EXAMS, defaultExams),
  
  getById: (id: string): Exam | null => {
    return examsStore.getAll().find(e => e.id === id) || null;
  },
  
  create: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam => {
    const items = examsStore.getAll();
    const now = new Date().toISOString();
    const newItem: Exam = {
      ...exam,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.EXAMS, items);
    return newItem;
  },
  
  update: (id: string, data: Partial<Exam>): Exam | null => {
    const items = examsStore.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.EXAMS, items);
    return items[index];
  },
  
  delete: (id: string): boolean => {
    const items = examsStore.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.EXAMS, filtered);
    return true;
  },
  
  togglePublish: (id: string): Exam | null => {
    const exam = examsStore.getById(id);
    if (!exam) return null;
    return examsStore.update(id, { isPublished: !exam.isPublished });
  },
};

export const questionsStore = {
  getByExamId: (examId: string): Question[] => {
    const exam = examsStore.getById(examId);
    return exam?.questions || [];
  },
  
  create: (examId: string, question: Omit<Question, 'id' | 'examId'>): Question | null => {
    const exam = examsStore.getById(examId);
    if (!exam) return null;
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
      examId,
    };
    exam.questions.push(newQuestion);
    examsStore.update(examId, { questions: exam.questions });
    return newQuestion;
  },
  
  update: (examId: string, questionId: string, data: Partial<Question>): Question | null => {
    const exam = examsStore.getById(examId);
    if (!exam) return null;
    const index = exam.questions.findIndex(q => q.id === questionId);
    if (index === -1) return null;
    exam.questions[index] = { ...exam.questions[index], ...data };
    examsStore.update(examId, { questions: exam.questions });
    return exam.questions[index];
  },
  
  delete: (examId: string, questionId: string): boolean => {
    const exam = examsStore.getById(examId);
    if (!exam) return false;
    const filtered = exam.questions.filter(q => q.id !== questionId);
    if (filtered.length === exam.questions.length) return false;
    examsStore.update(examId, { questions: filtered });
    return true;
  },
  
  reorder: (examId: string, questions: Question[]): void => {
    const exam = examsStore.getById(examId);
    if (!exam) return;
    examsStore.update(examId, { questions });
  },
};

export function getStats() {
  const exams = examsStore.getAll();
  const questions = exams.flatMap(e => e.questions);
  return {
    totalExams: exams.length,
    totalQuestions: questions.length,
    publishedExams: exams.filter(e => e.isPublished).length,
    draftExams: exams.filter(e => !e.isPublished).length,
  };
}
