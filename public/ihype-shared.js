// ═══════════════════════════════════════════════════════════════════════
// iHYPE · shared interactions + i18n
// ═══════════════════════════════════════════════════════════════════════

(function(){

  // ─── i18n translation table ──────────────────────────────────────────
  // Keys match data-i18n attributes in the HTML.
  // Add new languages by adding a same-keyed block below.
  // Values are plain strings; use \n for line breaks where needed.

  var STRINGS = {

    en: {
      // Nav
      'nav.home':        'Home',
      'nav.hype':        'HYPE',
      'nav.discover':    'Discover',
      'nav.tickets':     'Tickets',
      'nav.signin':      'Sign in',
      'nav.join':        'Join free',
      'nav.a11y':        'Accessibility',
      'nav.charts':      'Charts',
      'nav.shows':       'Shows',
      'nav.promise':     'The Promise',
      'nav.myshows':     'My shows',
      'nav.create':      'Create',

      // Hero
      'hero.eyebrow':    'Not-for-profit · free forever · built for the scene',
      'hero.h1':         'Independent music, <em>hyped by the people who love it.</em>',
      'hero.lede':       'iHYPE is a free music platform owned by no one with a profit motive. Fans discover and champion artists. Artists get paid when their music sells tickets. The people who make the scene — not a corporation — decide what rises.',
      'hero.cta.join':   'Join free',
      'hero.cta.signin': 'Sign in',
      'hero.cta.note':   'Email or phone. Two fields. Done.',

      // Live strip
      'live.now':        'Right now',
      'live.listening':  'listening',
      'live.hype':       'HYPE given today',
      'live.dist':       'distributed to creators today',
      'live.us':         'to iHYPE',

      // What iHYPE is
      'what.eyebrow':    'What iHYPE is',
      'what.h2':         'One platform. Three rules.',
      'what.p1.num':     '$0',
      'what.p1.title':   'Free for everyone, forever.',
      'what.p1.desc':    'Listen, hype, attend, publish, sell tickets. No premium tier. No paywall. Same access day one until forever — whether you\'re a first-time fan or an artist on your fifth album.',
      'what.p2.num':     '45/45/10',
      'what.p2.title':   'Tickets pay the makers, not us.',
      'what.p2.desc':    'Every ticket splits direct: 45% to the artist, 45% to the venue, 10% to the promoter who brought the crowd. iHYPE takes nothing. Card processing and tax shown as separate line items.',
      'what.p3.num':     '100%',
      'what.p3.title':   'Music ads only. Nothing else.',
      'what.p3.desc':    'Funded by audio ads from artists, venues, promoters, and music shops. No sports betting. No crypto. No mortgage refinance. If it isn\'t music, it doesn\'t get in.',

      // Roles
      'roles.eyebrow':         'Who it\'s for',
      'roles.h2':              'One account. <em>Four roles.</em>',
      'roles.lede':            'Start as whichever fits today. Add more whenever — same account, no re-onboarding.',
      'roles.fan.name':        'Fan',
      'roles.fan.line':        'Listen, hype, attend. Build your taste profile. Show up for the scene you love. Your HYPE shapes the charts — not a label\'s budget.',
      'roles.fan.cta':         'Most people start here →',
      'roles.artist.name':     'Artist',
      'roles.artist.line':     'Publish songs, plan tours using HYPE heatmaps, get paid 45% of every ticket. No middleman. No service fee. Tour planner built in.',
      'roles.artist.cta':      'Tour planner included →',
      'roles.venue.name':      'Venue',
      'roles.venue.line':      'List shows, scan tickets at the door, see which local artists are gaining momentum before anyone else books them.',
      'roles.venue.cta':       'Booking radar included →',
      'roles.promoter.name':   'Promoter / DJ',
      'roles.promoter.line':   'Curate shows, run mixtapes, earn 10% on every ticket your recommendations drive. Show creator and affiliate dashboard included.',
      'roles.promoter.cta':    'Show creator included →',

      // Why share
      'share.eyebrow':   'Why share it',
      'share.h2':        'The scene only grows <em>if the people who love it say so.</em>',
      'share.p1':        'Every major streaming platform is optimized to make shareholders money. The result: the same 40 artists dominating every chart, regional scenes invisible, and ticket prices climbing because the people taking fees have no reason to stop. <strong>iHYPE only works if fans use it.</strong> The algorithm reads what\'s loved locally and surfaces it. The charts rank what\'s genuinely hyped — not what\'s paid to appear. If fans use it and share it, independent music gets louder. If only big labels know about it, it becomes another platform they can game.',
      'share.p2':        'This is the mechanism: <strong>your HYPE is a vote that doesn\'t expire instantly, doesn\'t disappear behind a paywall, and can\'t be bought.</strong> Share iHYPE with one person who loves music and you\'ve added one more uncorrupted voice to a system built around uncorrupted voices.',
      'share.fans.lbl':  'For fans',
      'share.fans.p':    'The music you love gets louder when you say so. <strong>Your HYPE shapes the charts</strong> that an artist\'s next booking agent, venue, or promoter will read.',
      'share.artists.lbl': 'For artists',
      'share.artists.p': 'Every new fan who joins is a potential ticket buyer and HYPE giver. <strong>The tour planner reads real HYPE concentration</strong> — more users means better signal for where to tour next.',
      'share.scene.lbl': 'For the scene',
      'share.scene.p':   'Local venues and promoters see HYPE momentum before the majors do. <strong>The first show</strong> a scene plays at a new city often builds a permanent fanbase there.',

      // Receipt section
      'receipt.eyebrow':       'Why it\'s the best · 01 of 05',
      'receipt.h2':            'You can read the receipt. <em>Every line.</em>',
      'receipt.lede':          'A real $45 ticket sale, fully itemized. No "service fee" burying a platform cut. The artist made the music, the venue holds the room, the promoter brought the crowd. They split it. We take nothing.',
      'receipt.ex1.h':         'The 45 / 45 / 10 split',
      'receipt.ex1.p':         '<strong>Artist 45%:</strong> they made the music. <strong>Venue 45%:</strong> they hold the room and run the door. <strong>Promoter 10%:</strong> they brought the audience via their recommendation. No promoter attached? The split rebalances 50/50 to artist and venue.',
      'receipt.ex2.h':         'Why card and tax are shown separately',
      'receipt.ex2.p':         'Most platforms blur Stripe fees and sales tax into a "service fee" that hides their own cut. We itemize them so you can verify — the card fee goes to Stripe, the tax goes to your state. Neither dollar touches iHYPE.',
      'receipt.ex3.h':         'Refunds keep the math intact',
      'receipt.ex3.p':         'If a show cancels, every recipient is debited proportionally — including the platform fee zero. No one keeps a cut they didn\'t earn.',
      'receipt.label.ticket':  'Ticket price',
      'receipt.label.goes':    'Where this goes',
      'receipt.label.pass':    'Pass-through (not ours)',
      'receipt.label.artist':  'Phantom Ridge · artist (45%)',
      'receipt.label.venue':   'State Theatre · venue (45%)',
      'receipt.label.promo':   'Disco Mortis · promoter (10%)',
      'receipt.label.fee':     'iHYPE platform fee',
      'receipt.label.card':    'Card processing · Stripe',
      'receipt.label.tax':     'Sales tax · ME 5.5%',
      'receipt.label.total':   'Total charged',
      'receipt.foot':          'Of every dollar you pay, <strong>$45 goes to the people who made this show.</strong>',

      // Comparison
      'compare.eyebrow':       'Why it\'s the best · 02 of 05',
      'compare.h2':            'What you\'d pay <em>elsewhere.</em>',
      'compare.lede':          'Live music ticketing is a $35-billion industry built on stacked fees. This is what a $45 ticket costs on the platforms that exist to extract value from the scene.',
      'compare.col.us':        'iHYPE.org',
      'compare.col.them':      'Typical ticketing platform',
      'compare.r1.crit':       'Service / convenience fee',
      'compare.r1.sm':         'Per ticket',
      'compare.r2.crit':       'Order processing fee',
      'compare.r2.sm':         'Per checkout',
      'compare.r3.crit':       'E-ticket / delivery fee',
      'compare.r3.sm':         'For a digital QR',
      'compare.r4.crit':       'Artist gets',
      'compare.r4.sm':         'After all fees, on a $45 ticket',
      'compare.r5.crit':       'User data resale',
      'compare.r5.sm':         'Selling listening data to brokers',
      'compare.r6.crit':       'Paid chart placement',
      'compare.r6.sm':         'Labels buying top positions',
      'compare.r5.us':         'Never',
      'compare.r5.them':       'Industry standard',
      'compare.r6.us':         'Forbidden',
      'compare.r6.them':       'Routine',

      // Pull quote
      'quote.text':      '"Hype the scene. <em>Not the next rich guy.</em>"',
      'quote.attr':      '— iHYPE charter · founding principle',

      // Pact
      'pact.eyebrow':    'Why it\'s the best · 03 of 05',
      'pact.h2':         'Eight things we will <em>never</em> do.',
      'pact.lede':       'Easier to commit to a list than a vague principle. If iHYPE ever does any of these, you should leave — and this list is baked into the charter that requires a board vote to change.',
      'pact.1.h':        'Charge a platform fee on tickets',
      'pact.1.p':        'The platform fee line is $0 forever. Not "introductory." Not "during high demand." Zero.',
      'pact.2.h':        'Gate features behind a subscription',
      'pact.2.p':        'No iHYPE Pro. No Premium. No paywalled charts, analytics, or HYPE multipliers.',
      'pact.3.h':        'Sell or resell user data',
      'pact.3.p':        'Your listening, location, friends, purchases — never packaged, never sold, never shared with brokers.',
      'pact.4.h':        'Accept payment for chart positions',
      'pact.4.p':        'Charts rank on active HYPE only. No label can buy a top spot. Sponsored slots appear at position 4+ and are labelled.',
      'pact.5.h':        'Run non-music ads',
      'pact.5.p':        'No sports betting, crypto, or mortgage refinance. Music-related businesses only, in audio playback only.',
      'pact.6.h':        'Displace top organic recommendations',
      'pact.6.p':        'The top three recommendation slots are always earned. Sponsored content appears at position 4 or later.',
      'pact.7.h':        'Play ads outside music playback',
      'pact.7.p':        'No banners. No interstitials. No pre-rolls on pages. Audio ads only, in the player only.',
      'pact.8.h':        'Take a cut from artist revenue',
      'pact.8.p':        'Tip jars, merch, supporter funds — 100% goes to the artist after card and tax. Full stop.',

      // Glass wall
      'glass.eyebrow':   'Why it\'s the best · 04 of 05',
      'glass.h2':        'Every number, <em>in the open.</em>',
      'glass.lede':      'The Glass Wall is a live public dashboard showing where every dollar went today. Aggregated, anonymized, updated every minute. iHYPE management sees the same numbers you do — there are no private dashboards.',
      'glass.s1.lbl':    'Today · live',
      'glass.s1.sub':    'Songs finished',
      'glass.s2.lbl':    'Today · live',
      'glass.s2.sub':    'HYPE given',
      'glass.s3.lbl':    'Today · live',
      'glass.s3.sub':    'Tickets sold',
      'glass.s4.lbl':    'Today · live',
      'glass.s4.sub':    'To creators',
      'glass.s5.lbl':    'Right now',
      'glass.s5.sub':    'Active sessions',
      'glass.flow.h':    'Where today\'s ticket revenue went',
      'glass.flow.p':    'Updated every minute. Public API available.',
      'glass.flow.when': 'Today · so far',
      'glass.lbl.artists':  'Artists',
      'glass.lbl.venues':   'Venues',
      'glass.lbl.promoters':'Promoters',
      'glass.lbl.platform': 'iHYPE platform',

      // Governance
      'gov.eyebrow':     'Why it\'s the best · 05 of 05',
      'gov.h2':          'Owned by the community. <em>Governed by the scene.</em>',
      'gov.lede':        'Not-for-profit is just a tax status. What keeps a platform honest is who sits on the board, what they can block, and what they\'re required to publish.',
      'gov.board.h':     'The board · 9 seats',
      'gov.board.lede':  'Eight seats elected by users — two per role. One executive director. Three-year terms, two-term cap. Quarterly public meetings.',
      'gov.rule1':       '<strong>Algorithm changes need board approval</strong> and a public changelog with dissents recorded.',
      'gov.rule2':       '<strong>Payout rules can\'t change</strong> without board vote. The 45/45/10 split is charter-protected.',
      'gov.rule3':       '<strong>Recall by petition.</strong> 25% of any role\'s voters can trigger a seat recall.',
      'gov.rule4':       '<strong>ED salary cap</strong> at 5× the platform\'s average wage.',
      'gov.pub.h':       'What we publish — on a schedule',
      'gov.pub.lede':    'Real documents on a regular cadence. Not press releases.',
      'gov.pub.view':    'View →',

      // CTA
      'cta.h2':          'Join the platform that exists <em>for the scene.</em>',
      'cta.p':           'Free forever. Two fields to start. The music you love gets louder when you say so. Share iHYPE with one person who loves it as much as you do.',
      'cta.join':        'Join free, forever',
      'cta.signin':      'I already have an account',
      'cta.foot':        '501(c)(3) · books open · $0 platform fee · no data resale · owned by the community',

      // Footer
      'footer.legal':    '501(c)(3) · books open',

      // A11y panel
      'a11y.title':      'Accessibility',
      'a11y.lang':       'Language',
      'a11y.vision':     'Vision · text size',
      'a11y.reading':    'Reading',
      'a11y.dyslexia':   'Dyslexia-friendly',
      'a11y.dyslexia.d': 'Wider letter spacing, taller line height',
      'a11y.contrast':   'High contrast',
      'a11y.contrast.d': 'Stronger borders, pure black text',
      'a11y.hearing':    'Hearing',
      'a11y.captions':   'Captions on by default',
      'a11y.captions.d': 'Every show, mix, video',
      'a11y.visualad':   'Visual ad indicator',
      'a11y.visualad.d': 'Banner shows when audio ads play',
      'a11y.motion':     'Motion & input',
      'a11y.reduced':    'Reduced motion',
      'a11y.reduced.d':  'Disable animations',
      'a11y.targets':    'Larger tap targets',
      'a11y.targets.d':  'All interactive elements ≥ 48px',
      'a11y.foot':       'Settings save automatically and follow you across devices when signed in.',
      'a11y.size.default': 'Default',
      'a11y.size.large':   'Large',
      'a11y.size.xl':      'XL',
    },

    // ─── Español ───────────────────────────────────────────────────────
    es: {
      'nav.home':        'Inicio',
      'nav.hype':        'HYPE',
      'nav.discover':    'Descubrir',
      'nav.tickets':     'Entradas',
      'nav.signin':      'Iniciar sesión',
      'nav.join':        'Únete gratis',
      'nav.a11y':        'Accesibilidad',
      'nav.charts':      'Clasificaciones',
      'nav.shows':       'Shows',
      'nav.promise':     'La Promesa',
      'nav.myshows':     'Mis shows',
      'nav.create':      'Crear',
      'hero.eyebrow':    'Sin fines de lucro · gratis para siempre · hecho para la escena',
      'hero.h1':         'Música independiente, <em>impulsada por quienes la aman.</em>',
      'hero.lede':       'iHYPE es una plataforma de música gratuita que no pertenece a nadie con ánimo de lucro. Los fans descubren y apoyan a los artistas. Los artistas cobran cuando su música vende entradas. La gente que hace la escena —no una corporación— decide qué sube.',
      'hero.cta.join':   'Únete gratis',
      'hero.cta.signin': 'Iniciar sesión',
      'hero.cta.note':   'Email o teléfono. Dos campos. Listo.',
      'live.now':        'Ahora mismo',
      'live.listening':  'escuchando',
      'live.hype':       'HYPE dado hoy',
      'live.dist':       'distribuido a creadores hoy',
      'live.us':         'para iHYPE',
      'what.eyebrow':    'Qué es iHYPE',
      'what.h2':         'Una plataforma. Tres reglas.',
      'what.p1.num':     '$0',
      'what.p1.title':   'Gratis para todos, siempre.',
      'what.p1.desc':    'Escucha, haz hype, asiste, publica, vende entradas. Sin nivel premium. Sin muros de pago. El mismo acceso desde el día uno hasta siempre.',
      'what.p2.num':     '45/45/10',
      'what.p2.title':   'Las entradas pagan a los creadores, no a nosotros.',
      'what.p2.desc':    'Cada entrada se divide directo: 45% al artista, 45% al local, 10% al promotor. iHYPE no se queda nada. El procesamiento de tarjeta y los impuestos se muestran como líneas separadas.',
      'what.p3.num':     '100%',
      'what.p3.title':   'Solo anuncios de música. Nada más.',
      'what.p3.desc':    'Financiado por anuncios de audio de artistas, locales, promotores y tiendas de música. Sin apuestas deportivas, cripto ni hipotecas. Si no es música, no entra.',
      'roles.eyebrow':   'Para quién es',
      'roles.h2':        'Una cuenta. <em>Cuatro roles.</em>',
      'roles.lede':      'Empieza con el que más te convenga hoy. Añade más cuando quieras — misma cuenta, sin volver a registrarte.',
      'roles.fan.name':  'Fan',
      'roles.fan.line':  'Escucha, haz hype, asiste. Construye tu perfil de gustos. Tu HYPE da forma a las listas — no el presupuesto de un sello.',
      'roles.fan.cta':   'La mayoría empieza aquí →',
      'roles.artist.name':   'Artista',
      'roles.artist.line':   'Publica canciones, planifica giras usando mapas de HYPE, cobra el 45% de cada entrada. Sin intermediarios.',
      'roles.artist.cta':    'Planificador de giras incluido →',
      'roles.venue.name':    'Local',
      'roles.venue.line':    'Lista shows, escanea entradas en la puerta, ve qué artistas locales están ganando impulso antes que nadie.',
      'roles.venue.cta':     'Radar de reservas incluido →',
      'roles.promoter.name': 'Promotor / DJ',
      'roles.promoter.line': 'Crea shows, haz mixtapes, gana el 10% de cada entrada que generen tus recomendaciones.',
      'roles.promoter.cta':  'Creador de shows incluido →',
      'share.eyebrow':   'Por qué compartirlo',
      'share.h2':        'La escena solo crece <em>si la gente que la ama lo dice.</em>',
      'share.p1':        'Cada gran plataforma de streaming está optimizada para ganar dinero para sus accionistas. El resultado: los mismos 40 artistas dominando todas las listas, escenas regionales invisibles y precios de entradas que suben porque quienes cobran comisiones no tienen razón para parar. <strong>iHYPE solo funciona si los fans lo usan.</strong>',
      'share.p2':        'Este es el mecanismo: <strong>tu HYPE es un voto que no expira de inmediato, no desaparece detrás de un muro de pago y no se puede comprar.</strong> Comparte iHYPE con una persona que ame la música y habrás añadido una voz más sin corromper a un sistema construido alrededor de voces sin corromper.',
      'share.fans.lbl':  'Para fans',
      'share.fans.p':    'La música que amas suena más fuerte cuando tú lo dices. <strong>Tu HYPE da forma a las listas</strong> que leerá el próximo agente, local o promotor del artista.',
      'share.artists.lbl': 'Para artistas',
      'share.artists.p': 'Cada nuevo fan que se une es un comprador potencial de entradas y dador de HYPE. <strong>El planificador de giras lee la concentración real de HYPE</strong> — más usuarios significa mejor señal de dónde girar.',
      'share.scene.lbl': 'Para la escena',
      'share.scene.p':   'Los locales y promotores locales ven el impulso del HYPE antes que las grandes discográficas. <strong>El primer show</strong> que una escena hace en una nueva ciudad a menudo construye una base de fans permanente allí.',
      'receipt.eyebrow': 'Por qué es mejor · 01 de 05',
      'receipt.h2':      'Puedes leer el recibo. <em>Cada línea.</em>',
      'receipt.lede':    'Una venta real de entrada de $45, completamente desglosada. Sin "cargo por servicio" que oculte un recorte de la plataforma.',
      'receipt.ex1.h':   'La división 45 / 45 / 10',
      'receipt.ex1.p':   '<strong>Artista 45%:</strong> hicieron la música. <strong>Local 45%:</strong> tienen la sala. <strong>Promotor 10%:</strong> trajeron al público. ¿Sin promotor? La división pasa a 50/50.',
      'receipt.ex2.h':   'Por qué se muestran la tarjeta y los impuestos por separado',
      'receipt.ex2.p':   'La mayoría de las plataformas mezclan las comisiones de Stripe y los impuestos en un "cargo por servicio" que oculta su propio corte. Los desglosamos para que puedas verificar.',
      'receipt.ex3.h':   'Los reembolsos mantienen las matemáticas intactas',
      'receipt.ex3.p':   'Si un show se cancela, cada destinatario es debitado proporcionalmente. Nadie se queda un corte que no ganó.',
      'receipt.label.ticket': 'Precio de entrada',
      'receipt.label.goes':   'A dónde va',
      'receipt.label.pass':   'Pase directo (no es nuestro)',
      'receipt.label.artist': 'Phantom Ridge · artista (45%)',
      'receipt.label.venue':  'State Theatre · local (45%)',
      'receipt.label.promo':  'Disco Mortis · promotor (10%)',
      'receipt.label.fee':    'Comisión de plataforma iHYPE',
      'receipt.label.card':   'Procesamiento de tarjeta · Stripe',
      'receipt.label.tax':    'Impuesto de ventas · ME 5.5%',
      'receipt.label.total':  'Total cobrado',
      'receipt.foot':         'De cada dólar que pagas, <strong>$45 van a las personas que hicieron este show.</strong>',
      'compare.eyebrow': 'Por qué es mejor · 02 de 05',
      'compare.h2':      '¿Qué pagarías <em>en otro lugar?</em>',
      'compare.lede':    'La venta de entradas para música en vivo es una industria de $35 mil millones construida sobre comisiones acumuladas.',
      'compare.col.us':  'iHYPE.org',
      'compare.col.them':'Plataforma típica de entradas',
      'compare.r1.crit': 'Cargo por servicio',
      'compare.r1.sm':   'Por entrada',
      'compare.r2.crit': 'Cargo por procesamiento',
      'compare.r2.sm':   'Por compra',
      'compare.r3.crit': 'Cargo por entrega digital',
      'compare.r3.sm':   'Por un código QR digital',
      'compare.r4.crit': 'El artista recibe',
      'compare.r4.sm':   'Después de comisiones, en una entrada de $45',
      'compare.r5.crit': 'Venta de datos',
      'compare.r5.sm':   'Venta de datos de escucha a brokers',
      'compare.r6.crit': 'Pago por posición en listas',
      'compare.r6.sm':   'Sellos comprando posiciones',
      'compare.r5.us':   'Nunca',
      'compare.r5.them': 'Estándar en la industria',
      'compare.r6.us':   'Prohibido',
      'compare.r6.them': 'Habitual',
      'quote.text':      '"Haz hype a la escena. <em>No al próximo rico.</em>"',
      'quote.attr':      '— Carta fundacional de iHYPE',
      'pact.eyebrow':    'Por qué es mejor · 03 de 05',
      'pact.h2':         'Ocho cosas que <em>nunca</em> haremos.',
      'pact.lede':       'Es más fácil comprometerse con una lista que con un principio vago. Si iHYPE hace alguna de estas cosas, deberías irte.',
      'pact.1.h':        'Cobrar una comisión de plataforma por entradas',
      'pact.1.p':        'La línea de comisión de plataforma es $0 para siempre. No "introductorio". No "durante alta demanda". Cero.',
      'pact.2.h':        'Poner funciones detrás de una suscripción',
      'pact.2.p':        'Sin iHYPE Pro. Sin Premium. Sin listas, analíticas o multiplicadores de HYPE de pago.',
      'pact.3.h':        'Vender o revender datos de usuarios',
      'pact.3.p':        'Tu escucha, ubicación, amigos, compras — nunca se empaquetan, nunca se venden, nunca se comparten con brokers.',
      'pact.4.h':        'Aceptar pago por posiciones en listas',
      'pact.4.p':        'Las listas se ordenan solo por HYPE activo. Ningún sello puede comprar una posición.',
      'pact.5.h':        'Poner anuncios que no sean de música',
      'pact.5.p':        'Sin apuestas deportivas, cripto ni hipotecas. Solo negocios relacionados con la música, en audio.',
      'pact.6.h':        'Desplazar las recomendaciones orgánicas principales',
      'pact.6.p':        'Los tres primeros puestos de recomendaciones siempre se ganan. El contenido patrocinado aparece en la posición 4 o posterior.',
      'pact.7.h':        'Poner anuncios fuera de la reproducción de música',
      'pact.7.p':        'Sin banners. Sin intersticiales. Sin pre-rolls en páginas. Solo anuncios de audio, en el reproductor.',
      'pact.8.h':        'Quedarse un porcentaje de los ingresos del artista',
      'pact.8.p':        'Propinas, merchandising, fondos de apoyo — el 100% va al artista después de la tarjeta y los impuestos.',
      'glass.eyebrow':   'Por qué es mejor · 04 de 05',
      'glass.h2':        'Cada número, <em>al descubierto.</em>',
      'glass.lede':      'El Muro de Cristal es un panel público en vivo que muestra adónde fue cada dólar hoy. Agregado, anonimizado, actualizado cada minuto.',
      'glass.s1.lbl':    'Hoy · en vivo',
      'glass.s1.sub':    'Canciones terminadas',
      'glass.s2.lbl':    'Hoy · en vivo',
      'glass.s2.sub':    'HYPE dado',
      'glass.s3.lbl':    'Hoy · en vivo',
      'glass.s3.sub':    'Entradas vendidas',
      'glass.s4.lbl':    'Hoy · en vivo',
      'glass.s4.sub':    'A creadores',
      'glass.s5.lbl':    'Ahora mismo',
      'glass.s5.sub':    'Sesiones activas',
      'glass.flow.h':    'Adónde fue la recaudación de entradas de hoy',
      'glass.flow.p':    'Actualizado cada minuto. API pública disponible.',
      'glass.flow.when': 'Hoy · hasta ahora',
      'glass.lbl.artists':  'Artistas',
      'glass.lbl.venues':   'Locales',
      'glass.lbl.promoters':'Promotores',
      'glass.lbl.platform': 'Plataforma iHYPE',
      'gov.eyebrow':     'Por qué es mejor · 05 de 05',
      'gov.h2':          'Propiedad de la comunidad. <em>Gobernada por la escena.</em>',
      'gov.lede':        'Sin fines de lucro es solo un estatus fiscal. Lo que mantiene honesta a una plataforma es quién está en la junta y qué están obligados a publicar.',
      'gov.board.h':     'La junta · 9 asientos',
      'gov.board.lede':  'Ocho asientos elegidos por los usuarios — dos por rol. Un director ejecutivo. Mandatos de tres años, máximo dos mandatos.',
      'gov.rule1':       '<strong>Los cambios en el algoritmo requieren aprobación de la junta</strong> y un registro público de cambios con disidencias.',
      'gov.rule2':       '<strong>Las reglas de pago no pueden cambiar</strong> sin votación de la junta. La división 45/45/10 está protegida.',
      'gov.rule3':       '<strong>Revocación por petición.</strong> El 25% de los votantes de cualquier rol puede activar una revocación.',
      'gov.rule4':       '<strong>Límite salarial del DE</strong> en 5× el salario promedio de la plataforma.',
      'gov.pub.h':       'Lo que publicamos — con regularidad',
      'gov.pub.lede':    'Documentos reales con frecuencia regular. No comunicados de prensa.',
      'gov.pub.view':    'Ver →',
      'cta.h2':          'Únete a la plataforma que existe <em>para la escena.</em>',
      'cta.p':           'Gratis para siempre. Dos campos para empezar. La música que amas suena más fuerte cuando tú lo dices.',
      'cta.join':        'Únete gratis, para siempre',
      'cta.signin':      'Ya tengo una cuenta',
      'cta.foot':        '501(c)(3) · libros abiertos · $0 comisión de plataforma · sin venta de datos · propiedad de la comunidad',
      'footer.legal':    '501(c)(3) · libros abiertos',
      'a11y.title':      'Accesibilidad',
      'a11y.lang':       'Idioma',
      'a11y.vision':     'Visión · tamaño de texto',
      'a11y.reading':    'Lectura',
      'a11y.dyslexia':   'Fuente para dislexia',
      'a11y.dyslexia.d': 'Más espacio entre letras, altura de línea mayor',
      'a11y.contrast':   'Alto contraste',
      'a11y.contrast.d': 'Bordes más fuertes, texto negro puro',
      'a11y.hearing':    'Audición',
      'a11y.captions':   'Subtítulos activados por defecto',
      'a11y.captions.d': 'Cada show, mezcla, video',
      'a11y.visualad':   'Indicador visual de anuncio',
      'a11y.visualad.d': 'Aparece un banner cuando se reproducen anuncios de audio',
      'a11y.motion':     'Movimiento y entrada',
      'a11y.reduced':    'Movimiento reducido',
      'a11y.reduced.d':  'Desactivar animaciones',
      'a11y.targets':    'Áreas de toque más grandes',
      'a11y.targets.d':  'Todos los elementos interactivos ≥ 48px',
      'a11y.foot':       'Los ajustes se guardan automáticamente y te siguen entre dispositivos cuando has iniciado sesión.',
      'a11y.size.default': 'Por defecto',
      'a11y.size.large':   'Grande',
      'a11y.size.xl':      'XL',
    },

    // ─── Português ────────────────────────────────────────────────────
    pt: {
      'nav.home':        'Início',
      'nav.hype':        'HYPE',
      'nav.discover':    'Descobrir',
      'nav.tickets':     'Ingressos',
      'nav.signin':      'Entrar',
      'nav.join':        'Junte-se grátis',
      'nav.a11y':        'Acessibilidade',
      'nav.charts':      'Paradas',
      'nav.shows':       'Shows',
      'nav.promise':     'A Promessa',
      'nav.myshows':     'Meus shows',
      'nav.create':      'Criar',
      'hero.eyebrow':    'Sem fins lucrativos · gratuito para sempre · feito para a cena',
      'hero.h1':         'Música independente, <em>com hype de quem a ama.</em>',
      'hero.lede':       'iHYPE é uma plataforma de música gratuita que não pertence a ninguém com fins lucrativos. Os fãs descobrem e apoiam artistas. Os artistas recebem quando a sua música vende ingressos. As pessoas que fazem a cena — não uma corporação — decidem o que sobe.',
      'hero.cta.join':   'Junte-se grátis',
      'hero.cta.signin': 'Entrar',
      'hero.cta.note':   'Email ou telefone. Dois campos. Pronto.',
      'live.now':        'Agora mesmo',
      'live.listening':  'ouvindo',
      'live.hype':       'HYPE dado hoje',
      'live.dist':       'distribuído para criadores hoje',
      'live.us':         'para o iHYPE',
      'what.eyebrow':    'O que é o iHYPE',
      'what.h2':         'Uma plataforma. Três regras.',
      'what.p1.num':     '$0',
      'what.p1.title':   'Gratuito para todos, para sempre.',
      'what.p1.desc':    'Ouça, dê hype, compareça, publique, venda ingressos. Sem nível premium. Sem paywall. O mesmo acesso desde o primeiro dia até sempre.',
      'what.p2.num':     '45/45/10',
      'what.p2.title':   'Os ingressos pagam os criadores, não nós.',
      'what.p2.desc':    'Cada ingresso é dividido diretamente: 45% para o artista, 45% para o local, 10% para o promotor. O iHYPE não fica com nada.',
      'what.p3.num':     '100%',
      'what.p3.title':   'Apenas anúncios de música. Nada mais.',
      'what.p3.desc':    'Financiado por anúncios de áudio de artistas, locais, promotores e lojas de música. Sem apostas esportivas, criptomoedas ou hipotecas.',
      'roles.eyebrow':   'Para quem é',
      'roles.h2':        'Uma conta. <em>Quatro papéis.</em>',
      'roles.lede':      'Comece com o que se encaixa hoje. Adicione mais quando quiser — mesma conta, sem novo cadastro.',
      'roles.fan.name':  'Fã',
      'roles.fan.line':  'Ouça, dê hype, compareça. Construa seu perfil de gostos. O seu HYPE molda as paradas — não o orçamento de uma gravadora.',
      'roles.fan.cta':   'A maioria começa aqui →',
      'roles.artist.name':   'Artista',
      'roles.artist.line':   'Publique músicas, planeje turnês usando mapas de HYPE, receba 45% de cada ingresso. Sem intermediários.',
      'roles.artist.cta':    'Planejador de turnê incluído →',
      'roles.venue.name':    'Local',
      'roles.venue.line':    'Liste shows, escaneie ingressos na entrada, veja quais artistas locais estão ganhando impulso antes de qualquer outro.',
      'roles.venue.cta':     'Radar de reservas incluído →',
      'roles.promoter.name': 'Promotor / DJ',
      'roles.promoter.line': 'Crie shows, faça mixtapes, ganhe 10% de cada ingresso que as suas recomendações gerarem.',
      'roles.promoter.cta':  'Criador de shows incluído →',
      'share.eyebrow':   'Por que compartilhar',
      'share.h2':        'A cena só cresce <em>se as pessoas que a amam disserem isso.</em>',
      'share.p1':        'Cada grande plataforma de streaming é otimizada para ganhar dinheiro para os acionistas. O resultado: os mesmos 40 artistas dominando todas as paradas, cenas regionais invisíveis. <strong>O iHYPE só funciona se os fãs o usarem.</strong>',
      'share.p2':        'Este é o mecanismo: <strong>o seu HYPE é um voto que não expira instantaneamente, não desaparece atrás de um paywall e não pode ser comprado.</strong>',
      'share.fans.lbl':  'Para fãs',
      'share.fans.p':    'A música que você ama fica mais alta quando você diz isso. <strong>O seu HYPE molda as paradas</strong> que o próximo agente, local ou promotor do artista vai ler.',
      'share.artists.lbl': 'Para artistas',
      'share.artists.p': 'Cada novo fã que entra é um comprador potencial de ingressos e dador de HYPE. <strong>O planejador de turnê lê a concentração real de HYPE</strong>.',
      'share.scene.lbl': 'Para a cena',
      'share.scene.p':   'Locais e promotores locais veem o impulso do HYPE antes das grandes gravadoras. <strong>O primeiro show</strong> de uma cena em uma nova cidade frequentemente constrói uma base de fãs permanente lá.',
      'receipt.eyebrow': 'Por que é melhor · 01 de 05',
      'receipt.h2':      'Você pode ler o recibo. <em>Cada linha.</em>',
      'receipt.lede':    'Uma venda real de ingresso de $45, totalmente detalhada. Sem "taxa de serviço" escondendo o corte da plataforma.',
      'receipt.ex1.h':   'A divisão 45 / 45 / 10',
      'receipt.ex1.p':   '<strong>Artista 45%:</strong> fizeram a música. <strong>Local 45%:</strong> têm o espaço. <strong>Promotor 10%:</strong> trouxeram o público. Sem promotor? A divisão passa para 50/50.',
      'receipt.ex2.h':   'Por que cartão e impostos são mostrados separadamente',
      'receipt.ex2.p':   'A maioria das plataformas mistura as taxas do Stripe e os impostos em uma "taxa de serviço" que esconde o seu próprio corte. Nós detalhamos para que você possa verificar.',
      'receipt.ex3.h':   'Os reembolsos mantêm a matemática intacta',
      'receipt.ex3.p':   'Se um show for cancelado, cada destinatário é debitado proporcionalmente. Ninguém fica com um corte que não ganhou.',
      'receipt.label.ticket': 'Preço do ingresso',
      'receipt.label.goes':   'Para onde vai',
      'receipt.label.pass':   'Repasse direto (não é nosso)',
      'receipt.label.artist': 'Phantom Ridge · artista (45%)',
      'receipt.label.venue':  'State Theatre · local (45%)',
      'receipt.label.promo':  'Disco Mortis · promotor (10%)',
      'receipt.label.fee':    'Taxa de plataforma iHYPE',
      'receipt.label.card':   'Processamento de cartão · Stripe',
      'receipt.label.tax':    'Imposto de vendas · ME 5.5%',
      'receipt.label.total':  'Total cobrado',
      'receipt.foot':         'De cada dólar que você paga, <strong>$45 vão para as pessoas que fizeram este show.</strong>',
      'compare.eyebrow': 'Por que é melhor · 02 de 05',
      'compare.h2':      'O que você pagaria <em>em outro lugar.</em>',
      'compare.lede':    'A venda de ingressos para música ao vivo é uma indústria de $35 bilhões construída sobre taxas empilhadas.',
      'compare.col.us':  'iHYPE.org',
      'compare.col.them':'Plataforma típica de ingressos',
      'compare.r1.crit': 'Taxa de serviço',
      'compare.r1.sm':   'Por ingresso',
      'compare.r2.crit': 'Taxa de processamento',
      'compare.r2.sm':   'Por compra',
      'compare.r3.crit': 'Taxa de entrega digital',
      'compare.r3.sm':   'Por um QR digital',
      'compare.r4.crit': 'O artista recebe',
      'compare.r4.sm':   'Após todas as taxas, em um ingresso de $45',
      'compare.r5.crit': 'Venda de dados',
      'compare.r5.sm':   'Venda de dados de escuta para corretores',
      'compare.r6.crit': 'Pagamento por posição nas paradas',
      'compare.r6.sm':   'Gravadoras comprando posições',
      'compare.r5.us':   'Nunca',
      'compare.r5.them': 'Padrão na indústria',
      'compare.r6.us':   'Proibido',
      'compare.r6.them': 'Rotina',
      'quote.text':      '"Hype a cena. <em>Não o próximo rico.</em>"',
      'quote.attr':      '— Carta fundacional do iHYPE',
      'pact.eyebrow':    'Por que é melhor · 03 de 05',
      'pact.h2':         'Oito coisas que <em>nunca</em> faremos.',
      'pact.lede':       'É mais fácil se comprometer com uma lista do que com um princípio vago.',
      'pact.1.h':        'Cobrar uma taxa de plataforma por ingressos',
      'pact.1.p':        'A linha de taxa de plataforma é $0 para sempre. Zero.',
      'pact.2.h':        'Colocar funcionalidades atrás de uma assinatura',
      'pact.2.p':        'Sem iHYPE Pro. Sem Premium. Sem paradas, análises ou multiplicadores de HYPE pagos.',
      'pact.3.h':        'Vender ou revender dados de usuários',
      'pact.3.p':        'Sua escuta, localização, amigos, compras — nunca empacotados, nunca vendidos.',
      'pact.4.h':        'Aceitar pagamento por posições nas paradas',
      'pact.4.p':        'As paradas classificam apenas por HYPE ativo. Nenhuma gravadora pode comprar uma posição.',
      'pact.5.h':        'Colocar anúncios que não sejam de música',
      'pact.5.p':        'Sem apostas esportivas, criptomoedas ou hipotecas. Apenas negócios relacionados à música.',
      'pact.6.h':        'Deslocar as recomendações orgânicas principais',
      'pact.6.p':        'Os três primeiros slots de recomendações são sempre ganhos. O conteúdo patrocinado aparece na posição 4 ou posterior.',
      'pact.7.h':        'Colocar anúncios fora da reprodução de música',
      'pact.7.p':        'Sem banners. Sem intersticiais. Apenas anúncios de áudio, no player.',
      'pact.8.h':        'Tirar uma parte da receita do artista',
      'pact.8.p':        'Gorjetas, merch, fundos de apoio — 100% vai para o artista após cartão e impostos.',
      'glass.eyebrow':   'Por que é melhor · 04 de 05',
      'glass.h2':        'Cada número, <em>ao público.</em>',
      'glass.lede':      'O Muro de Vidro é um painel público ao vivo que mostra para onde cada dólar foi hoje.',
      'glass.s1.lbl':    'Hoje · ao vivo',
      'glass.s1.sub':    'Músicas concluídas',
      'glass.s2.lbl':    'Hoje · ao vivo',
      'glass.s2.sub':    'HYPE dado',
      'glass.s3.lbl':    'Hoje · ao vivo',
      'glass.s3.sub':    'Ingressos vendidos',
      'glass.s4.lbl':    'Hoje · ao vivo',
      'glass.s4.sub':    'Para criadores',
      'glass.s5.lbl':    'Agora mesmo',
      'glass.s5.sub':    'Sessões ativas',
      'glass.flow.h':    'Para onde foi a receita de ingressos de hoje',
      'glass.flow.p':    'Atualizado a cada minuto. API pública disponível.',
      'glass.flow.when': 'Hoje · até agora',
      'glass.lbl.artists':  'Artistas',
      'glass.lbl.venues':   'Locais',
      'glass.lbl.promoters':'Promotores',
      'glass.lbl.platform': 'Plataforma iHYPE',
      'gov.eyebrow':     'Por que é melhor · 05 de 05',
      'gov.h2':          'Propriedade da comunidade. <em>Governada pela cena.</em>',
      'gov.lede':        'Sem fins lucrativos é apenas um status fiscal. O que mantém uma plataforma honesta é quem está no conselho e o que eles são obrigados a publicar.',
      'gov.board.h':     'O conselho · 9 assentos',
      'gov.board.lede':  'Oito assentos eleitos pelos usuários — dois por papel. Um diretor executivo. Mandatos de três anos, máximo dois mandatos.',
      'gov.rule1':       '<strong>Mudanças no algoritmo precisam de aprovação do conselho</strong> e um changelog público.',
      'gov.rule2':       '<strong>As regras de pagamento não podem mudar</strong> sem votação do conselho.',
      'gov.rule3':       '<strong>Revogação por petição.</strong> 25% dos eleitores de qualquer papel pode ativar uma revogação.',
      'gov.rule4':       '<strong>Limite salarial do DE</strong> em 5× o salário médio da plataforma.',
      'gov.pub.h':       'O que publicamos — regularmente',
      'gov.pub.lede':    'Documentos reais com regularidade. Não comunicados de imprensa.',
      'gov.pub.view':    'Ver →',
      'cta.h2':          'Junte-se à plataforma que existe <em>para a cena.</em>',
      'cta.p':           'Gratuito para sempre. Dois campos para começar. A música que você ama fica mais alta quando você diz isso.',
      'cta.join':        'Junte-se grátis, para sempre',
      'cta.signin':      'Já tenho uma conta',
      'cta.foot':        '501(c)(3) · livros abertos · $0 taxa de plataforma · sem venda de dados · propriedade da comunidade',
      'footer.legal':    '501(c)(3) · livros abertos',
      'a11y.title':      'Acessibilidade',
      'a11y.lang':       'Idioma',
      'a11y.vision':     'Visão · tamanho do texto',
      'a11y.reading':    'Leitura',
      'a11y.dyslexia':   'Fonte para dislexia',
      'a11y.dyslexia.d': 'Mais espaço entre letras, altura de linha maior',
      'a11y.contrast':   'Alto contraste',
      'a11y.contrast.d': 'Bordas mais fortes, texto preto puro',
      'a11y.hearing':    'Audição',
      'a11y.captions':   'Legendas ativadas por padrão',
      'a11y.captions.d': 'Cada show, mix, vídeo',
      'a11y.visualad':   'Indicador visual de anúncio',
      'a11y.visualad.d': 'Aparece um banner quando anúncios de áudio são reproduzidos',
      'a11y.motion':     'Movimento e entrada',
      'a11y.reduced':    'Movimento reduzido',
      'a11y.reduced.d':  'Desativar animações',
      'a11y.targets':    'Áreas de toque maiores',
      'a11y.targets.d':  'Todos os elementos interativos ≥ 48px',
      'a11y.foot':       'As configurações são salvas automaticamente e seguem você entre dispositivos quando conectado.',
      'a11y.size.default': 'Padrão',
      'a11y.size.large':   'Grande',
      'a11y.size.xl':      'XL',
    },

    // ─── Français ─────────────────────────────────────────────────────
    fr: {
      'nav.home':        'Accueil',
      'nav.hype':        'HYPE',
      'nav.discover':    'Découvrir',
      'nav.tickets':     'Billets',
      'nav.signin':      'Se connecter',
      'nav.join':        'Rejoindre gratuitement',
      'nav.a11y':        'Accessibilité',
      'nav.charts':      'Classements',
      'nav.shows':       'Concerts',
      'nav.promise':     'La Promesse',
      'nav.myshows':     'Mes concerts',
      'nav.create':      'Créer',
      'hero.eyebrow':    'Sans but lucratif · gratuit pour toujours · fait pour la scène',
      'hero.h1':         'Musique indépendante, <em>portée par ceux qui l\'aiment.</em>',
      'hero.lede':       'iHYPE est une plateforme de musique gratuite qui n\'appartient à personne ayant des motifs lucratifs. Les fans découvrent et soutiennent les artistes. Les artistes sont payés lorsque leur musique vend des billets. Les gens qui font la scène — pas une entreprise — décident de ce qui monte.',
      'hero.cta.join':   'Rejoindre gratuitement',
      'hero.cta.signin': 'Se connecter',
      'hero.cta.note':   'Email ou téléphone. Deux champs. C\'est tout.',
      'live.now':        'En ce moment',
      'live.listening':  'à l\'écoute',
      'live.hype':       'HYPE donné aujourd\'hui',
      'live.dist':       'distribué aux créateurs aujourd\'hui',
      'live.us':         'pour iHYPE',
      'what.eyebrow':    'Ce qu\'est iHYPE',
      'what.h2':         'Une plateforme. Trois règles.',
      'what.p1.num':     '0 €',
      'what.p1.title':   'Gratuit pour tous, pour toujours.',
      'what.p1.desc':    'Écoutez, donnez du hype, assistez, publiez, vendez des billets. Pas de niveau premium. Pas de mur payant. Le même accès du premier jour jusqu\'à jamais.',
      'what.p2.num':     '45/45/10',
      'what.p2.title':   'Les billets paient les créateurs, pas nous.',
      'what.p2.desc':    'Chaque billet est divisé directement : 45 % à l\'artiste, 45 % à la salle, 10 % au promoteur. iHYPE ne prend rien.',
      'what.p3.num':     '100 %',
      'what.p3.title':   'Uniquement des publicités musicales.',
      'what.p3.desc':    'Financé par des publicités audio d\'artistes, salles, promoteurs et magasins de musique. Sans paris sportifs, crypto ou hypothèques.',
      'roles.eyebrow':   'Pour qui c\'est',
      'roles.h2':        'Un compte. <em>Quatre rôles.</em>',
      'roles.lede':      'Commencez avec ce qui vous convient aujourd\'hui. Ajoutez-en d\'autres quand vous voulez — même compte, sans recréer un profil.',
      'roles.fan.name':  'Fan',
      'roles.fan.line':  'Écoutez, donnez du hype, assistez. Construisez votre profil de goûts. Votre HYPE façonne les charts — pas le budget d\'un label.',
      'roles.fan.cta':   'La plupart commencent ici →',
      'roles.artist.name':   'Artiste',
      'roles.artist.line':   'Publiez des morceaux, planifiez des tournées grâce aux cartes HYPE, recevez 45 % de chaque billet. Sans intermédiaire.',
      'roles.artist.cta':    'Planificateur de tournée inclus →',
      'roles.venue.name':    'Salle',
      'roles.venue.line':    'Listez des concerts, scannez les billets à l\'entrée, voyez quels artistes locaux prennent de l\'élan avant tout le monde.',
      'roles.venue.cta':     'Radar de réservation inclus →',
      'roles.promoter.name': 'Promoteur / DJ',
      'roles.promoter.line': 'Créez des concerts, faites des mixtapes, gagnez 10 % sur chaque billet que vos recommandations génèrent.',
      'roles.promoter.cta':  'Créateur de concerts inclus →',
      'share.eyebrow':   'Pourquoi le partager',
      'share.h2':        'La scène ne grandit <em>que si ceux qui l\'aiment le disent.</em>',
      'share.p1':        'Chaque grande plateforme de streaming est optimisée pour gagner de l\'argent pour ses actionnaires. <strong>iHYPE ne fonctionne que si les fans l\'utilisent.</strong> L\'algorithme lit ce qui est aimé localement et le met en avant.',
      'share.p2':        'Voici le mécanisme : <strong>votre HYPE est un vote qui n\'expire pas immédiatement, ne disparaît pas derrière un mur payant et ne peut pas être acheté.</strong>',
      'share.fans.lbl':  'Pour les fans',
      'share.fans.p':    'La musique que vous aimez devient plus forte quand vous le dites. <strong>Votre HYPE façonne les charts</strong> que lira le prochain agent, salle ou promoteur de l\'artiste.',
      'share.artists.lbl': 'Pour les artistes',
      'share.artists.p': 'Chaque nouveau fan qui s\'inscrit est un acheteur potentiel de billets et donnateur de HYPE. <strong>Le planificateur de tournée lit la concentration réelle de HYPE</strong>.',
      'share.scene.lbl': 'Pour la scène',
      'share.scene.p':   'Les salles et promoteurs locaux voient l\'élan du HYPE avant les grands labels. <strong>Le premier concert</strong> d\'une scène dans une nouvelle ville construit souvent une base de fans permanente.',
      'receipt.eyebrow': 'Pourquoi c\'est le meilleur · 01 sur 05',
      'receipt.h2':      'Vous pouvez lire le reçu. <em>Chaque ligne.</em>',
      'receipt.lede':    'Une vente réelle de billet à 45 $, entièrement détaillée. Sans "frais de service" cachant une commission de la plateforme.',
      'receipt.ex1.h':   'La division 45 / 45 / 10',
      'receipt.ex1.p':   '<strong>Artiste 45 % :</strong> ils ont fait la musique. <strong>Salle 45 % :</strong> ils tiennent la salle. <strong>Promoteur 10 % :</strong> ils ont amené le public. Sans promoteur ? La division passe à 50/50.',
      'receipt.ex2.h':   'Pourquoi la carte et les taxes sont affichées séparément',
      'receipt.ex2.p':   'La plupart des plateformes mélangent les frais Stripe et les taxes dans des "frais de service" qui cachent leur propre commission. Nous les détaillons pour que vous puissiez vérifier.',
      'receipt.ex3.h':   'Les remboursements maintiennent les calculs intacts',
      'receipt.ex3.p':   'Si un concert est annulé, chaque bénéficiaire est débité proportionnellement. Personne ne garde une commission non gagnée.',
      'receipt.label.ticket': 'Prix du billet',
      'receipt.label.goes':   'Où ça va',
      'receipt.label.pass':   'Transfert direct (pas le nôtre)',
      'receipt.label.artist': 'Phantom Ridge · artiste (45 %)',
      'receipt.label.venue':  'State Theatre · salle (45 %)',
      'receipt.label.promo':  'Disco Mortis · promoteur (10 %)',
      'receipt.label.fee':    'Commission de plateforme iHYPE',
      'receipt.label.card':   'Traitement de carte · Stripe',
      'receipt.label.tax':    'Taxe de vente · ME 5,5 %',
      'receipt.label.total':  'Total facturé',
      'receipt.foot':         'Pour chaque dollar payé, <strong>45 $ vont aux personnes qui ont fait ce concert.</strong>',
      'compare.eyebrow': 'Pourquoi c\'est le meilleur · 02 sur 05',
      'compare.h2':      'Ce que vous paieriez <em>ailleurs.</em>',
      'compare.lede':    'La billetterie musicale live est une industrie de 35 milliards de dollars construite sur des frais empilés.',
      'compare.col.us':  'iHYPE.org',
      'compare.col.them':'Plateforme de billetterie typique',
      'compare.r1.crit': 'Frais de service',
      'compare.r1.sm':   'Par billet',
      'compare.r2.crit': 'Frais de traitement',
      'compare.r2.sm':   'Par achat',
      'compare.r3.crit': 'Frais de livraison numérique',
      'compare.r3.sm':   'Pour un QR numérique',
      'compare.r4.crit': 'L\'artiste reçoit',
      'compare.r4.sm':   'Après tous les frais, sur un billet à 45 $',
      'compare.r5.crit': 'Revente de données',
      'compare.r5.sm':   'Vente des données d\'écoute à des courtiers',
      'compare.r6.crit': 'Paiement pour les classements',
      'compare.r6.sm':   'Labels achetant des positions',
      'compare.r5.us':   'Jamais',
      'compare.r5.them': 'Standard dans l\'industrie',
      'compare.r6.us':   'Interdit',
      'compare.r6.them': 'Habituel',
      'quote.text':      '« Faites du hype pour la scène. <em>Pas pour le prochain riche. »</em>',
      'quote.attr':      '— Charte fondatrice d\'iHYPE',
      'pact.eyebrow':    'Pourquoi c\'est le meilleur · 03 sur 05',
      'pact.h2':         'Huit choses que nous ne ferons <em>jamais.</em>',
      'pact.lede':       'Il est plus facile de s\'engager sur une liste que sur un principe vague.',
      'pact.1.h':        'Facturer une commission de plateforme sur les billets',
      'pact.1.p':        'La ligne de commission de plateforme est de 0 $ pour toujours. Zéro.',
      'pact.2.h':        'Mettre des fonctionnalités derrière un abonnement',
      'pact.2.p':        'Pas d\'iHYPE Pro. Pas de Premium. Pas de charts, analyses ou multiplicateurs de HYPE payants.',
      'pact.3.h':        'Vendre ou revendre des données utilisateurs',
      'pact.3.p':        'Votre écoute, localisation, amis, achats — jamais emballés, jamais vendus.',
      'pact.4.h':        'Accepter un paiement pour les positions dans les charts',
      'pact.4.p':        'Les charts ne classent que par HYPE actif. Aucun label ne peut acheter une position.',
      'pact.5.h':        'Diffuser des publicités non musicales',
      'pact.5.p':        'Pas de paris sportifs, crypto ou hypothèques. Uniquement des entreprises liées à la musique.',
      'pact.6.h':        'Déplacer les recommandations organiques du top',
      'pact.6.p':        'Les trois premières positions sont toujours méritées. Le contenu sponsorisé apparaît en position 4 ou après.',
      'pact.7.h':        'Diffuser des publicités en dehors de la lecture musicale',
      'pact.7.p':        'Pas de bannières. Pas d\'interstitiels. Uniquement des publicités audio, dans le lecteur.',
      'pact.8.h':        'Prendre une part des revenus de l\'artiste',
      'pact.8.p':        'Pourboires, merchandising, fonds de soutien — 100 % va à l\'artiste après la carte et les taxes.',
      'glass.eyebrow':   'Pourquoi c\'est le meilleur · 04 sur 05',
      'glass.h2':        'Chaque chiffre, <em>en public.</em>',
      'glass.lede':      'Le Mur de Verre est un tableau de bord public en direct montrant où est allé chaque dollar aujourd\'hui.',
      'glass.s1.lbl':    'Aujourd\'hui · en direct',
      'glass.s1.sub':    'Morceaux terminés',
      'glass.s2.lbl':    'Aujourd\'hui · en direct',
      'glass.s2.sub':    'HYPE donné',
      'glass.s3.lbl':    'Aujourd\'hui · en direct',
      'glass.s3.sub':    'Billets vendus',
      'glass.s4.lbl':    'Aujourd\'hui · en direct',
      'glass.s4.sub':    'Aux créateurs',
      'glass.s5.lbl':    'En ce moment',
      'glass.s5.sub':    'Sessions actives',
      'glass.flow.h':    'Où sont allés les revenus de billets d\'aujourd\'hui',
      'glass.flow.p':    'Mis à jour chaque minute. API publique disponible.',
      'glass.flow.when': 'Aujourd\'hui · jusqu\'à présent',
      'glass.lbl.artists':  'Artistes',
      'glass.lbl.venues':   'Salles',
      'glass.lbl.promoters':'Promoteurs',
      'glass.lbl.platform': 'Plateforme iHYPE',
      'gov.eyebrow':     'Pourquoi c\'est le meilleur · 05 sur 05',
      'gov.h2':          'Propriété de la communauté. <em>Gouvernée par la scène.</em>',
      'gov.lede':        'Sans but lucratif est juste un statut fiscal. Ce qui rend une plateforme honnête, c\'est qui est au conseil d\'administration.',
      'gov.board.h':     'Le conseil · 9 sièges',
      'gov.board.lede':  'Huit sièges élus par les utilisateurs — deux par rôle. Un directeur général. Mandats de trois ans, maximum deux mandats.',
      'gov.rule1':       '<strong>Les changements d\'algorithme nécessitent l\'approbation du conseil</strong> et un changelog public.',
      'gov.rule2':       '<strong>Les règles de paiement ne peuvent pas changer</strong> sans vote du conseil.',
      'gov.rule3':       '<strong>Révocation par pétition.</strong> 25 % des électeurs de n\'importe quel rôle peuvent déclencher une révocation.',
      'gov.rule4':       '<strong>Plafond salarial du DG</strong> à 5× le salaire moyen de la plateforme.',
      'gov.pub.h':       'Ce que nous publions — régulièrement',
      'gov.pub.lede':    'De vrais documents à une cadence régulière. Pas des communiqués de presse.',
      'gov.pub.view':    'Voir →',
      'cta.h2':          'Rejoignez la plateforme qui existe <em>pour la scène.</em>',
      'cta.p':           'Gratuit pour toujours. Deux champs pour commencer. La musique que vous aimez devient plus forte quand vous le dites.',
      'cta.join':        'Rejoindre gratuitement, pour toujours',
      'cta.signin':      'J\'ai déjà un compte',
      'cta.foot':        '501(c)(3) · comptes ouverts · 0 $ commission · sans revente de données · propriété de la communauté',
      'footer.legal':    '501(c)(3) · comptes ouverts',
      'a11y.title':      'Accessibilité',
      'a11y.lang':       'Langue',
      'a11y.vision':     'Vision · taille du texte',
      'a11y.reading':    'Lecture',
      'a11y.dyslexia':   'Police pour dyslexie',
      'a11y.dyslexia.d': 'Plus d\'espace entre les lettres, hauteur de ligne plus grande',
      'a11y.contrast':   'Contraste élevé',
      'a11y.contrast.d': 'Bordures plus fortes, texte noir pur',
      'a11y.hearing':    'Audition',
      'a11y.captions':   'Sous-titres activés par défaut',
      'a11y.captions.d': 'Chaque concert, mix, vidéo',
      'a11y.visualad':   'Indicateur visuel de publicité',
      'a11y.visualad.d': 'Une bannière apparaît lors de la lecture de publicités audio',
      'a11y.motion':     'Mouvement et saisie',
      'a11y.reduced':    'Mouvement réduit',
      'a11y.reduced.d':  'Désactiver les animations',
      'a11y.targets':    'Zones tactiles plus grandes',
      'a11y.targets.d':  'Tous les éléments interactifs ≥ 48px',
      'a11y.foot':       'Les paramètres sont enregistrés automatiquement et vous suivent sur tous vos appareils lorsque vous êtes connecté.',
      'a11y.size.default': 'Par défaut',
      'a11y.size.large':   'Grand',
      'a11y.size.xl':      'TG',
    }
  };

  // ─── i18n engine ─────────────────────────────────────────────────────

  var currentLang = 'en';

  function t(key){
    var lang = STRINGS[currentLang] || STRINGS['en'];
    return (lang[key] !== undefined ? lang[key] : (STRINGS['en'][key] || key));
  }

  function applyTranslations(lang){
    currentLang = lang;
    // Update html lang attribute
    document.documentElement.lang = lang;

    // Swap all data-i18n text nodes
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      var str = t(key);
      // Use innerHTML for strings that contain <em>, <strong> etc.
      el.innerHTML = str;
    });

    // Sync all lang buttons across panels
    document.querySelectorAll('[data-lang]').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Persist
    try { localStorage.setItem('ihype-lang', lang); } catch(e){}
  }

  // Restore saved language
  function restoreLang(){
    try {
      var saved = localStorage.getItem('ihype-lang');
      // Also respect browser language as default if no preference saved
      if(!saved){
        var browserLang = (navigator.language || 'en').slice(0,2).toLowerCase();
        if(STRINGS[browserLang]) saved = browserLang;
      }
      if(saved && STRINGS[saved]) applyTranslations(saved);
    } catch(e){}
  }

  // ─── Accessibility helpers ───────────────────────────────────────────

  function applyToggle(name, on){
    var html = document.documentElement;
    if(name === 'dyslexia') html.classList.toggle('dyslexia-mode', on);
    if(name === 'contrast')  html.classList.toggle('high-contrast', on);
    if(name === 'motion')    html.classList.toggle('reduce-motion', on);
    document.querySelectorAll('[data-toggle="'+name+'"]').forEach(function(el){
      if(el.classList.contains('switch')){
        el.classList.toggle('on', on);
      }
    });
    try { localStorage.setItem('ihype-a11y-'+name, on ? '1' : '0'); } catch(e){}
  }

  function applySize(size){
    var html = document.documentElement;
    html.classList.remove('size-large','size-xlarge');
    if(size === 'large')  html.classList.add('size-large');
    if(size === 'xlarge') html.classList.add('size-xlarge');
    document.querySelectorAll('[data-size]').forEach(function(s){
      s.classList.toggle('active', s.dataset.size === size);
    });
    try { localStorage.setItem('ihype-a11y-size', size); } catch(e){}
  }

  function restore(){
    try {
      var size = localStorage.getItem('ihype-a11y-size');
      if(size) applySize(size);
      ['dyslexia','contrast','motion'].forEach(function(n){
        if(localStorage.getItem('ihype-a11y-'+n) === '1') applyToggle(n, true);
      });
    } catch(e){}
  }

  // ─── Wire up events after DOM ready ──────────────────────────────────

  function init(){
    restore();
    restoreLang();

    // Language buttons (data-lang on any button anywhere)
    document.querySelectorAll('[data-lang]').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyTranslations(btn.getAttribute('data-lang'));
      });
    });

    // Size radio groups
    document.querySelectorAll('.toggle-pair[role="radiogroup"], .toggle-pair[data-radio]').forEach(function(g){
      g.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          g.querySelectorAll('button').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          if(b.dataset.size) applySize(b.dataset.size);
        });
      });
    });

    // Switch toggles
    document.querySelectorAll('.switch').forEach(function(s){
      s.addEventListener('click', function(){
        s.classList.toggle('on');
        if(s.dataset.toggle) applyToggle(s.dataset.toggle, s.classList.contains('on'));
      });
    });

    // Multi-toggle option buttons
    document.querySelectorAll('button[data-toggle]:not(.switch)').forEach(function(b){
      b.addEventListener('click', function(){
        b.classList.toggle('active');
        applyToggle(b.dataset.toggle, b.classList.contains('active'));
      });
    });

    // Persistent panel open/close
    var panel   = document.getElementById('a11yPanel');
    var overlay = document.getElementById('a11yOverlay');
    var opener  = document.getElementById('openA11y');
    var closer  = document.getElementById('closeA11y');
    function openP(){ if(panel){ panel.classList.add('open'); overlay && overlay.classList.add('open'); }}
    function closeP(){ if(panel){ panel.classList.remove('open'); overlay && overlay.classList.remove('open'); }}
    opener  && opener.addEventListener('click', openP);
    closer  && closer.addEventListener('click', closeP);
    overlay && overlay.addEventListener('click', closeP);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && panel && panel.classList.contains('open')) closeP();
    });

    // OTP input auto-advance
    document.querySelectorAll('.otp-input').forEach(function(inp, i, arr){
      inp.addEventListener('input', function(){
        if(inp.value.length >= 1){
          inp.classList.add('filled');
          if(arr[i+1]) arr[i+1].focus();
        }
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !inp.value && arr[i-1]) arr[i-1].focus();
      });
    });

    // Generic tab groups
    document.querySelectorAll('[data-tabs]').forEach(function(group){
      var target = group.dataset.tabs;
      group.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          group.querySelectorAll('button').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          if(b.dataset.tab && target){
            document.querySelectorAll('[data-tab-content="'+target+'"]').forEach(function(c){
              c.style.display = (c.dataset.tabId === b.dataset.tab) ? '' : 'none';
            });
          }
        });
      });
    });
  }

  // Run after DOM is parsed
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
