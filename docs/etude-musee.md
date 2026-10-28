# Étude : « Musée Maman », expérience d'anniversaire interactive (42 ans, 28/10/2026)

## Besoin et contraintes
- Une carte de vœux interactive, conçue d'abord pour mobile, avec une finition premium : une galerie d'art consacrée à maman.
- Le parcours : entrée, plusieurs salles d'œuvres (photos et textes), puis une œuvre voilée qui révèle le cadeau physique, et enfin une lettre.
- À la fin, on peut télécharger un film vertical de la visite.
- Le prototype sert de template : tout le contenu se trouve dans un seul objet `CONFIG`.
- Remise : un lien (WhatsApp) et/ou un QR code imprimé et glissé avec le cadeau.

## Existant et références
- Projet vierge, sans code à réutiliser.
- **Closer to Johannes Vermeer** (Rijksmuseum, Q42) : plusieurs Webby Awards. Il propose une visite guidée salle par salle, et chaque salle a sa propre couleur de mur.
- **Foam Talent 2021** : Webby du meilleur UI mobile. La navigation au défilement y imite la marche dans une exposition.
- **Gift** (Blast Theory, Brighton Museum) : un parcours de musée qu'on offre à un proche. C'est le seul exemple « musée-cadeau » trouvé, et il reste un projet de recherche.
- Les services de cartes interactives (LovePanda, Ouvella, Emocia…) proposent des albums et des enveloppes, mais aucun musée personnel. Le concept est donc réellement original.

## Options techniques
| Option | Pour | Contre |
|---|---|---|
| **HTML/CSS/JS sans framework, un seul fichier** (retenu) | Chargement rapide sur mobile, hébergement gratuit (Netlify, GitHub Pages), facile à personnaliser | Moins de 3D réelle |
| Galerie 3D (Three.js) | Effet « marche » spectaculaire | Lourd sur mobile, navigation au doigt peu naturelle, risque de nausée |
| Outil no-code (Shapespark, ArtSteps) | Rapide | Rendu générique, pas de révélation sur mesure, pas d'export vidéo maîtrisé |

**Export vidéo** : le film est rendu dans un `<canvas>` de 720×1280 px, en temps réel, et enregistré par `MediaRecorder` en MP4 quand le navigateur le permet (Safari iOS, Chrome récent), sinon en WebM. C'est une mise en scène dédiée au film, sans boutons, et non une capture d'écran. Sur iPhone, on l'enregistre via la feuille de partage (« Enregistrer la vidéo »).

## Choix et justification
- Une scène plein écran par étape : billet, porte, salles I à III, salle 42 avec l'œuvre voilée, puis la lettre.
- Les gestes : toucher pour détacher le billet et ouvrir la porte, glisser horizontalement pour passer d'une œuvre à l'autre, toucher un cartel pour lire le texte long, glisser le voile vers le haut pour révéler le cadeau.
- Les numéros d'inventaire des œuvres se suivent de nº 01 à nº 11, et l'œuvre finale porte le nº 42, comme son âge.

## Impacts et risques
- **Photos** : les compresser en JPEG d'environ 1200 px de large (moins de 250 Ko chacune).
- **Musique** : optionnelle (`CONFIG.musique`), elle ne démarre qu'après un toucher, comme l'exigent les navigateurs mobiles.
- **Vidéo** : l'enregistrement dure autant que le film (environ 1 min) et l'écran doit rester allumé. Il faut le tester sur le téléphone réel.
- **Aperçu en ligne** : le téléchargement y est bloqué par le bac à sable. Il fonctionnera une fois le musée hébergé.
- **Vie privée** : utiliser une URL non indexée (`noindex`) et ne pas la publier ailleurs.

## Révision v2 : expérience 3D immersive (décision utilisateur du 27/10)
La v1 (scènes CSS 2D) est jugée trop basique. Il faut de la vraie 3D, des mouvements de caméra, de la parallaxe et des effets. Le livrable reste un site web.

| Option | Pour | Contre |
|---|---|---|
| **Three.js + GSAP ScrollTrigger + Lenis** (retenu) | Vraie 3D temps réel, caméra pilotée par le défilement, post-traitement (bloom), écosystème mûr, CDN autorisés | Poids d'environ 700 Ko, il faut soigner les performances mobiles |
| HyperFrames | Rendu vidéo de qualité | C'est un outil de *composition vidéo*, pas un site interactif. À garder éventuellement pour un film « bande-annonce » à part |
| CSS 3D + parallaxe seuls | Léger | Pas de vraie profondeur, ni de lumière ou de caméra crédibles |

**Mise en scène v2**
- **Un seul canvas WebGL plein écran.** Le défilement fait avancer la caméra sur une trajectoire (CatmullRomCurve3) à travers le musée. Le texte en DOM par-dessus défile en parallaxe, sur plusieurs plans de profondeur.
- **Séquence**
  1. Façade de nuit sous la pluie de poussière dorée : le titre se compose lettre par lettre.
  2. Les portes s'ouvrent et la caméra s'engouffre dans un travelling avant.
  3. Les salles I à III : murs de couleur, tableaux encadrés (photos en texture), cônes de lumière, sol réfléchissant. La caméra pivote vers chaque œuvre et le cartel glisse en parallaxe.
  4. Salle 42 : un drapé de velours, animé par un shader de vagues, se soulève et dévoile le cadeau. Bloom et particules.
  5. Plan de grue qui s'élève, puis la lettre.
- **Effets**
  - EffectComposer avec UnrealBloomPass, plus un passage final vignette et grain.
  - Particules de poussière dans la lumière.
  - Léger flottement de caméra au gyroscope ou à la souris.
- **Performances mobiles**
  - pixelRatio limité à 1,5, pas d'ombres temps réel (éclairage simulé par textures et dégradés).
  - Géométrie simple, textures procédurales, photos de 1024 px au maximum.
  - Bloom désactivé si le nombre d'images par seconde passe sous 40.
- **Film** : on rejoue automatiquement la même trajectoire de caméra (t de 0 à 1 sur 60 à 70 s), puis `captureStream` du canvas WebGL vers MediaRecorder. Cela réutilise le pipeline v1 (partage ou téléchargement).
- **À conserver de la v1** : l'objet `CONFIG` et son contenu, les numéros d'inventaire, la fiche cartel, la lettre et la logique d'export.

## Révision v3 : réaliste, sobre, interactif (décision utilisateur du 27/10)
Jugement de la v2 : « style jeu vidéo » (le bloom, les particules, les murs saturés et la caméra sur rail font gadget), et elle se contente de défiler. La demande : une **image de synthèse réaliste**, propre, un **design premium de musée d'objets de grande valeur**, de vraies interactions, et peu d'effets.

**Références réelles dont s'inspirer** (codes visuels uniquement, pas de copie)
- Patek Philippe Museum, Cartier (Collection / Maison), Van Cleef & Arpels : fond très sombre ou ivoire, un seul objet à la fois sous une lumière douce, grande typographie à empattements, beaucoup de vide.
- Musée Yves Saint Laurent Paris et Fondation Louis Vuitton : cartels très sobres, petites capitales espacées, filets fins.
- Rijksmuseum (Rijksstudio) et Google Arts & Culture (Pocket Gallery) : index de la collection en grille, une fiche œuvre avec zoom, une visite de salle en 3D réaliste.

**Direction**
- **Rendu réaliste (Three.js)**
  - Matériaux PBR avec `RoomEnvironment` / PMREM et tone mapping ACES.
  - Ombres de contact précalculées (texture), pas d'ombres temps réel.
  - Vitrines en verre (`MeshPhysicalMaterial`, transmission), socles en pierre ou laque mate, cadres fins en laiton brossé.
  - Murs gris taupe à texture enduit, parquet ou béton ciré mat.
  - **Ni bloom, ni particules, ni couleurs saturées.**
- **Navigation par interaction plutôt que par défilement**
  1. Accueil : un écran éditorial (titre, date, « Entrer »).
  2. Salle : on balaie gauche/droite d'une œuvre à l'autre. La caméra glisse en douceur (GSAP) et on peut faire pivoter légèrement en glissant le doigt (orbite bornée).
  3. Toucher une œuvre : plein écran, zoom au pincement, cartel complet.
  4. Bouton « Collection » : index en grille des 11 œuvres, accès direct.
  5. Vitrine nº 42 : couverte d'un drap. Un appui long soulève le drap (simulation simple) et révèle le cadeau sous la vitrine.
  6. Lettre : une page éditoriale.
- **Interface**
  - Minimale : une barre fine en haut (nom du musée, compteur 03/11, Collection) et des cartels DOM en bas.
  - Typographies Cormorant ou Bodoni Moda pour les titres, Hanken Grotesk pour l'UI.
  - Palette : noir chaud #0e0d0b, ivoire #f2ede4, taupe, laiton #b89a6a.
- **On garde de la v2** : `CONFIG`, la fiche, le pipeline film (visite automatique filmée) et le hook de test `__musee`.

### v3 retenue : « Vente exceptionnelle » sans 3D (décision utilisateur du 27/10, remplace la direction ci-dessus)
- **Pourquoi on abandonne la 3D** : on a vu des écrans noirs, sans doute quand WebGL ne démarre pas, et l'utilisateur ne tient ni à la caméra ni à une pièce en 3D. Le site sera donc **entièrement en DOM/CSS + GSAP**, et le film sera rendu dans un **canvas 2D** (comme en v1).
- **Codes visuels** : ceux d'un catalogue de vente Sotheby's ou Christie's (sans les copier).
  - Chaque photo est un **lot**, posée sur un fond studio neutre (dégradé taupe ou ivoire), éclairée doucement, avec une ombre portée réaliste.
  - Sous la photo : le numéro de lot, le titre, une ligne de provenance et « Estimation : inestimable ».
- **Parcours**
  - Couverture du catalogue (« Vente exceptionnelle — 28 octobre 2026 »).
  - On balaie d'un lot à l'autre (01 à 11). Toucher un lot l'ouvre en plein écran, avec zoom et la notice complète.
  - Le bouton « Catalogue » affiche tous les lots en grille.
  - **Lot 42** : le lot est couvert ; au marteau (appui long), il est « adjugé » et dévoile le cadeau.
  - La visite se termine sur la lettre.
- **Palette et typographie** : ivoire #f4f0e8, noir chaud #141210, taupe #8a7f72, filets fins. Bodoni Moda ou Cormorant pour les titres, Hanken Grotesk en petites capitales espacées pour l'interface.

### v3 précisée : caméra 2.5D, « automatique mais interactif » (décision utilisateur du 27/10)
- **Rendu**
  - Les scènes sont empilées en perspective CSS 3D (`perspective`, `translateZ`) sur plusieurs plans : fond studio, socle, lot, cartel, poussière de lumière.
  - La « caméra » est la transformation du conteneur de scène, animée par GSAP : travelling, panoramique, orbite légère, flou de mise au point.
  - Aucun WebGL.
  - Références : Framer Flying 3D Gallery, Webflow « infinite canvas » (profondeur en CSS seul), Codrops gallery GSAP parallax + Flip (2026).
- **Pilote automatique**
  - La visite se joue seule comme un clip, en musique.
  - Tout geste suspend le pilote, qui reprend après environ 4 s d'inactivité, depuis l'endroit où l'on se trouve.
- **Gestes**
  - Inclinaison (gyroscope) ou glissé : orbite et parallaxe autour du lot.
  - Toucher un lot : pause, zoom et notice.
  - Pincer ou bouton « Salle » : la caméra recule jusqu'à la vue d'ensemble, où les lots flottent en profondeur ; toucher un lot fait voler la caméra jusqu'à lui.
- **Moments interactifs**
  - « Enchérir » : un compteur qui s'emballe jusqu'à « Inestimable ».
  - Lot 42 voilé : appui long (le marteau), « Adjugé », puis le cadeau apparaît.
  - Les lots déjà vus sont marqués dans la salle.
  - La lettre est accessible quand on veut, et proposée à la fin du pilote.
- **Film** : on rejoue le pilote automatique, dessiné en canvas 2D (pipeline v1).
- **Méthode** : d'abord un **prototype** d'environ 1 min (couverture, salle, 2 lots, lot 42), validé sur le téléphone, puis le site complet.

## Révision v4 : musée réaliste (décision utilisateur du 27/10)

- Base : `archive/index-v2.html` (caméra au défilement, cartels, fiche, révélation du lot 42, lettre, film), effets « jeu vidéo » retirés : halos, particules, étoiles, lune, cônes additifs, bloom, grain, façade de nuit, drapé shader.
- Rendu PBR : textures Poly Haven dans `assets/tex` (parquet point de Hongrie, plâtre, noyer), environnement `RoomEnvironment` (PMREM), tone mapping ACES (exposition 1,15), pas de post-traitement (`renderer.render` direct).
- Espace : un hall d'entrée (qui remplace l'extérieur) et quatre salles de 12 m, des verrières, des cloisons percées d'arches à moulures, des portes en noyer, des bancs et des rails d'éclairage.
- Œuvres : cadres dorés à 3 anneaux, passe-partout, ombre de contact ; un pool de 4 SpotLights réassignés aux œuvres proches ; drapé en velours (sheen) plissé côté CPU.
- Limite assumée : rendu temps réel mobile, sans ombres portées ni illumination globale, donc pas photoréaliste.
- Vérif : Playwright 390×844 (SwiftShader), 19 positions, luminance 51–121, 0 erreur console.

## Révision v5 : premium blanc et or, récit chrétien (retour utilisateur du 27/10)

- **Constat v4** : plâtre texturé et parquet sombre font « ciment », salles bordeaux/vert trop lourdes ; alternance gauche/droite des œuvres = rotations de 180° répétées, donne le tournis.
- **Matières** : murs laqués ivoire lisses (sans texture plâtre), sol marbre blanc veiné (texture canvas procédurale, légèrement réfléchissant), moulures, plinthes, corniches et arches en or clair (#e0c486), bancs ivoire à pieds dorés, drapé de soie ivoire. Fond clair partout.
- **Extérieur** : le hall devient un parvis en plein jour : façade en pierre blanche, colonnes à chapiteaux dorés, fronton, lettrage or « MUSÉE MAMAN », marches, tapis ivoire bordé d'or, topiaires en jardinières, lanternes, potelets à cordon doré, bannières verticales et une **affiche d'exposition** sur chevalet doré (photo p4, titre « Une vie de grâce », date 28 octobre 2026). Clés : façade → affiche → porte.
- **Caméra** : toutes les œuvres sur le mur de droite ; dans chaque salle la caméra tourne une seule fois (lentement) vers le mur puis glisse latéralement d'œuvre en œuvre sans rotation ; le mur gauche porte le titre et le verset de la salle en lettres d'or. MOVE 1,2 → 1,5 s.
- **Photos retenues** : p1–p7 (bonnes, flatteuses) + p8 (selfie mère-fille au t-shirt « Poussés par le Saint-Esprit », autocollant effacé). Écartées : selfie sombre (10.18.21) et selfie haut jaune (qualité moindre).
- **Récit** (« Une vie de grâce ») : I. La lumière (Mt 5,14) → II. La femme vaillante (Pr 31,10) → III. Ce que tu nous transmets (Pr 31,28) → Salle d'honneur (gratitude, cadeau) → lettre et bénédiction (Nb 6,24-26). Lettre : placeholders conservés pour la partie personnelle.

## Révision v6 : pagne, cinéma, film, musique (demande du 28/10)
- **Pagne Ngouon 2026** : les chocolats sont annulés. La dernière station propose 3 coloris au toucher. Le choix est mémorisé sur le téléphone (localStorage `musee-maman-pagne`) et un bouton WhatsApp permet d'envoyer le choix. Les coloris sont provisoires et seront remplacés par les couleurs officielles quand elles seront fournies.
- **Cinéma** : une salle finale, avec rideaux, est ouverte par « Lancer la projection ».
- **Film** : un montage en canvas 2D (720×1280, environ 75 s), avec typographie cinétique, triptyque, verset, carte du pagne choisi et générique. Il est personnalisé « Madame Maman » et porte le nom complet YOUSSAH NKOUADOU RIANATOU. L'export vidéo passe par MediaRecorder et ne fonctionne qu'une fois le site hébergé.
- **Photos** : sélection des meilleures parmi les nouvelles (p1 à p18).
- **Audio libre de droits** :
  - visite : Satie, Gymnopédie n° 1 (Teknopazzo, CC0) ;
  - finale : Haendel, Hallelujah (National Chorus of Korea, CC BY 3.0, Wikimedia).
- **Vérification** : Playwright 390×844, 0 erreur, luminance des stations entre 129 et 158, choix du pagne et 14 images du film contrôlés. Publié en version 6.

## Révision v17 : ruban 3D, finale enchaînée, film identique (28/10)
- **Besoin** : le ruban d'inauguration existe dans le musée (plus d'écran 2D) ; fin sans confusion (lettre → rideaux → nuit 3-2-1 → feux → rideaux → options) ; feux lisibles, sonores, derrière le bâtiment ; film = séquence complète.
- **Existant** : parcours par clés (`keys`, `progres`, `avancer`), arrêt bloquant déjà utilisé pour le pagne (`auto.attente`) ; rideaux `#s-cinema.ouvert` ; nuit `nuitDeFete` / `poseNuit` / `feux` ; film `imageFilm` / `filmer`.
- **Ruban, options** :

| Option | Pour | Contre |
|---|---|---|
| Ruban maillé déformé par sommets (tendu → pendant), pose fonction d'un seul paramètre `k` | déterministe, rejouable dans le film à l'identique, ~80 sommets | un peu de calcul par image |
| Physique (corde simulée) | réaliste | non déterministe, film différent, coût |
| Overlay 2D actuel | déjà fait | ne fait pas partie du monde, refusé |

- **Choix** : ruban maillé, ancré aux colonnes x ±1.9, z 1.7, y 1.45 (hauteur de coupe, plein cadre depuis la station « porte ») ; arrêt de la visite (guidée et défilement) à `kPorte.a`, la porte ne s'ouvre qu'après ; coupe par glisser à travers le ruban, toucher du ruban ou bouton ; les deux pans tombent le long des colonnes, le nœud tombe au sol. « Revoir » remet le ruban (séquence identique).
- **Fin** : rideaux fermés sur la lettre, rouverts sur la nuit avec 3-2-1 pendant la préparation ; feux clippés au-dessus du toit ; texte en Hanken Grotesk 800 échantillonné plus finement ; sons de feux en fichiers libres (licence Pixabay) au lieu de la synthèse.
- **Film** : rejoue `rendu` avec le ruban coupé à temps fixe, puis lettre, rideaux, nuit et feux composités sur le canvas du film ; durée et aide mises à jour.
- **Risques** : charge GPU des feux dans l'export ; poids des sons ajoutés ; iOS (volume en lecture seule).

## Points à trancher (utilisateur)
1. Les photos (une dizaine) et leurs légendes, salle par salle.
2. Les couleurs officielles du pagne Ngouon 2026 (photo ou nom des coloris) pour remplacer les 3 coloris provisoires.
3. La signature et la lettre.
4. Une musique, ou un message vocal à la place.
5. L'hébergement et la remise : lien, QR code, ou les deux.
