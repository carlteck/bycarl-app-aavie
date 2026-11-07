// Généré depuis le manuel et les dictionnaires versionnés du site AAVIE. Ne pas modifier à la main.
import type { LocaleCode } from '@/constants/locales';

export type GeneratedManualSection = { id: string; title: string; icon: string; articles: { id: string; title: string; summary: string; body: string }[] };

export const siteManual: Record<LocaleCode, GeneratedManualSection[]> = {
  "fr": [
    {
      "id": "10000000-0000-4000-8000-000000000001",
      "title": "Mon espace",
      "icon": "home-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "title": "Vous repérer dans votre espace",
          "summary": "La page d’accueil et le menu latéral sont organisés autour de ce que vous voulez faire, pas autour de la structure technique du site.",
          "body": "1. **Se faire aider** — l’assistant administratif, pour poser une question ou demander un courrier.\n\n2. **M’organiser** — le planificateur d’échéances, la gestion de budget et le coffre-fort.\n\n3. **M’informer** — la veille réglementaire, le centre de ressources et l’annuaire administratif, tenus à jour par l’équipe AAVIE.\n\n4. L’accueil affiche vos **actions restantes** — elles disparaissent une fois faites.\n\n> **Plusieurs langues** sont proposées depuis le menu. L’interface est traduite ; les textes juridiques et les contenus publiés par l’équipe (veille, ressources, annuaire) restent en français."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000002",
      "title": "Se faire aider",
      "icon": "chatbubbles-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000002",
          "title": "Demander de l’aide à l’assistant",
          "summary": "Une seule page pour poser une question administrative et obtenir un courrier rédigé — l’assistant s’adapte à votre demande plutôt que de vous imposer un formulaire.",
          "body": "1. Écrivez votre question, ou utilisez le micro pour la dicter — utile si l’écrit est difficile pour vous.\n\n2. Une fourchette de crédits s’affiche **avant** l’envoi : vous savez ce que la réponse va coûter, jamais après coup.\n\n3. La réponse arrive en langage courant. Vous pouvez la faire lire à voix haute.\n\n4. Pour un courrier, demandez-le directement : « rédige une lettre pour… ». L’assistant vous demande les éléments nécessaires au fil de la conversation.\n\n5. Sous chaque réponse : copier, télécharger et imprimer sont gratuits. **Enregistrer dans mon coffre-fort** a un prix affiché sur le bouton lui-même.\n\n6. Si l’assistant propose d’ajouter une échéance ou une dépense, il vous demande toujours confirmation avant de l’enregistrer réellement.\n\n> **La dictée vocale n’est pas locale** : votre navigateur envoie l’audio à ses propres serveurs pour le transcrire. Évitez la dictée pour une information que vous ne voudriez pas prononcer à voix haute."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000003",
      "title": "M’organiser",
      "icon": "calendar-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000003",
          "title": "Ne rien oublier : le planificateur",
          "summary": "Une échéance ajoutée une fois génère ses rappels toute seule, jusqu’au jour même.",
          "body": "1. Créez une échéance avec un titre, une **date** et une **heure** — l’heure est nécessaire pour le rappel envoyé une heure avant.\n\n2. Vous recevez un e-mail à sept jours, trois jours, un jour, le jour même, puis une heure avant l’échéance.\n\n3. Pour la voir dans votre calendrier habituel, ouvrez « Ajouter à mon calendrier » et choisissez le lien adapté à votre appareil.\n\n4. Un abonnement se fait une seule fois : les échéances ajoutées ensuite apparaissent automatiquement."
        },
        {
          "id": "20000000-0000-4000-8000-000000000004",
          "title": "Suivre votre budget",
          "summary": "Un usage entièrement gratuit, indépendant de votre forfait.",
          "body": "1. Ajoutez une transaction avec son montant et sa date.\n\n2. Classez-la dans une catégorie (logement, alimentation, salaire…) pour la retrouver facilement.\n\n3. La vue d’ensemble reflète immédiatement vos transactions les plus récentes."
        },
        {
          "id": "20000000-0000-4000-8000-000000000005",
          "title": "Le coffre-fort de documents",
          "summary": "Vos documents restent dans votre cloud personnel — AAVIE n’en garde jamais de copie sur ses propres serveurs.",
          "body": "1. Au premier accès, choisissez Google Drive ou OneDrive et autorisez la connexion — une seule fois.\n\n2. Les documents que vous déposez (depuis le coffre-fort ou l’assistant) sont écrits directement dans votre propre espace cloud, et vous pouvez les ranger dans des dossiers.\n\n3. Si un document porte une date d’expiration, AAVIE peut ajouter deux échéances au planificateur : un rappel deux mois avant, puis le jour de l’expiration.\n\n4. Le bouton « Scanner avec l’assistant IA » propose un nom, une catégorie et une date d’expiration : vous corrigez avant d’enregistrer."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000004",
      "title": "Mon compte",
      "icon": "person-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000006",
          "title": "Votre forfait, vos crédits, vos données",
          "summary": "Ce que vous payez (ou non), ce que vous consommez, et ce que vous pouvez faire de vos informations personnelles.",
          "body": "1. Votre solde de crédits se reporte d’un mois sur l’autre, dans la limite prévue par votre forfait — il ne repart jamais de zéro à minuit.\n\n2. Seules deux actions consomment des crédits : poser une question à l’assistant et déposer un document au coffre-fort. Tout le reste — planificateur, budget, annuaire, ressources — est gratuit.\n\n3. Changez de forfait depuis « Mon forfait » ; un forfait payant passe par un paiement sécurisé, jamais géré directement par AAVIE.\n\n4. Depuis « Mes données », consultez ou retirez vos consentements, téléchargez un export de vos données, ou déposez une demande de suppression de compte."
        },
        {
          "id": "20000000-0000-4000-8000-000000000008",
          "title": "Tenir votre profil et vos préférences à jour",
          "summary": "Vos coordonnées, votre fuseau horaire et vos choix de confidentialité influencent directement la qualité des rappels et du service.",
          "body": "1. Vérifiez votre nom, vos coordonnées et votre type de compte depuis « Mon compte ».\n\n2. Choisissez le bon fuseau horaire pour recevoir les rappels au moment attendu.\n\n3. Consultez la page « Mes données » pour gérer vos consentements et télécharger vos données.\n\n4. Utilisez la demande de suppression si vous souhaitez fermer définitivement votre compte."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000005",
      "title": "M’informer",
      "icon": "book-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000007",
          "title": "Trouver une information fiable",
          "summary": "Trois espaces complémentaires vous permettent de suivre les changements, comprendre une démarche et trouver le bon interlocuteur.",
          "body": "1. Consultez la veille pour connaître les évolutions administratives récentes.\n\n2. Ouvrez le centre de ressources pour parcourir les guides et fiches pratiques.\n\n3. Utilisez l’annuaire pour retrouver les coordonnées de l’organisme compétent.\n\n4. Pour une situation personnelle, demandez ensuite à l’assistant de vous aider à préparer votre démarche."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000006",
      "title": "Besoin d’aide",
      "icon": "help-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000009",
          "title": "Résoudre les problèmes les plus fréquents",
          "summary": "Avant de recommencer une action, quelques vérifications simples permettent de résoudre la majorité des blocages.",
          "body": "1. Crédits insuffisants : consultez votre solde et votre forfait avant de renvoyer la demande.\n\n2. E-mail absent : vérifiez les courriers indésirables et l’adresse enregistrée dans votre compte.\n\n3. Mot de passe oublié : utilisez le lien de réinitialisation depuis la page de connexion ; le lien reçu expire après une heure.\n\n4. Coffre-fort inaccessible : reconnectez Google Drive ou OneDrive depuis le coffre, sans transmettre vos identifiants à AAVIE.\n\n5. Affichage périmé : revenez sur l’onglet ou actualisez la page ; les droits réels restent toujours contrôlés par le serveur.\n\n> L’assistant facilite vos démarches mais ne remplace pas une décision officielle ni un conseil juridique personnalisé."
        }
      ]
    }
  ],
  "en": [
    {
      "id": "10000000-0000-4000-8000-000000000001",
      "title": "My space",
      "icon": "home-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "title": "Find your way around your space",
          "summary": "The home page and the side menu are organised around what you want to do, not around the technical structure of the site.",
          "body": "1. **Get help** — the administrative assistant, to ask a question or request a letter.\n\n2. **Get organised** — the deadline planner, budget management and the vault.\n\n3. **Stay informed** — the regulatory watch, the resource centre and the administrative directory, kept up to date by the AAVIE team.\n\n4. The home page shows your **remaining actions** — they disappear once done.\n\n> **Several languages** are available from the menu. The interface is translated; legal texts and content published by the team (watch, resources, directory) remain in French."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000002",
      "title": "Get help",
      "icon": "chatbubbles-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000002",
          "title": "Ask the assistant for help",
          "summary": "One page to ask an administrative question and get a letter drafted — the assistant adapts to your request rather than imposing a form.",
          "body": "1. Write your question, or use the microphone to dictate it — useful if writing is difficult for you.\n\n2. A range of credits is shown **before** sending: you know what the answer will cost, never after the fact.\n\n3. The answer comes in plain language. You can have it read aloud.\n\n4. For a letter, just ask: \"write a letter for…\". The assistant asks you for the necessary details as the conversation goes on.\n\n5. Under each answer: copying, downloading and printing are free. **Save to my vault** has a price shown on the button itself.\n\n6. If the assistant offers to add a deadline or an expense, it always asks for your confirmation before actually saving it.\n\n> **Voice dictation is not local**: your browser sends the audio to its own servers to transcribe it. Avoid dictation for information you would not want to say out loud."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000003",
      "title": "Get organised",
      "icon": "calendar-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000003",
          "title": "Never forget anything: the planner",
          "summary": "A deadline added once generates its reminders on its own, right up to the day itself.",
          "body": "1. Create a deadline with a title, a **date** and a **time** — the time is needed for the reminder sent one hour before.\n\n2. You receive an e-mail seven days, three days, one day before, on the day itself, then one hour before the deadline.\n\n3. To see it in your usual calendar, open \"Add to my calendar\" and choose the link suited to your device.\n\n4. You subscribe only once: deadlines added afterwards appear automatically."
        },
        {
          "id": "20000000-0000-4000-8000-000000000004",
          "title": "Track your budget",
          "summary": "Completely free to use, independent of your plan.",
          "body": "1. Add a transaction with its amount and date.\n\n2. File it under a category (housing, food, salary…) to find it easily.\n\n3. The overview immediately reflects your most recent transactions."
        },
        {
          "id": "20000000-0000-4000-8000-000000000005",
          "title": "The document vault",
          "summary": "Your documents stay in your personal cloud — AAVIE never keeps a copy on its own servers.",
          "body": "1. On first access, choose Google Drive or OneDrive and authorise the connection — just once.\n\n2. The documents you upload (from the vault or the assistant) are written directly to your own cloud space, and you can file them in folders.\n\n3. If a document has an expiry date, AAVIE can add two deadlines to the planner: a reminder two months before, then on the expiry day.\n\n4. The \"Scan with the AI assistant\" button suggests a name, a category and an expiry date: you correct them before saving."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000004",
      "title": "My account",
      "icon": "person-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000006",
          "title": "Your plan, your credits, your data",
          "summary": "What you pay (or not), what you use, and what you can do with your personal information.",
          "body": "1. Your credit balance carries over from one month to the next, within the limit set by your plan — it never resets to zero at midnight.\n\n2. Only two actions use credits: asking the assistant a question and saving a document to the vault. Everything else — planner, budget, directory, resources — is free.\n\n3. Change plan from \"My plan\"; a paid plan goes through secure payment, never handled directly by AAVIE.\n\n4. From \"My data\", view or withdraw your consents, download an export of your data, or submit an account deletion request."
        },
        {
          "id": "20000000-0000-4000-8000-000000000008",
          "title": "Keep your profile and preferences up to date",
          "summary": "Your contact details, time zone and privacy choices directly affect the quality of reminders and of the service.",
          "body": "1. Check your name, contact details and account type from \"My account\".\n\n2. Choose the right time zone to receive reminders at the expected time.\n\n3. Visit the \"My data\" page to manage your consents and download your data.\n\n4. Use the deletion request if you want to close your account permanently."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000005",
      "title": "Stay informed",
      "icon": "book-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000007",
          "title": "Find reliable information",
          "summary": "Three complementary spaces let you follow changes, understand a procedure and find the right contact.",
          "body": "1. Check the watch to learn about recent administrative changes.\n\n2. Open the resource centre to browse the guides and practical sheets.\n\n3. Use the directory to find the contact details of the competent organisation.\n\n4. For a personal situation, then ask the assistant to help you prepare your procedure."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000006",
      "title": "Need help",
      "icon": "help-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000009",
          "title": "Solve the most common problems",
          "summary": "Before repeating an action, a few simple checks solve most blockages.",
          "body": "1. Not enough credits: check your balance and your plan before sending the request again.\n\n2. E-mail missing: check your spam folder and the address saved in your account.\n\n3. Forgotten password: use the reset link from the sign-in page; the link you receive expires after one hour.\n\n4. Vault not accessible: reconnect Google Drive or OneDrive from the vault, without giving your credentials to AAVIE.\n\n5. Outdated display: return to the tab or refresh the page; your actual rights are always checked by the server.\n\n> The assistant makes your procedures easier but does not replace an official decision or personalised legal advice."
        }
      ]
    }
  ],
  "es": [
    {
      "id": "10000000-0000-4000-8000-000000000001",
      "title": "Mi espacio",
      "icon": "home-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "title": "Orientarse en su espacio",
          "summary": "La página de inicio y el menú lateral se organizan en torno a lo que quiere hacer, no en torno a la estructura técnica del sitio.",
          "body": "1. **Recibir ayuda** — el asistente administrativo, para hacer una pregunta o pedir una carta.\n\n2. **Organizarme** — el planificador de vencimientos, la gestión del presupuesto y la caja fuerte.\n\n3. **Informarme** — la vigilancia normativa, el centro de recursos y el directorio administrativo, actualizados por el equipo de AAVIE.\n\n4. El inicio muestra sus **acciones pendientes**: desaparecen una vez hechas.\n\n> **Hay varios idiomas** disponibles en el menú. La interfaz está traducida; los textos legales y los contenidos publicados por el equipo (vigilancia, recursos, directorio) siguen en francés."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000002",
      "title": "Recibir ayuda",
      "icon": "chatbubbles-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000002",
          "title": "Pedir ayuda al asistente",
          "summary": "Una sola página para hacer una pregunta administrativa y obtener una carta redactada: el asistente se adapta a su solicitud en lugar de imponerle un formulario.",
          "body": "1. Escriba su pregunta o use el micrófono para dictarla: útil si escribir le resulta difícil.\n\n2. Se muestra una horquilla de créditos **antes** del envío: usted sabe lo que costará la respuesta, nunca después.\n\n3. La respuesta llega en lenguaje sencillo. Puede hacer que se lea en voz alta.\n\n4. Para una carta, pídala directamente: «redacta una carta para…». El asistente le pide los datos necesarios a lo largo de la conversación.\n\n5. Bajo cada respuesta: copiar, descargar e imprimir son gratuitos. **Guardar en mi caja fuerte** tiene un precio indicado en el propio botón.\n\n6. Si el asistente propone añadir un vencimiento o un gasto, siempre le pide confirmación antes de registrarlo realmente.\n\n> **El dictado por voz no es local**: su navegador envía el audio a sus propios servidores para transcribirlo. Evite el dictado para información que no le gustaría decir en voz alta."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000003",
      "title": "Organizarme",
      "icon": "calendar-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000003",
          "title": "No olvidar nada: el planificador",
          "summary": "Un vencimiento añadido una vez genera sus recordatorios solo, hasta el mismo día.",
          "body": "1. Cree un vencimiento con un título, una **fecha** y una **hora**: la hora es necesaria para el recordatorio enviado una hora antes.\n\n2. Recibe un correo a siete días, tres días, un día, el mismo día y una hora antes del vencimiento.\n\n3. Para verlo en su calendario habitual, abra «Añadir a mi calendario» y elija el enlace adecuado a su dispositivo.\n\n4. La suscripción se hace una sola vez: los vencimientos añadidos después aparecen automáticamente."
        },
        {
          "id": "20000000-0000-4000-8000-000000000004",
          "title": "Seguir su presupuesto",
          "summary": "Un uso totalmente gratuito, independiente de su plan.",
          "body": "1. Añada una operación con su importe y su fecha.\n\n2. Clasifíquela en una categoría (vivienda, alimentación, salario…) para encontrarla fácilmente.\n\n3. La vista general refleja de inmediato sus operaciones más recientes."
        },
        {
          "id": "20000000-0000-4000-8000-000000000005",
          "title": "La caja fuerte de documentos",
          "summary": "Sus documentos permanecen en su nube personal: AAVIE nunca guarda una copia en sus propios servidores.",
          "body": "1. En el primer acceso, elija Google Drive u OneDrive y autorice la conexión, solo una vez.\n\n2. Los documentos que deposita (desde la caja fuerte o el asistente) se escriben directamente en su propio espacio en la nube, y puede organizarlos en carpetas.\n\n3. Si un documento tiene fecha de caducidad, AAVIE puede añadir dos vencimientos al planificador: un recordatorio dos meses antes y otro el día de la caducidad.\n\n4. El botón «Escanear con el asistente de IA» propone un nombre, una categoría y una fecha de caducidad: usted los corrige antes de guardar."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000004",
      "title": "Mi cuenta",
      "icon": "person-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000006",
          "title": "Su plan, sus créditos, sus datos",
          "summary": "Lo que paga (o no), lo que consume y lo que puede hacer con su información personal.",
          "body": "1. Su saldo de créditos se traspasa de un mes a otro, dentro del límite previsto por su plan: nunca vuelve a cero a medianoche.\n\n2. Solo dos acciones consumen créditos: hacer una pregunta al asistente y guardar un documento en la caja fuerte. Todo lo demás —planificador, presupuesto, directorio, recursos— es gratuito.\n\n3. Cambie de plan desde «Mi plan»; un plan de pago pasa por un pago seguro, nunca gestionado directamente por AAVIE.\n\n4. Desde «Mis datos», consulte o retire sus consentimientos, descargue una exportación de sus datos o presente una solicitud de eliminación de cuenta."
        },
        {
          "id": "20000000-0000-4000-8000-000000000008",
          "title": "Mantener actualizados su perfil y sus preferencias",
          "summary": "Sus datos de contacto, su zona horaria y sus opciones de privacidad influyen directamente en la calidad de los recordatorios y del servicio.",
          "body": "1. Compruebe su nombre, sus datos de contacto y su tipo de cuenta desde «Mi cuenta».\n\n2. Elija la zona horaria correcta para recibir los recordatorios en el momento previsto.\n\n3. Visite la página «Mis datos» para gestionar sus consentimientos y descargar sus datos.\n\n4. Utilice la solicitud de eliminación si desea cerrar definitivamente su cuenta."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000005",
      "title": "Informarme",
      "icon": "book-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000007",
          "title": "Encontrar información fiable",
          "summary": "Tres espacios complementarios le permiten seguir los cambios, comprender un trámite y encontrar al interlocutor adecuado.",
          "body": "1. Consulte la vigilancia para conocer las novedades administrativas recientes.\n\n2. Abra el centro de recursos para explorar las guías y fichas prácticas.\n\n3. Utilice el directorio para encontrar los datos de contacto del organismo competente.\n\n4. Para una situación personal, pida después al asistente que le ayude a preparar su trámite."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000006",
      "title": "¿Necesita ayuda?",
      "icon": "help-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000009",
          "title": "Resolver los problemas más frecuentes",
          "summary": "Antes de repetir una acción, unas comprobaciones sencillas resuelven la mayoría de los bloqueos.",
          "body": "1. Créditos insuficientes: consulte su saldo y su plan antes de volver a enviar la solicitud.\n\n2. Correo ausente: revise la carpeta de spam y la dirección registrada en su cuenta.\n\n3. Contraseña olvidada: utilice el enlace de restablecimiento desde la página de inicio de sesión; el enlace recibido caduca a la hora.\n\n4. Caja fuerte inaccesible: vuelva a conectar Google Drive u OneDrive desde la caja fuerte, sin dar sus credenciales a AAVIE.\n\n5. Pantalla desactualizada: vuelva a la pestaña o actualice la página; los derechos reales siempre los controla el servidor.\n\n> El asistente facilita sus trámites, pero no sustituye una decisión oficial ni un asesoramiento jurídico personalizado."
        }
      ]
    }
  ],
  "pt": [
    {
      "id": "10000000-0000-4000-8000-000000000001",
      "title": "O meu espaço",
      "icon": "home-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "title": "Orientar-se no seu espaço",
          "summary": "A página inicial e o menu lateral organizam-se em torno do que pretende fazer, não em torno da estrutura técnica do site.",
          "body": "1. **Obter ajuda** — o assistente administrativo, para fazer uma pergunta ou pedir uma carta.\n\n2. **Organizar-me** — o planeador de prazos, a gestão do orçamento e o cofre.\n\n3. **Informar-me** — a vigilância regulamentar, o centro de recursos e o diretório administrativo, mantidos atualizados pela equipa da AAVIE.\n\n4. O início mostra as suas **ações restantes** — desaparecem depois de feitas.\n\n> **Estão disponíveis vários idiomas** no menu. A interface está traduzida; os textos jurídicos e os conteúdos publicados pela equipa (vigilância, recursos, diretório) permanecem em francês."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000002",
      "title": "Obter ajuda",
      "icon": "chatbubbles-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000002",
          "title": "Pedir ajuda ao assistente",
          "summary": "Uma só página para fazer uma pergunta administrativa e obter uma carta redigida — o assistente adapta-se ao seu pedido em vez de lhe impor um formulário.",
          "body": "1. Escreva a sua pergunta ou use o microfone para a ditar — útil se escrever for difícil para si.\n\n2. É apresentado um intervalo de créditos **antes** do envio: sabe quanto vai custar a resposta, nunca depois.\n\n3. A resposta chega em linguagem simples. Pode pedir que seja lida em voz alta.\n\n4. Para uma carta, peça-a diretamente: «redige uma carta para…». O assistente pede-lhe os elementos necessários ao longo da conversa.\n\n5. Por baixo de cada resposta: copiar, transferir e imprimir são gratuitos. **Guardar no meu cofre** tem um preço indicado no próprio botão.\n\n6. Se o assistente propuser adicionar um prazo ou uma despesa, pede sempre a sua confirmação antes de o registar realmente.\n\n> **O ditado por voz não é local**: o seu navegador envia o áudio para os seus próprios servidores para o transcrever. Evite o ditado para informação que não gostaria de dizer em voz alta."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000003",
      "title": "Organizar-me",
      "icon": "calendar-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000003",
          "title": "Não esquecer nada: o planeador",
          "summary": "Um prazo adicionado uma vez gera os seus lembretes sozinho, até ao próprio dia.",
          "body": "1. Crie um prazo com um título, uma **data** e uma **hora** — a hora é necessária para o lembrete enviado uma hora antes.\n\n2. Recebe um e-mail a sete dias, três dias, um dia, no próprio dia e uma hora antes do prazo.\n\n3. Para o ver no seu calendário habitual, abra «Adicionar ao meu calendário» e escolha a ligação adequada ao seu dispositivo.\n\n4. A subscrição faz-se uma só vez: os prazos adicionados depois aparecem automaticamente."
        },
        {
          "id": "20000000-0000-4000-8000-000000000004",
          "title": "Acompanhar o seu orçamento",
          "summary": "Uma utilização totalmente gratuita, independente do seu plano.",
          "body": "1. Adicione uma operação com o seu valor e a sua data.\n\n2. Classifique-a numa categoria (habitação, alimentação, salário…) para a encontrar facilmente.\n\n3. A visão geral reflete imediatamente as suas operações mais recentes."
        },
        {
          "id": "20000000-0000-4000-8000-000000000005",
          "title": "O cofre de documentos",
          "summary": "Os seus documentos ficam na sua cloud pessoal — a AAVIE nunca guarda uma cópia nos seus próprios servidores.",
          "body": "1. No primeiro acesso, escolha o Google Drive ou o OneDrive e autorize a ligação — uma só vez.\n\n2. Os documentos que deposita (a partir do cofre ou do assistente) são escritos diretamente no seu próprio espaço cloud, e pode organizá-los em pastas.\n\n3. Se um documento tiver data de validade, a AAVIE pode adicionar dois prazos ao planeador: um lembrete dois meses antes e outro no dia da validade.\n\n4. O botão «Analisar com o assistente de IA» sugere um nome, uma categoria e uma data de validade: corrige antes de guardar."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000004",
      "title": "A minha conta",
      "icon": "person-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000006",
          "title": "O seu plano, os seus créditos, os seus dados",
          "summary": "O que paga (ou não), o que consome e o que pode fazer com as suas informações pessoais.",
          "body": "1. O seu saldo de créditos transita de um mês para o outro, dentro do limite previsto pelo seu plano — nunca volta a zero à meia-noite.\n\n2. Apenas duas ações consomem créditos: fazer uma pergunta ao assistente e guardar um documento no cofre. Tudo o resto — planeador, orçamento, diretório, recursos — é gratuito.\n\n3. Mude de plano em «O meu plano»; um plano pago passa por um pagamento seguro, nunca gerido diretamente pela AAVIE.\n\n4. Em «Os meus dados», consulte ou retire os seus consentimentos, transfira uma exportação dos seus dados ou apresente um pedido de eliminação da conta."
        },
        {
          "id": "20000000-0000-4000-8000-000000000008",
          "title": "Manter o seu perfil e as suas preferências atualizados",
          "summary": "Os seus contactos, o seu fuso horário e as suas escolhas de privacidade influenciam diretamente a qualidade dos lembretes e do serviço.",
          "body": "1. Verifique o seu nome, os seus contactos e o seu tipo de conta em «A minha conta».\n\n2. Escolha o fuso horário correto para receber os lembretes no momento esperado.\n\n3. Visite a página «Os meus dados» para gerir os seus consentimentos e transferir os seus dados.\n\n4. Utilize o pedido de eliminação se pretender encerrar definitivamente a sua conta."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000005",
      "title": "Informar-me",
      "icon": "book-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000007",
          "title": "Encontrar informação fiável",
          "summary": "Três espaços complementares permitem-lhe acompanhar as alterações, compreender um procedimento e encontrar o interlocutor certo.",
          "body": "1. Consulte a vigilância para conhecer as alterações administrativas recentes.\n\n2. Abra o centro de recursos para consultar os guias e fichas práticas.\n\n3. Utilize o diretório para encontrar os contactos do organismo competente.\n\n4. Para uma situação pessoal, peça depois ao assistente que o ajude a preparar o seu procedimento."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000006",
      "title": "Precisa de ajuda",
      "icon": "help-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000009",
          "title": "Resolver os problemas mais frequentes",
          "summary": "Antes de repetir uma ação, algumas verificações simples resolvem a maioria dos bloqueios.",
          "body": "1. Créditos insuficientes: consulte o seu saldo e o seu plano antes de reenviar o pedido.\n\n2. E-mail em falta: verifique a pasta de spam e o endereço registado na sua conta.\n\n3. Palavra-passe esquecida: utilize a ligação de reposição na página de início de sessão; a ligação recebida expira ao fim de uma hora.\n\n4. Cofre inacessível: volte a ligar o Google Drive ou o OneDrive a partir do cofre, sem fornecer as suas credenciais à AAVIE.\n\n5. Ecrã desatualizado: volte ao separador ou atualize a página; os direitos reais são sempre controlados pelo servidor.\n\n> O assistente facilita os seus procedimentos, mas não substitui uma decisão oficial nem aconselhamento jurídico personalizado."
        }
      ]
    }
  ],
  "ht": [
    {
      "id": "10000000-0000-4000-8000-000000000001",
      "title": "Espas mwen",
      "icon": "home-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000001",
          "title": "Oryante w nan espas ou a",
          "summary": "Paj akèy la ak meni bò a òganize alantou sa ou vle fè, pa alantou estrikti teknik sit la.",
          "body": "1. **Jwenn èd** — asistan administratif la, pou poze yon kesyon oswa mande yon lèt.\n\n2. **Òganize m** — planifikatè dat limit, jesyon bidjè ak kòf fò a.\n\n3. **Enfòme m** — veyi regleman, sant resous ak anyè administratif la, ekip AAVIE a ap kenbe yo ajou.\n\n4. Akèy la montre **aksyon ki rete** yo — yo disparèt lè yo fèt.\n\n> **Gen plizyè lang** nan meni an. Entèfas la tradui ; tèks legal yo ak kontni ekip la pibliye yo (veyi, resous, anyè) rete an fransè."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000002",
      "title": "Jwenn èd",
      "icon": "chatbubbles-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000002",
          "title": "Mande asistan an èd",
          "summary": "Yon sèl paj pou poze yon kesyon administratif epi jwenn yon lèt ekri — asistan an adapte l ak demann ou olye l enpoze w yon fòmilè.",
          "body": "1. Ekri kesyon ou, oswa itilize mikwo a pou pale l — itil si ekri difisil pou ou.\n\n2. Yon entèval kredi parèt **anvan** w voye a : ou konnen konbyen repons lan pral koute, jamè apre.\n\n3. Repons lan vini nan lang senp. Ou ka fè l li byen fò.\n\n4. Pou yon lèt, mande l dirèkteman : « ekri yon lèt pou… ». Asistan an mande w eleman ki nesesè yo pandan konvèsasyon an.\n\n5. Anba chak repons : kopye, telechaje ak enprime gratis. **Anrejistre nan kòf fò mwen** gen yon pri ki make sou bouton an menm.\n\n6. Si asistan an pwopoze ajoute yon dat limit oswa yon depans, li toujou mande konfimasyon ou anvan l anrejistre l vre.\n\n> **Diktasyon vokal la pa lokal** : navigatè ou voye son an sou pwòp sèvè li pou transkri l. Evite diktasyon pou yon enfòmasyon ou pa t vle di byen fò."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000003",
      "title": "Òganize m",
      "icon": "calendar-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000003",
          "title": "Pa bliye anyen : planifikatè a",
          "summary": "Yon dat limit ou ajoute yon sèl fwa jenere rapèl li yo poukont li, jiska jou a menm.",
          "body": "1. Kreye yon dat limit ak yon tit, yon **dat** ak yon **lè** — lè a nesesè pou rapèl yo voye yon è avan an.\n\n2. Ou resevwa yon imèl sèt jou, twa jou, yon jou, menm jou a, epi yon è avan dat limit la.\n\n3. Pou wè l nan kalandriye ou abitye itilize a, louvri « Ajoute nan kalandriye mwen » epi chwazi lyen ki bon pou aparèy ou.\n\n4. Ou abòne yon sèl fwa : dat limit ou ajoute apre yo parèt otomatikman."
        },
        {
          "id": "20000000-0000-4000-8000-000000000004",
          "title": "Swiv bidjè ou",
          "summary": "Yon itilizasyon ki gratis nèt, endepandan de fòfè ou.",
          "body": "1. Ajoute yon tranzaksyon ak montan li ak dat li.\n\n2. Klase l nan yon kategori (lojman, manje, salè…) pou jwenn li fasilman.\n\n3. Vi jeneral la montre tranzaksyon ki pi resan ou yo imedyatman."
        },
        {
          "id": "20000000-0000-4000-8000-000000000005",
          "title": "Kòf fò dokiman yo",
          "summary": "Dokiman ou yo rete nan nwaj pèsonèl ou — AAVIE pa janm kenbe yon kopi sou pwòp sèvè li yo.",
          "body": "1. Premye fwa ou antre, chwazi Google Drive oswa OneDrive epi otorize koneksyon an — yon sèl fwa.\n\n2. Dokiman ou depoze yo (depi kòf fò a oswa asistan an) ekri dirèkteman nan pwòp espas nwaj ou, epi ou ka ranje yo nan katab.\n\n3. Si yon dokiman gen yon dat ekspirasyon, AAVIE ka ajoute de dat limit nan planifikatè a : yon rapèl de mwa avan, epi jou ekspirasyon an.\n\n4. Bouton « Eskane ak asistan IA a » pwopoze yon non, yon kategori ak yon dat ekspirasyon : ou korije yo anvan w anrejistre."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000004",
      "title": "Kont mwen",
      "icon": "person-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000006",
          "title": "Fòfè ou, kredi ou, done ou",
          "summary": "Sa ou peye (oswa non), sa ou konsome, ak sa ou ka fè ak enfòmasyon pèsonèl ou yo.",
          "body": "1. Balans kredi ou pote ale ak yon mwa pou lòt, nan limit fòfè ou pèmèt la — li pa janm tounen zewo a minwi.\n\n2. Sèlman de aksyon konsome kredi : poze yon kesyon bay asistan an ak depoze yon dokiman nan kòf fò a. Tout rès la — planifikatè, bidjè, anyè, resous — gratis.\n\n3. Chanje fòfè depi « Fòfè mwen » ; yon fòfè ki peye pase nan yon peman sekirize, AAVIE pa janm jere l dirèkteman.\n\n4. Depi « Done mwen yo », gade oswa retire konsantman ou yo, telechaje yon ekspòtasyon done ou yo, oswa fè yon demann pou efase kont lan."
        },
        {
          "id": "20000000-0000-4000-8000-000000000008",
          "title": "Kenbe pwofil ou ak preferans ou ajou",
          "summary": "Kowòdone ou, fizo orè ou ak chwa konfidansyalite ou yo gen yon enfliyans dirèk sou kalite rapèl yo ak sèvis la.",
          "body": "1. Verifye non ou, kowòdone ou ak tip kont ou depi « Kont mwen ».\n\n2. Chwazi bon fizo orè a pou resevwa rapèl yo lè w atann yo.\n\n3. Vizite paj « Done mwen yo » pou jere konsantman ou yo epi telechaje done ou yo.\n\n4. Itilize demann efasman an si ou vle fèmen kont ou pou tout bon."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000005",
      "title": "Enfòme m",
      "icon": "book-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000007",
          "title": "Jwenn yon enfòmasyon serye",
          "summary": "Twa espas konplemantè pèmèt ou swiv chanjman yo, konprann yon demach epi jwenn bon entèlokitè a.",
          "body": "1. Gade veyi a pou konnen chanjman administratif resan yo.\n\n2. Louvri sant resous la pou pasyonnen gid ak fich pratik yo.\n\n3. Itilize anyè a pou jwenn kowòdone òganis ki konpetan an.\n\n4. Pou yon sitiyasyon pèsonèl, apre sa mande asistan an ede w prepare demach ou."
        }
      ]
    },
    {
      "id": "10000000-0000-4000-8000-000000000006",
      "title": "Bezwen èd",
      "icon": "help-circle-outline",
      "articles": [
        {
          "id": "20000000-0000-4000-8000-000000000009",
          "title": "Rezoud pwoblèm ki pi komen yo",
          "summary": "Anvan w rekòmanse yon aksyon, kèk verifikasyon senp rezoud pi fò blokaj yo.",
          "body": "1. Kredi pa ase : gade balans ou ak fòfè ou anvan w revoye demann nan.\n\n2. Imèl pa rive : gade nan kourye endezirab yo ak adrès ki anrejistre nan kont ou.\n\n3. Modpas bliye : itilize lyen reyinisyalizasyon an sou paj koneksyon an ; lyen ou resevwa a ekspire apre inèdtan.\n\n4. Kòf fò pa aksesib : rekonekte Google Drive oswa OneDrive depi kòf fò a, san ba AAVIE idantifyan ou yo.\n\n5. Ekran ki pa ajou : retounen sou onglè a oswa aktyalize paj la ; se sèvè a ki toujou kontwole dwa reyèl yo.\n\n> Asistan an fasilite demach ou yo men li pa ranplase yon desizyon ofisyèl ni yon konsèy jiridik pèsonalize."
        }
      ]
    }
  ]
};
