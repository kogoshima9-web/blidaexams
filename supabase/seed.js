/**
 * Seed Script - Populates Supabase with initial data
 * Run with: node --experimental-specifier-resolution=node supabase/seed.js
 * Or use Supabase Dashboard SQL Editor to run the SQL migration
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Add: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Existing localStorage data ──────────────────────────────────────

const pharmacoQuestions = [
  { text: 'Quelle est la réponse fausse :', options: ['La yohimbine est un antagoniste alpha 2', 'La prazosine (Minipress®) est un antagoniste alpha 1', 'Le labétalol (Trandate®) est un antagoniste alpha 1', 'La néosynéphrine est un agoniste alpha 2', "L'adrénaline est un agoniste alpha 1 et alpha 2"], correctAnswer: 3, correctAnswers: [3] },
  { text: 'Les effets suivants sont dose-dépendants :', options: ['Effets latéraux de type pharmacologique (exemple : réaction atropinique d\'antidépresseurs imipraminiques)', 'Effets toxiques (nécrose hépatique par paracétamol)', 'Réaction immunoallergique (agranulocytose à la noramidopyrine)', 'Réaction idiosyncrasiques (anémie hémolytique en cas de déficit en G6PD)', 'Réaction d\'hypersensibilité (réponse exagérée de sujets âgés aux atropiniques)'], correctAnswer: 1, correctAnswers: [0, 1] },
  { text: 'Le temps de ½-vie d\'élimination de digoxine chez l\'insuffisant cardiaque :', options: ['1 heure', '6 heures', '36 heures', '5 heures', '10 heures'], correctAnswer: 2, correctAnswers: [2] },
  { text: 'Une molécule médicamenteuse traverse les membranes biologiques par diffusion passive sans possibilité de passage au travers des pores membranaires. La diffusibilité de cette molécule est conditionnée par :', options: ['Sa liposolubilité', 'Son degré d\'ionisation', 'Sa liaison aux protéines', 'La nécessité de la présence d\'un transporteur', "La nécessité d'un apport d'énergie"], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { text: 'La théophylline', options: ['Est une base xanthique', 'Inhibe la libération des catécholamines', 'Possède des propriétés diurétiques', "A une action spasmolytique sur le muscle lisse"], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { text: 'Les glucosides cardiotoniques :', options: ['Leur action est inotrope positive à doses thérapeutiques', "Ils inhibent l'ATPase membranaire du myocarde", 'La digoxine a une meilleure biodisponibilité que la digitoxine', "L'élimination de la digoxine se fait par dégradation hépatique", 'La ½-vie d\'élimination de la digoxine est d\'environ 5 à 3 jours'], correctAnswer: 4, correctAnswers: [0, 1, 4] },
  { text: 'La biotransformation des médicaments peut être influencée par :', options: ['Âge', 'Sexe', 'Dose administrée', "Association d'autres médicaments"], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { text: 'La résorption d\'une molécule médicamenteuse à travers la muqueuse digestive peut être influencée par :', options: ['Le pH', 'La forme pharmaceutique utilisée', 'La liposolubilité de la molécule', 'La présence simultanée d\'autres médicaments'], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { text: "On administre à un malade en 2 prises quotidiennes un médicament dont la ½ vie est de 12 heures. Au bout de combien de temps la concentration plasmatique de ce médicament aura-t-elle atteint un plateau :", options: ['Un jour', 'Deux jours', 'Six jours'], correctAnswer: 1, correctAnswers: [1] },
  { text: "Quel est l'antispasmodique qui possède des propriétés atropiniques :", options: ['Mébévérine (Duspatalin®)', 'Trimébutine (Débridat®)', 'Tiémonium (Viscéralgine®)'], correctAnswer: 1, correctAnswers: [1, 2] },
  { text: 'Effet dopaminergique périphérique :', options: ['Augmentation de la fréquence cardiaque', 'Bronchodilatation', 'Vasodilatation rénale'], correctAnswer: 2, correctAnswers: [2] },
  { text: 'La prazosine (Minipress®) :', options: ['Bloque les récepteurs α1 postsynaptique', 'Bloque les récepteurs α2 postsynaptique', "Bloque les récepteurs β et α postsynaptiques"], correctAnswer: 2, correctAnswers: [0, 2] },
  { text: 'Le volume de distribution du médicament dans l\'organisme :', options: ['Est un volume fictif', 'Peut dépasser le volume total de l\'organisme', "Varie en fonction du degré de fixation protéique du médicament", "Est corrélé à la concentration plasmatique de ce médicament", 'Augmente avec l\'âge'], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { text: "L'atropine exerce les effets suivants :", options: ['Tachycardie', 'Bronchoconstriction', 'Augmentation des sécrétions salivaires, gastriques et intestinales', 'Mydriase', 'Diminution des péristaltismes intestinal et vésical'], correctAnswer: 3, correctAnswers: [0, 3, 4] },
  { text: 'La modification de la fixation protéique des médicaments est influencée par :', options: ['Syndrome néphrotique', 'Syndrome inflammatoire', 'Prématurité', 'Insuffisance thyroïdienne'], correctAnswer: 3, correctAnswers: [0, 1, 2] },
  { text: 'Effets alpha-adrénergiques :', options: ['Augmentation de la pression artérielle diastolique', 'Mydriase passive', 'Vasoconstriction des artères rénales', 'Augmentation de la sécrétion de rénine'], correctAnswer: 3, correctAnswers: [1, 2] },
  { text: "Quel effet indésirable n'est pas classique avec la clonidine :", options: ['Anémie hémolytique', 'Bradycardie sinusale', 'Somnolence', 'Hypotension orthostatique', 'Rebond hypertensif à l\'arrêt du médicament'], correctAnswer: 0, correctAnswers: [0] },
  { text: "L'activité anticholinergique, source d'effets indésirables, peut se rencontrer dans les classes médicamenteuses suivantes sauf, une :", options: ['Morphinique', 'Antidépresseurs tricycliques', 'Neuroleptiques', 'Antihistaminiques', 'Antispasmodiques du tube digestif'], correctAnswer: 0, correctAnswers: [1, 2, 3, 4] },
  { text: "L'acétylcholine :", options: ['Produit un myosis actif', "Agit sur les récepteurs muscariniques", 'Agit sur les récepteurs alpha 2 adrénergiques', "Est contre-indiquée en cas d'hypertrophie prostatique"], correctAnswer: 1, correctAnswers: [0, 1] },
  { text: "La fixation d'un médicament aux protéines plasmatiques dépend :", options: ['Du nombre de sites de fixation', "De l'affinité", 'De la concentration plasmatique du médicament', 'De la concentration plasmatique de la protéine porteuse'], correctAnswer: 3, correctAnswers: [0, 1, 3] },
  { text: "L'isoprénaline :", options: ['Est un sympathomimétique agoniste bêta', "Exerce des actions cardiaques inotropes et chronotropes positives", "Est vasodilatatrice sur les artères rénales et mésentériques", 'Ne modifie pas le débit cardiaque'], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { text: 'Le métoclopramide :', options: ['Est un antiémétique', "Augmente la pression du sphincter inférieur de l'œsophage", 'Diminue les contractions antrales', 'Appartient au groupe des benzamides neuroleptiques', 'Peut être responsable de dyskinésie'], correctAnswer: 3, correctAnswers: [0, 3, 4] },
  { text: 'Les effets indésirables des corticoïdes administrés au long cours comporte :', options: ['Une fuite rénale de sodium', 'Une rétention de potassium', 'Une amyotrophie', 'Une hyperglycémie', 'Une hypercalcémie'], correctAnswer: 3, correctAnswers: [2, 3] },
  { text: 'Tous les médicaments suivants sont inducteurs enzymatiques, sauf deux lesquels :', options: ['Phénytoïne', 'Carbamazépine', 'Aspirine', 'Érythromycine', 'Rifampicine'], correctAnswer: 2, correctAnswers: [0, 1, 3, 4] },
  { text: "L'administration de dopamine chez un malade en état de choc peut provoquer :", options: ['Une vasodilatation des artères rénales par l\'intermédiaire des récepteurs dopaminergiques', "Une vasoconstriction périphérique par l'intermédiaire des récepteurs adrénergiques", 'Une augmentation du débit cardiaque'], correctAnswer: 2, correctAnswers: [0, 2] },
  { text: "Les médicaments qui peuvent entraîner une gynécomastie :", options: ['Corticoïdes', 'Spironolactone', 'Alpha-méthyldopa', 'Furosémide', 'Cimétidine'], correctAnswer: 3, correctAnswers: [1, 3, 4] },
  { text: 'Le traitement par corticoïdes provoque le ou les effets suivants :', options: ['Une fuite rénale de sodium', 'Une rétention de potassium', 'Une amyotrophie', 'Une hyperglycémie', 'Une hypercalcémie'], correctAnswer: 3, correctAnswers: [2, 3] },
  { text: 'Les antagonistes des AVK sont les suivants :', options: ['Protamine', 'Vitamine K', 'Antifibrinolytiques', 'PPSB'], correctAnswer: 2, correctAnswers: [1] },
  { text: 'Signes observés lors du syndrome de sevrage aux opiacés :', options: ['Rhinorrhée', 'Horripilation cutanée', 'Mydriase', 'Douleurs musculaires'], correctAnswer: 2, correctAnswers: [0, 1, 2, 3] },
  { text: "Les corticoïdes peuvent avoir comme effets :", options: ['Hypercalcémie', 'Rétention hydrosodée', 'Augmentation du catabolisme protidique', 'Diminution des éosinophiles circulants'], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { text: 'Les antidépresseurs tricycliques peuvent induire les effets indésirables suivants :', options: ['Sécheresse de la bouche', 'Abaissement du seuil épileptogène', 'Toxicité myocardique', 'Pigmentation cutanée'], correctAnswer: 2, correctAnswers: [0, 1, 2] },
  { text: "Le passage transmembranaire d'une substance par diffusion passive :", options: ["S'effectue selon le gradient de concentration", "Est indépendant du pH", "Dépend de l'épaisseur de la membrane", "Est indépendant du pKa de la substance"], correctAnswer: 2, correctAnswers: [0, 2] },
  { text: "On peut attribuer aux benzodiazépines un effet :", options: ['Anticonvulsivant', 'Amnésiant', 'Hypnotique', 'Myorelaxant', 'De rétention urinaire'], correctAnswer: 4, correctAnswers: [0, 1, 2, 3] },
  { text: 'Effets indésirables suivants, lesquels :', options: ['Agranulocytose', 'Alopécie', 'Nécrose cutanée', 'Thrombopénie'], correctAnswer: 2, correctAnswers: [0, 2, 3] },
  { text: "Quelle est la propriété que n'ont pas en commun les neuroleptiques et les antidépresseurs tricycliques :", options: ['Alpha bloquant', 'Anticholinergique', 'Antisérotonine', 'Antihistamine H1', "Inhibition du recaptage de la noradrénaline"], correctAnswer: 4, correctAnswers: [4] },
  { text: "Quel est l'antihypertenseur susceptible de provoquer une hypertrichose :", options: ['La dihydralazine', 'Le propranolol', 'Le minoxidil', 'Le furosémide'], correctAnswer: 2, correctAnswers: [2] },
  { text: "Le principal effet secondaire des agents bloquants les récepteurs α-1 post-synaptiques :", options: ['Céphalée', 'Hypotension orthostatique', 'Rétention urinaire', 'Douleurs angineuses'], correctAnswer: 1, correctAnswers: [1] },
  { text: 'Tous les médicaments suivants sont capables de potentialiser l\'action des AVK à l\'exception d\'un seul, lequel :', options: ['Aspirine', 'Indométacine', 'Phénobarbital', 'Phénylbutazone', 'Clofibrate'], correctAnswer: 2, correctAnswers: [0, 1, 3, 4] },
  { text: "L'action stimulante intrinsèque d'un bêta-bloquant :", options: ["Se manifeste plus au repos qu'à l'effort", "Se manifeste plus lors d'une émotion que pendant le sommeil", "Peut s'expliquer par un effet dit agoniste partiel sur les récepteurs β-adrénergiques", "Peut s'expliquer par un effet partiel sur récepteur α-adrénergique", "Favorise le passage de la barrière hémato-encéphalique"], correctAnswer: 4, correctAnswers: [0, 2] },
  { text: "La néphrotoxicité et l'ototoxicité de la gentamicine sont potentialisées par :", options: ['Ampicilline', 'Furosémide', 'Cimétidine'], correctAnswer: 1, correctAnswers: [1] },
  { text: 'Une corticothérapie prolongée peut être responsable :', options: ["D'une hypercholestérolémie", "D'une hypokaliémie", "D'une ostéonécrose aseptique de la tête fémorale", "D'une hyponatrémie", "D'un retard de croissance"], correctAnswer: 1, correctAnswers: [0, 1, 2, 4] },
  { text: "Les effets d'une stimulation des récepteurs dopaminergiques :", options: ['Diminution de la fréquence cardiaque', 'Vasoconstriction cutanée', 'Bronchoconstriction', 'Vasodilatation rénale'], correctAnswer: 3, correctAnswers: [3] },
  { text: "La biodisponibilité d'un médicament désigne :", options: ["La fraction non liée aux protéines plasmatiques", "La fraction de la dose résorbée à l'état actif", "La vitesse de résorption", "La concentration plasmatique maximum"], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: "Un médicament β-mimétique possède parmi les propriétés pharmacologiques suivantes :", options: ['Action vasoconstrictrice', 'Action inotrope positive', 'Action ocytocique', 'Action chronotrope positive'], correctAnswer: 3, correctAnswers: [1, 3] },
  { text: 'La demi-vie d\'un médicament :', options: ["Est la moitié du temps que met une dose unique de médicament pour disparaître en totalité de l'organisme", "Est paramètre pharmacocinétique caractéristique d'un médicament donné, pour un sujet donné", "Est le temps au bout duquel la moitié, d'une dose unique de médicament est éliminée", "Peut être mesurée graphiquement sur la courbe de décroissance de la concentration sanguine d'un médicament", "Est le temps nécessaire pour que la concentration plasmatique initiale diminue de moitié"], correctAnswer: 4, correctAnswers: [1, 4] },
  { text: 'La fixation protéique des médicaments de type acide faible dans le plasma :', options: ['Se fait surtout sur l\'albumine', 'Est réversible', "Est plus forte chez l'homme que chez la femme", 'Est généralement saturable', "Diminue en cas de prise concomitante d'un médicament base faible"], correctAnswer: 4, correctAnswers: [0, 1] },
  { text: 'Une substance susceptible de bloquer les récepteurs dopaminergiques :', options: ['Dompéridone', 'Propranolol', 'Yohimbine'], correctAnswer: 2, correctAnswers: [2] },
  { text: 'Le furosémide est responsable de tous les effets suivants sauf un, lequel :', options: ['Hypokaliémie', 'Hyperglycémie', "Élévation de l'uricémie", 'Hypoprotidémie', 'Hyponatrémie'], correctAnswer: 3, correctAnswers: [0, 1, 2, 4] },
  { text: "L'administration de doxycycline chez un patient de 60 ans qui a une insuffisance rénale sévère :", options: ["On ne modifie ni la dose, ni l'intervalle d'administration", "On diminue de moitié la dose sans modifier l'intervalle", "On ne modifie pas la dose mais on augmente l'intervalle", "On diminue la dose de moitié et on triple l'intervalle"], correctAnswer: 0, correctAnswers: [0] },
  { text: "Les médicaments suivants contenant la structure hydrazine : isoniazide, dihydralazine, sont en majeure partie excrétée :", options: ['Après hydroxylation hépatique', 'Après acétylation hépatique', "Après glycuro-conjugaison hépatique", 'Directement par filtration glomérulaire rénale', 'Directement par sécrétion tubulaire rénale'], correctAnswer: 1, correctAnswers: [1] },
  { text: "La filtration glomérulaire d'un médicament est favorisée directement par :", options: ['Une forte lipophilie', "Une forte ionisation au pH du plasma", "Une forte fixation aux protéines plasmatiques"], correctAnswer: 1, correctAnswers: [1] },
  { text: 'Les transformations métaboliques des médicaments :', options: ["Conduisent, dans la plupart des cas, à des dérivés plus liposolubles", "Peuvent conduire à des dérivés actifs", "S'effectuent toujours dans le foie", "Peuvent être l'objet de variations inter individuelles"], correctAnswer: 3, correctAnswers: [0, 1, 3] },
  { text: "On peut éviter ou réduire l'importance de l'effet de premier passage pour un médicament :", options: ["En le prescrivant en suppositoire", "En le prescrivant par voie intramusculaire sous une forme retard", "En le prescrivant sous une forme pour application cutanée", "En évitant de réitérer le traitement à intervalles de temps trop rapprochés"], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: "Le bêtabloquant qui a l'activité sympathomimétique intrinsèque marquée :", options: ['Propranolol', 'Pindolol', 'Aténolol', 'Métoprolol', 'Nadolol'], correctAnswer: 1, correctAnswers: [1] },
  { text: "Médicament qui peut conduire à la production de métabolite toxique qui peut être responsables d'une hépatite :", options: ['Phénobarbital', 'Isoniazide', 'Digitoxine', 'Gentamycine'], correctAnswer: 1, correctAnswers: [1] },
  { text: "La clairance totale d'un médicament peut être estimée en connaissant :", options: ["La ½-vie plasmatique d'élimination de ce médicament", 'Le flux plasmatique rénal', "La clairance rénale de ce médicament"], correctAnswer: 2, correctAnswers: [2] },
  { text: "La pratique de la dose de charge donnée au début d'un traitement prolongé est réalisée pour :", options: ["Les médicaments dont la ½-vie plasmatique est moins de 6 heures", "Les médicaments dont la ½-vie est de plusieurs jours", "Raccourcir le délai d'installation de la concentration plasmatique stationnaire du médicament", "Saturer les mécanismes d'élimination du médicament", "Raccourcir la durée totale du traitement"], correctAnswer: 4, correctAnswers: [2] },
  { text: "Parmi les médicaments suivants, lequel stimule directement les récepteurs :", options: ['Trihexyphénidyle (Artane®)', 'Halopéridol (Haldol®)', 'Bromocriptine (Parlodel®)', 'L-dopa + bensérazide (Modopar®)', 'Dompéridone (Motilium®)'], correctAnswer: 2, correctAnswers: [2, 3] },
  { text: "La plupart des AINS peuvent majorer dangereusement l'effet des anticoagulants oraux et des hypoglycémiants sulfamidés. Cela s'explique par :", options: ['Une induction enzymatique', 'Une inhibition enzymatique', 'La défixation protéique par compétition'], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: "Le mécanisme le plus vraisemblable de l'action thérapeutique des neuroleptiques est essentiellement :", options: ["Un blocage des récepteurs α-adrénergiques", "Un blocage des récepteurs β-adrénergiques", "Un blocage des récepteurs dopaminergiques", "Une inhibition du recaptage présynaptique des catécholamines", "Un blocage des récepteurs sérotoninergiques"], correctAnswer: 2, correctAnswers: [2] },
  { text: "La stimulation des récepteurs β-adrénergiques provoque :", options: ['Une vasodilatation', "Un relâchement de l'utérus gravide", "Une augmentation de la sécrétion d'insuline"], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: "Les corticostéroïdes par voie orale :", options: ["N'ont pas d'action curative sur les maladies rhumatismales", "N'exercent pas d'interactions pharmacocinétiques connues par défixation protéique", "N'exercent pas d'interactions pharmacocinétiques connues par induction enzymatique"], correctAnswer: 2, correctAnswers: [0] },
  { text: "Les amphétamines sont des sympathomimétiques dont l'action prédominante s'exerce au niveau central. Quels sont les effets sur le SNV que l'on peut noter :", options: ['Myosis', 'Tachycardie', 'HTA', "Diminution de l'excitabilité myocardique", "Hyperpéristaltisme intestinal"], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: "Quel antibiotique qui a la meilleure diffusion dans les espaces arachnoïdiens :", options: ['Pénicilline G', 'Céphalosporine G1', 'Colimycine', 'Chloramphénicol'], correctAnswer: 3, correctAnswers: [3] },
  { text: "L'alpha-méthyldopa est susceptible d'induire :", options: ["Une anémie hémolytique auto-immune", "Une anémie hémolytique immunoallergique médicamenteuse"], correctAnswer: 1, correctAnswers: [1] },
  { text: "Médicaments qui peuvent être responsable de l'apparition d'un lupus érythémateux disséminé :", options: ['Aspirine', 'Bêtabloquants', 'Procaïnamide', 'Quinidine'], correctAnswer: 2, correctAnswers: [2, 3] },
  { text: "La biodisponibilité d'un médicament administré par voie IV vraie est de :", options: ['Imprévisible', '50 %', '100 %'], correctAnswer: 2, correctAnswers: [2] },
  { text: "Le volume de distribution du médicament dans l'organisme :", options: ['Est un volume théorique', 'Peut dépasser le volume total de l\'organisme', "Varie en fonction du degré de fixation protéique du médicament", "A une incidence sur la concentration plasmatique du médicament"], correctAnswer: 3, correctAnswers: [1, 2, 3] },
  { text: "Parmi les effets suivants des neuroleptiques phénothiaziniques (chlorpromazine), quels sont ceux qui s'expliquent par leur action antidopaminergique :", options: ['Hyperprolactinémie', 'Eruption', 'Syndrome extrapyramidal', 'Constipation', 'Indifférence psychique'], correctAnswer: 3, correctAnswers: [0, 2] },
  { text: "L'état d'équilibre des concentrations plasmatiques de la digoxine :", options: ['En 7 à 9 jours (5 x ½ vies)'], correctAnswer: 0, correctAnswers: [0] },
  { text: "La morphine :", options: ['Provoque un myosis', 'Déprime les centres respiratoires', 'Peut être administrée par voie orale', 'Est toxicomanogène'], correctAnswer: 3, correctAnswers: [0, 1, 2, 3] },
  { text: "La toxicité de la digoxine peut être accrue en cas de :", options: ['Traitement associé par le fénofibrate', 'Hypokaliémie', "Traitement associé à la rifampicine", 'Hypercalcémie', 'Hypoxie'], correctAnswer: 4, correctAnswers: [1, 3, 4] },
  { text: "Les substances suivantes peuvent induire une hyperprolactinémie, sauf une laquelle :", options: ['Benzamide (Ex : Primpéran®)', 'Phénothiazines (ex : Largactil®)', 'Analgésique morphinique', 'Cimétidine'], correctAnswer: 2, correctAnswers: [0, 1, 3] },
  { text: 'Médicaments qui augmentent le tonus du sphincter inférieur de l\'œsophage :', options: ['La dompéridone', 'La nifédipine', 'Le métoclopramide', "L'atropine"], correctAnswer: 2, correctAnswers: [0, 2] },
  { text: "La biodisponibilité d'un médicament :", options: ['Est strictement dose dépendante', 'Dépend de la voie d\'administration', "Est diminuée par l'effet de premier passage"], correctAnswer: 2, correctAnswers: [1, 2] },
  { text: 'Les médicaments qui peuvent être cause de constipation sont :', options: ['Le phosphate d\'aluminium', 'Les opiacés', "L'ampicilline", 'Les antidépresseurs tricycliques'], correctAnswer: 3, correctAnswers: [1, 3] },
  { text: 'Médicaments qui ↓ le tonus du SIO :', options: ['La dompéridone', 'La nifédipine', 'Les dérivés nitrés retard', 'Le métoclopramide', "L'atropine"], correctAnswer: 4, correctAnswers: [1, 2, 3, 4] },
  { text: 'Tous les médicaments suivants sont utilisés dans le traitement de fond de la migraine sauf un :', options: ['Carbamazépine', 'Méthysuride', 'Propranolol', 'Pizotifène (Sanmigran)', 'Dihydroergotamine'], correctAnswer: 0, correctAnswers: [0] },
  { text: 'Quels sont les médicaments pour lesquels un surdosage peut être observé dans l\'association à un AINS :', options: ['Anticoagulant', 'Lithium'], correctAnswer: 1, correctAnswers: [1] },
  { text: 'Effets secondaires de la Dépakine :', options: ['Thrombopénie', 'Hépatite médicamenteuse'], correctAnswer: 1, correctAnswers: [0, 1] },
  { text: "Médicaments qui stimulent directement les récepteurs dopaminergiques :", options: ['Bromocriptine'], correctAnswer: 0, correctAnswers: [0] },
  { text: "Effets secondaires d'un AINS en IM :", options: ['Polynévrite', 'Syndrome de Lyell', 'Abcès local', 'Ulcère gastrique'], correctAnswer: 3, correctAnswers: [2, 3] },
  { text: "Cocaïne : sympathomimétique indirect ; effet anesthésique local :", options: ['Vrai'], correctAnswer: 0, correctAnswers: [0] },
  { text: "Quel est le diurétique qui n'est pas contre-indiqué au cours de l'insuffisance rénale sévère :", options: ['Le clopamide', 'Le furosémide'], correctAnswer: 1, correctAnswers: [1] },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Clear existing data
  console.log('🗑️  Clearing existing data...');
  await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('school_years').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Insert school years
  console.log('📚 Inserting school years...');
  const schoolYears = [
    { name: '1ère Année', short_label: '1ère', display_order: 1 },
    { name: '2ème Année', short_label: '2ème', display_order: 2 },
    { name: '3ème Année', short_label: '3ème', display_order: 3 },
    { name: '4ème Année', short_label: '4ème', display_order: 4 },
    { name: '5ème Année', short_label: '5ème', display_order: 5 },
    { name: '6ème Année', short_label: '6ème', display_order: 6 },
    { name: '7ème Année', short_label: '7ème', display_order: 7 },
  ];
  const { data: insertedYears, error: yearsError } = await supabase.from('school_years').insert(schoolYears).select();
  if (yearsError) { console.error('Error inserting school years:', yearsError); return; }
  console.log(`   ✅ Inserted ${insertedYears.length} school years`);

  const year3Id = insertedYears.find(y => y.display_order === 3)?.id;
  if (!year3Id) { console.error('Could not find 3rd year'); return; }

  // 3. Insert subjects for year 3
  console.log('📖 Inserting subjects...');
  const subjects = [
    { name: 'Microbiologie', school_year_id: year3Id, description: 'Agents pathogènes : bactériologie, virologie, mycologie, parasitologie', icon: 'zap' },
    { name: 'Pathologie', school_year_id: year3Id, description: 'Étude des maladies et mécanismes pathologiques', icon: 'stethoscope' },
    { name: 'Pharmacologie', school_year_id: year3Id, description: 'Médicaments, pharmacocinétique, pharmacodynamie - QCM Constantine 2020', icon: 'pill' },
  ];
  const { data: insertedSubjects, error: subjectsError } = await supabase.from('subjects').insert(subjects).select();
  if (subjectsError) { console.error('Error inserting subjects:', subjectsError); return; }
  console.log(`   ✅ Inserted ${insertedSubjects.length} subjects`);

  const pharmacoSubjectId = insertedSubjects.find(s => s.name === 'Pharmacologie')?.id;
  if (!pharmacoSubjectId) { console.error('Could not find Pharmacologie subject'); return; }

  // 4. Insert exam
  console.log('📝 Inserting exam...');
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({
      university: 'Université de Constantine',
      year: 2020,
      exam_type: 'EMD',
      school_year_id: year3Id,
      subject_id: pharmacoSubjectId,
      is_published: true,
    })
    .select()
    .single();
  if (examError) { console.error('Error inserting exam:', examError); return; }
  console.log(`   ✅ Inserted exam: ${exam.id}`);

  // 5. Insert questions
  console.log(`📋 Inserting ${pharmacoQuestions.length} questions...`);
  const questionsToInsert = pharmacoQuestions.map((q, index) => ({
    exam_id: exam.id,
    question_order: index + 1,
    question_text: q.text,
    options: q.options,
    correct_answer: q.correctAnswer,
    correct_answers: q.correctAnswers,
  }));

  // Insert in batches of 20
  for (let i = 0; i < questionsToInsert.length; i += 20) {
    const batch = questionsToInsert.slice(i, i + 20);
    const { error: qError } = await supabase.from('questions').insert(batch);
    if (qError) { console.error(`Error inserting questions batch ${i}:`, qError); }
  }
  console.log(`   ✅ Inserted ${pharmacoQuestions.length} questions`);

  console.log('\n🎉 Seed complete!');
  console.log(`   School Years: ${insertedYears.length}`);
  console.log(`   Subjects: ${insertedSubjects.length}`);
  console.log(`   Exams: 1`);
  console.log(`   Questions: ${pharmacoQuestions.length}`);
}

seed().catch(console.error);
