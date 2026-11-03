/**
 * Public-domain portraits shown behind the Composers page header: women and Black composers from the catalogue.
 * Each file in /public/assets/portraits is a 240px-wide copy of the Wikimedia Commons image in `source`, where
 * Commons lists it as public domain. The order mixes eras and backgrounds so neighbours look different.
 * `focus` is the CSS object-position for portraits whose face sits high in a full-length picture.
 */
export interface ComposerPortrait {
  slug: string;
  name: string;
  source: string;
  focus?: string;
}

export const COMPOSER_PORTRAITS: ComposerPortrait[] = [
  { slug: 'florence-price', name: 'Florence Price', source: 'https://commons.wikimedia.org/wiki/File:Composer_Florence_Price_(cropped).jpg' },
  { slug: 'fanny-mendelssohn', name: 'Fanny Mendelssohn', source: 'https://commons.wikimedia.org/wiki/File:Fanny_Hensel_1842.jpg' },
  { slug: 'samuel-coleridge-taylor', name: 'Samuel Coleridge-Taylor', source: 'https://commons.wikimedia.org/wiki/File:Samuel_Coleridge-Taylor.jpg' },
  { slug: 'lili-boulanger', name: 'Lili Boulanger', source: 'https://commons.wikimedia.org/wiki/File:Lili_Boulanger_par_Henri_Manuel.jpg' },
  { slug: 'chiquinha-gonzaga', name: 'Chiquinha Gonzaga', source: 'https://commons.wikimedia.org/wiki/File:Chiquinhagonzaga4.jpg' },
  { slug: 'ethel-smyth', name: 'Ethel Smyth', source: 'https://commons.wikimedia.org/wiki/File:Ethel_Smyth.jpg' },
  { slug: 'scott-joplin', name: 'Scott Joplin', source: 'https://commons.wikimedia.org/wiki/File:Scott_Joplin_in_1912.jpg' },
  { slug: 'maria-szymanowska', name: 'Maria Szymanowska', source: 'https://commons.wikimedia.org/wiki/File:Maria_Szymanowska.jpg' },
  { slug: 'margaret-bonds', name: 'Margaret Bonds', source: 'https://commons.wikimedia.org/wiki/File:Margaret_Bonds.jpg' },
  { slug: 'emilie-mayer', name: 'Emilie Mayer', source: 'https://commons.wikimedia.org/wiki/File:Emilie-mayer.jpg' },
  { slug: 'teresa-carreno', name: 'Teresa Carreño', source: 'https://commons.wikimedia.org/wiki/File:Teresa_Carre%C3%B1o,_1916.jpg' },
  { slug: 'amanda-aldridge', name: 'Amanda Aldridge', source: 'https://commons.wikimedia.org/wiki/File:Amanda_Ira_Aldrigde_The_A.M.E._church_review,_p._114,_October_1912_(cropped).jpg' },
  { slug: 'louise-farrenc', name: 'Louise Farrenc', source: 'https://commons.wikimedia.org/wiki/File:Louise_Farrenc_painting.jpg' },
  { slug: 'henriette-bosmans', name: 'Henriëtte Bosmans', source: 'https://commons.wikimedia.org/wiki/File:Photograph_of_Henri%C3%ABtte_Bosmans_by_Jacob_Merkelbach_(1917).jpg' },
  { slug: 'francis-johnson', name: 'Francis Johnson', source: 'https://commons.wikimedia.org/wiki/File:Frank_Johnson.jpg', focus: '50% 25%' },
  { slug: 'amy-beach', name: 'Amy Beach', source: 'https://commons.wikimedia.org/wiki/File:Amy_Beach_01.jpg' },
  { slug: 'vitezslava-kapralova', name: 'Vítězslava Kaprálová', source: 'https://commons.wikimedia.org/wiki/File:Kapralova1935.jpg' },
  { slug: 'william-grant-still', name: 'William Grant Still', source: 'https://commons.wikimedia.org/wiki/File:Maud_Cuney_Hare-William_Grant_Still_336.jpg' },
  { slug: 'augusta-holmes', name: 'Augusta Holmès', source: 'https://commons.wikimedia.org/wiki/File:Augusta_Holm%C3%A8s.jpg' },
  { slug: 'maria-theresia-von-paradis', name: 'Maria Theresia von Paradis', source: 'https://commons.wikimedia.org/wiki/File:F._Parmanti%C3%A9,_1784_-_Maria_Theresia_Paradis.jpg' },
  { slug: 'dora-pejacevic', name: 'Dora Pejačević', source: 'https://commons.wikimedia.org/wiki/File:Dora_Pejacevic.jpg', focus: '50% 15%' },
  { slug: 'mel-bonis', name: 'Mel Bonis', source: 'https://commons.wikimedia.org/wiki/File:Mel_Bonis_2.jpg' },
  { slug: 'luise-adolpha-le-beau', name: 'Luise Adolpha Le Beau', source: 'https://commons.wikimedia.org/wiki/File:Luise_Adolpha_Le_Beau_1872.jpg' },
  { slug: 'clemence-de-grandval', name: 'Clémence de Grandval', source: 'https://commons.wikimedia.org/wiki/File:Mme_de_Grandval.png' },
  { slug: 'laura-netzel', name: 'Laura Netzel', source: 'https://commons.wikimedia.org/wiki/File:Laura_Netzel.jpg' },
  { slug: 'marie-jaell', name: 'Marie Jaëll', source: 'https://commons.wikimedia.org/wiki/File:Marie_Jaell-Jeune_femme.jpg' },
  { slug: 'elfrida-andree', name: 'Elfrida Andrée', source: 'https://commons.wikimedia.org/wiki/File:Andr%C3%A9e,_Elfrida_i_VJ_6_1916.jpg', focus: '50% 8%' },
  { slug: 'ingeborg-von-bronsart', name: 'Ingeborg von Bronsart', source: 'https://commons.wikimedia.org/wiki/File:Ingeborg_Bronsart.jpg' },
];
