questions_raw = {
    1: "Concernant l'absorption des medicaments:",
    2: "Lors de l'elimination renale des medicaments, la filtration glomerulaire:",
    3: "Les interactions medicamenteuses en phase de metabolisme:",
    4: "La prescription des medicaments de la liste I:",
    5: "Concernant la prescription des psychotropes:",
    6: "L'ordonnance:",
    7: "Les tetracyclines:",
    8: "Les phenicoles:",
    9: "Les aminosides:",
    10: "Concernant l'association Cisapride + Azithromycine:",
    11: "Concernant l'antagonisme fonctionnel:",
    12: "Concernant les agonistes beta2 adrenergiques:",
    13: "Le propranolol:",
    14: "Carbidopa et benserazide:",
    15: "La modelisation moleculaire:",
    16: "Les essais cliniques de phase II:",
    17: "Les recepteurs beta1 adrenergiques:",
    18: "Concernant le recepteur des steroides:",
    19: "Les essais cliniques de phase I:",
    20: "Concernant les contre-indications des AINS:",
    21: "Les antalgiques du palier II:",
    22: "La buprenorphine:",
    23: "L'effet Nocebo:",
    24: "Les effets indesirables de type B:",
    25: "Parmi les effets suivants, lesquels concernent une activite parasympathomimetique:",
    26: "Tropicamide:",
    27: "Parmi les molecules suivantes, laquelle est indiquee en cas de glaucome:",
    28: "Si les doses orales et IV sont differentes, le calcul du facteur de biodisponibilite:",
    29: "Si la concentration plasmatique a la sortie de l'organe est egale a zero:",
    30: "La clairance par l'organe etant egale a la clairance totale:",
    31: "La vitesse d'absorption d'un medicament impacte:",
    32: "L'effet post-antibiotique:",
    33: "A quelle generation de cephalosporines appartient le Cefuroxime (ZINNAT)?:",
    34: "Effets indesirables des beta-bloquants:",
    35: "Effets indesirables des IEC:"
}

options_raw = {
    1: [
        "Peut se faire par la DCI ou par le nom commercial",
        "Se fait sur une ordonnance extraite d'un carnet a souches",
        "Elle peut etre limitee par un effet de premier passage hepatique",
        "Elle peut etre quantifiee par la clairance",
        "La modification du transit intestinal n'a pas d'influence sur l'absorption des medicaments administres par voie orale"
    ],
    2: [
        "Est un phenomene actif",
        "Est saturable",
        "Se fait par le biais de transporteurs specifiques",
        "Peut faire l'objet d'un phenomene de competition",
        "Toutes les reponses sont fausses"
    ],
    3: [
        "Sont representees par l'induction enzymatique qui entraine une diminution du metabolisme hepatique",
        "Peuvent entrainer un echec therapeutique",
        "Sont representees par l'inhibition enzymatique qui entraine une acceleration du metabolisme hepatique",
        "Peuvent entrainer un surdosage",
        "Sont toujours pertinentes sur le plan clinique"
    ],
    4: [
        "Doit mentionner les coordonnees du prescripteur",
        "Doit mentionner la posologie des medicaments en toutes lettres",
        "La duree maximale de prescription est de 28 jours",
        "Le risque d'interaction est plus important pour les medicaments absorbes via un mecanisme de transport actif",
        "La diffusion passive est un phenomene saturable"
    ],
    5: [
        "Se fait sur une ordonnance classique",
        "La duree maximale de prescription est de 12 semaines pour les anxiolytiques",
        "La duree de validite de l'ordonnance ne peut exceder 3 mois",
        "Tout medecin doit enregistrer ces prescriptions sur un registre special conserve pendant une annee",
        "La posologie doit etre indiquee en toutes lettres lisibles"
    ],
    6: [
        "Est un document legal redige obligatoirement par un medecin",
        "Comporte l'identification du traitement en DCI obligatoirement",
        "Peut comporter d'autres prescriptions que celles des medicaments (soins infirmiers et paramedicaux, examens complementaires...)",
        "Comporte des mentions pharmacologiques comme la posologie",
        "Comporte des mentions reglementaires comme le nom et le prenom du patient"
    ],
    7: [
        "Agissent en inhibant la synthese de l'acide nucleique bacterien",
        "Agissent en inhibant la synthese proteique par action sur la sous-unite 30S du ribosome",
        "On peut restaurer l'effet de l'agoniste par l'augmentation de la concentration de l'antagoniste",
        "Peuvent entrainer une dyschromie dentaire chez les enfants de moins de 8 ans",
        "Ont un spectre d'activite etroit. Diffusent mal dans les tissus"
    ],
    8: [
        "Agissent sur la sous-unite 30S du ribosome",
        "Sont bactericides",
        "Peuvent entrainer une toxicite medullaire",
        "Peuvent entrainer une photosensibilisation",
        "Sont utilises surtout par voie topique"
    ],
    9: [
        "Ont comme cible principale la sous-unite 30S du ribosome",
        "Sont actifs sur les bacteries anaerobies strictes",
        "Ont une bonne biodisponibilite par voie orale",
        "Sont des antibiotiques de choix en cas d'infections nosocomiales severes",
        "Peuvent entrainer des troubles auditifs"
    ],
    10: [
        "Il s'agit d'une contre-indication relative",
        "Il s'agit d'une contre-indication absolue",
        "L'erythromycine est un inhibiteur de l'enzyme CYP3A4",
        "L'objectif therapeutique est d'augmenter la securite de l'Acenocoumarol",
        "L'objectif therapeutique est de diminuer le cout de l'Acenocoumarol"
    ],
    11: [
        "L'agoniste et l'antagoniste se fixent sur le meme endroit du recepteur",
        "L'agoniste et l'antagoniste se fixent sur le meme recepteur au niveau de sites differents",
        "L'effet de l'agoniste peut etre surpasse par l'antagoniste",
        "L'antagonisme competitif peut etre surmontee par l'augmentation de la concentration de l'agoniste",
        "Sans ligand le recepteur se dissocie des proteines HSP"
    ],
    12: [
        "Le salbutamol en est un exemple",
        "Ils peuvent etre utilises dans le traitement de l'asthme",
        "Ils entrainent une bronchodilatation",
        "Ils ont un effet ocytocique",
        "Ils peuvent avoir comme effet indesirable une glycogenolyse"
    ],
    13: [
        "Est un beta-bloquant liposoluble",
        "Est indique dans l'insuffisance cardiaque congestive",
        "Possede un effet beta-agoniste partiel au repos",
        "Possede une selectivite beta-1 relative et dose dependante",
        "Est pourvu d'un effet stabilisateur de la membrane"
    ],
    14: [
        "Sont des sympathomimetiques indirects",
        "Exercent une action peripherique uniquement",
        "Inhibent la dopa-decarboxylase au niveau du systeme nerveux central",
        "Sont des antiparkinsoniens directs",
        "Sont des sympatholytiques indirects"
    ],
    15: [
        "Est une simulation des systemes chimiques",
        "N'est pas assistee par un ordinateur",
        "Est faite avant l'identification de la cible pharmacologique",
        "Necessite la confirmation de l'activite pharmacologique en prealable",
        "Vise la conception d'un pharmacophore"
    ],
    16: [
        "Le nombre des volontaires dans la phase IIA est superieur a la phase IIB",
        "Ils se font sur des volontaires sains",
        "Ils permettent de determiner les interactions medicamenteuses",
        "Determinent la dose optimale en termes d'efficacite",
        "Detectent les effets indesirables a long terme"
    ],
    17: [
        "Sont couples a la proteine Gs",
        "Sont couples a la proteine Gi",
        "Leur activation entraine la diminution du calcium intracellulaire",
        "Leur stimulation entraine l'inactivation de la Proteine Kinase A",
        "Leur stimulation entraine un effet dromotrope positif"
    ],
    18: [
        "C'est un recepteur membranaire a activite enzymatique",
        "C'est un recepteur membranaire couple a la proteine Gs",
        "La regulation positive augmente la synthese enzymatique des proteines anti-inflammatoires",
        "La regulation negative diminue la synthese des proteines inflammatoires",
        "Sans ligand le recepteur se dissocie des proteines HSP"
    ],
    19: [
        "Permettent le depistage des reactions d'intolerance",
        "Permettent de mettre au point la forme galenique",
        "Sont une etude pilote",
        "Se font sur des groupes de sujets malades",
        "Comprennent des groupes de 200 a 500 volontaires"
    ],
    20: [
        "Ulcere gastroduodenal en evolution",
        "Asthme",
        "Insuffisance hepatocellulaire et renale severe",
        "Dysmenorrhee",
        "Accidents ischemiques"
    ],
    21: [
        "Peuvent etre associes aux antidepresseurs tricycliques",
        "Sont contre-indiques en cas d'insuffisance respiratoire",
        "Peuvent etre prescrits en cas de grossesse",
        "Peuvent etre associes au paracetamol",
        "Provoquent nausees et somnolence"
    ],
    22: [
        "Est un agoniste parfait des recepteurs mu",
        "Provoque une dependance psychique plus importante que la morphine",
        "La naloxone a un effet important sur elle",
        "Est un traitement rapide et efficace d'une douleur intense",
        "Produit un metabolite actif"
    ],
    23: [
        "Se voit avec une forme medicamenteuse ne contenant aucune substance active",
        "Est un effet benefique",
        "Est un effet nefaste",
        "Est un effet therapeutique",
        "N'existe pas"
    ],
    24: [
        "Sont previsibles",
        "Sont imprevisibles",
        "Dependent de la posologie",
        "Ne dependent pas de la posologie",
        "Leur incidence est faible"
    ],
    25: [
        "Bradycardie",
        "Diminution de la secretion acide gastrique",
        "Bronchoconstriction",
        "Mydriase",
        "Constipation"
    ],
    26: [
        "Est un parasympathomimetique",
        "Est utilise pour le traitement du glaucome",
        "Est indique comme mydriatique en vue de l'examen de fond d'oeil",
        "Est un parasympatholytique",
        "Est utilise dans le traitement de l'asthme"
    ],
    27: [
        "Aceclidine",
        "Tropicamide",
        "Atropine",
        "Tiemonium",
        "Ipratropium"
    ],
    28: [
        "Est impossible",
        "Utilise seulement la valeur de la dose IV",
        "Utilise la formule generale x l'inverse des doses",
        "Utilise la formule generale inchangee",
        "Utilise la formule generale x doses orale"
    ],
    29: [
        "Le facteur d'extraction est nul",
        "La clairance est nulle",
        "Le facteur d'extraction peut etre inferieur a 1",
        "La clairance par l'organe est egale au debit de perfusion",
        "La clairance par l'organe est egale a la clairance totale"
    ],
    30: [
        "La biodisponibilite absolue est egale a la biodisponibilite relative",
        "La biodisponibilite absolue est superieure a la biodisponibilite relative",
        "La biodisponibilite absolue est inferieure a la biodisponibilite relative",
        "La biodisponibilite absolue et la biodisponibilite relative ne peuvent etre comparees",
        "Aucune de ces reponses"
    ],
    31: [
        "L'AUC",
        "La concentration maximale",
        "Le Tmax",
        "Le volume de distribution",
        "La clairance totale"
    ],
    32: [
        "Permet d'inhiber plusieurs souches bacteriennes",
        "Permet d'augmenter la valeur de la CMI",
        "Permet de reduire les doses de l'antibiotique durant le traitement",
        "Permet l'inhibition de la croissance bacterienne apres elimination du medicament",
        "Est un effet antibiotique dependante du temps"
    ],
    33: [
        "1ere generation",
        "2eme generation",
        "3eme generation",
        "4eme generation",
        "5eme generation"
    ],
    34: [
        "Tachycardie",
        "Hypertension",
        "Bronchospasme",
        "Insuffisance cardiaque",
        "Syndrome de Raynaud"
    ],
    35: [
        "Hypertension",
        "Hypokaliemie",
        "Toux seche",
        "Insuffisance renale",
        "Hypersensibilite"
    ]
}

# Answer key: multiple correct answers per question
answers_multi = {
    1: [1, 3], 2: [0, 2], 3: [1, 2], 4: [2, 3, 4], 5: [1, 2],
    6: [2, 4], 7: [0, 3, 4], 8: [1, 4], 9: [0, 4], 10: [0, 2],
    11: [0, 4], 12: [0, 1, 2], 13: [1, 3, 4], 14: [1, 2], 15: [3, 4],
    16: [1, 3], 17: [0, 2], 18: [2, 3, 4], 19: [0, 1], 20: [0, 1, 2],
    21: [1, 3, 4], 22: [1, 3, 4], 23: [2, 3, 4], 24: [0, 2], 25: [1, 3, 4],
    26: [0, 1, 2], 27: [0, 2], 28: [2, 4], 29: [0, 2], 30: [1, 2],
    31: [2, 3, 4], 32: [0, 1, 2], 33: [2, 3, 4], 34: [1, 2, 4], 35: [0, 1, 3]
}

# Build the questions array
questions = []
for q_num in range(1, 36):
    q = {
        "text": questions_raw[q_num],
        "options": options_raw[q_num],
        "correctAnswer": answers_multi[q_num][0]  # Use first correct for single-answer quiz
    }
    questions.append(q)
    print(f"Q{q_num}: {q['text'][:50]} -> answer={q['correctAnswer']}")

# Save to JSON for seeding
import json
with open('supabase/pharmaco_2023_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(questions)} questions to supabase/pharmaco_2023_questions.json")
