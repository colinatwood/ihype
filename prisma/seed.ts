import {
  ConnectionRequestStatus,
  ConnectionRequestType,
  PrismaClient,
  ProfileType,
  Role,
  ShowStatus
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateTicketOrderPayouts, PROMOTER_POOL_PERCENT } from '../src/lib/ticketing';

const prisma = new PrismaClient();

async function upsertDemoUser({
  email,
  legacyEmail,
  name,
  passwordHash,
  role
}: {
  email: string;
  legacyEmail: string;
  name: string;
  passwordHash: string;
  role: Role;
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { email: legacyEmail }]
    }
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email,
        name,
        passwordHash,
        role,
        mfaSecret: null,
        mfaEnabledAt: null
      }
    });
  }

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      mfaSecret: null,
      mfaEnabledAt: null
    }
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('demo12345', 10);

  await prisma.mfaChallenge.deleteMany();

  const venueOwner = await upsertDemoUser({
    email: 'venue@ihype.org',
    legacyEmail: 'venue@hypewave.fm',
    name: 'Venue Owner',
    passwordHash,
    role: Role.VENUE
  });

  const djOwner = await upsertDemoUser({
    email: 'dj@ihype.org',
    legacyEmail: 'dj@hypewave.fm',
    name: 'DJ Echo',
    passwordHash,
    role: Role.DJ
  });

  const artistOwner = await upsertDemoUser({
    email: 'artist@ihype.org',
    legacyEmail: 'artist@hypewave.fm',
    name: 'Nova Pulse',
    passwordHash,
    role: Role.ARTIST
  });

  const fan = await upsertDemoUser({
    email: 'fan@ihype.org',
    legacyEmail: 'fan@hypewave.fm',
    name: 'Night Owl',
    passwordHash,
    role: Role.FAN
  });

  const pulseScoutFan = await upsertDemoUser({
    email: 'pulse-scout@ihype.org',
    legacyEmail: 'pulse-scout@hypewave.fm',
    name: 'Pulse Scout',
    passwordHash,
    role: Role.FAN
  });

  const midwestMoveFan = await upsertDemoUser({
    email: 'midwest-move@ihype.org',
    legacyEmail: 'midwest-move@hypewave.fm',
    name: 'Midwest Move',
    passwordHash,
    role: Role.FAN
  });

  const chicagoVenueOwner = await upsertDemoUser({
    email: 'chi-venue@ihype.org',
    legacyEmail: 'chi-venue@hypewave.fm',
    name: 'Lakefront Frequency',
    passwordHash,
    role: Role.VENUE
  });

  const chicagoArtistOwner = await upsertDemoUser({
    email: 'chi-artist@ihype.org',
    legacyEmail: 'chi-artist@hypewave.fm',
    name: 'South Loop Signal',
    passwordHash,
    role: Role.ARTIST
  });

  const regionalPromoterOwner = await upsertDemoUser({
    email: 'regional-promoter@ihype.org',
    legacyEmail: 'regional-promoter@hypewave.fm',
    name: 'Riverwest Echo',
    passwordHash,
    role: Role.DJ
  });

  const venue = await prisma.profile.upsert({
    where: { slug: 'neon-harbor' },
    update: {
      type: ProfileType.VENUE,
      name: 'Neon Harbor',
      headline: 'Brooklyn warehouse energy with room for the next breakout set.',
      bio: 'Warehouse venue streaming underground sets every weekend.',
      aboutContent: 'Neon Harbor is a raw room tuned for late arrivals, all-night sets, and artists who want the crowd close enough to feel every build.',
      requestContent: 'Recommend artists who can own a warehouse room, bring a real live concept, or fit a future livestream bill.',
      city: 'Brooklyn',
      stateRegion: 'NY',
      country: 'USA',
      postalCode: '11206',
      latitude: 40.7043,
      longitude: -73.9415,
      genres: ['House', 'Techno'],
      verified: true,
      ownerId: venueOwner.id,
      hypeCount: 33
    },
    create: {
      slug: 'neon-harbor',
      type: ProfileType.VENUE,
      name: 'Neon Harbor',
      headline: 'Brooklyn warehouse energy with room for the next breakout set.',
      bio: 'Warehouse venue streaming underground sets every weekend.',
      aboutContent: 'Neon Harbor is a raw room tuned for late arrivals, all-night sets, and artists who want the crowd close enough to feel every build.',
      requestContent: 'Recommend artists who can own a warehouse room, bring a real live concept, or fit a future livestream bill.',
      city: 'Brooklyn',
      stateRegion: 'NY',
      country: 'USA',
      postalCode: '11206',
      latitude: 40.7043,
      longitude: -73.9415,
      genres: ['House', 'Techno'],
      verified: true,
      ownerId: venueOwner.id,
      hypeCount: 33
    }
  });

  const dj = await prisma.profile.upsert({
    where: { slug: 'dj-echo' },
    update: {
      type: ProfileType.DJ,
      name: 'DJ Echo',
      headline: 'Promoting the kind of nights that linger after the lights come up.',
      bio: 'Late-night selector with a thing for analog drums and low ceilings.',
      aboutContent: 'DJ Echo builds sweaty, low-lit nights for people who want the groove to take its time and still land hard.',
      recommendContent: 'I recommend artists who can hold tension, build a room patiently, and make the visuals feel earned.',
      city: 'Berlin',
      stateRegion: 'Berlin',
      country: 'Germany',
      postalCode: '10117',
      latitude: 52.52,
      longitude: 13.405,
      genres: ['Techno', 'Electro'],
      songUploadCount: 14,
      verified: true,
      ownerId: djOwner.id,
      hypeCount: 21
    },
    create: {
      slug: 'dj-echo',
      type: ProfileType.DJ,
      name: 'DJ Echo',
      headline: 'Promoting the kind of nights that linger after the lights come up.',
      bio: 'Late-night selector with a thing for analog drums and low ceilings.',
      aboutContent: 'DJ Echo builds sweaty, low-lit nights for people who want the groove to take its time and still land hard.',
      recommendContent: 'I recommend artists who can hold tension, build a room patiently, and make the visuals feel earned.',
      city: 'Berlin',
      stateRegion: 'Berlin',
      country: 'Germany',
      postalCode: '10117',
      latitude: 52.52,
      longitude: 13.405,
      genres: ['Techno', 'Electro'],
      songUploadCount: 14,
      verified: true,
      ownerId: djOwner.id,
      hypeCount: 21
    }
  });

  const artist = await prisma.profile.upsert({
    where: { slug: 'nova-pulse' },
    update: {
      type: ProfileType.ARTIST,
      name: 'Nova Pulse',
      headline: 'Modular romance, skyline hooks, and a headline banner built for the next run.',
      bio: 'Hybrid live set artist blending synth-pop vocals and modular textures.',
      aboutContent: 'Nova Pulse builds songs for midnight drives, warehouse echoes, and the kind of stage lights that make a city feel close enough to touch.',
      journalContent: 'Journal update: locking a new visual direction, rewriting the encore, and keeping the synth rack just unstable enough to stay honest.',
      mediaContent:
        'Media notes: live session clips, press pull quotes, and a short-form performance reel all live here once the drop is ready.\n\nAfterglow Demo | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3 | Late-night single draft\nCityline Rework | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3 | Rooftop arrangement pass',
      tourContent: 'Tour notes: routing West Coast rooftops, warehouse one-offs, and festival side stages for the next chapter.',
      merchContent: 'Merch notes: limited-run tees, signed test pressings, and a soft-launch capsule tied to the next single.',
      city: 'Los Angeles',
      stateRegion: 'CA',
      country: 'USA',
      postalCode: '90012',
      latitude: 34.0537,
      longitude: -118.2428,
      genres: ['Synth Pop', 'Indie Electronic'],
      songUploadCount: 19,
      verified: true,
      ownerId: artistOwner.id,
      hypeCount: 28
    },
    create: {
      slug: 'nova-pulse',
      type: ProfileType.ARTIST,
      name: 'Nova Pulse',
      headline: 'Modular romance, skyline hooks, and a headline banner built for the next run.',
      bio: 'Hybrid live set artist blending synth-pop vocals and modular textures.',
      aboutContent: 'Nova Pulse builds songs for midnight drives, warehouse echoes, and the kind of stage lights that make a city feel close enough to touch.',
      journalContent: 'Journal update: locking a new visual direction, rewriting the encore, and keeping the synth rack just unstable enough to stay honest.',
      mediaContent:
        'Media notes: live session clips, press pull quotes, and a short-form performance reel all live here once the drop is ready.\n\nAfterglow Demo | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3 | Late-night single draft\nCityline Rework | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3 | Rooftop arrangement pass',
      tourContent: 'Tour notes: routing West Coast rooftops, warehouse one-offs, and festival side stages for the next chapter.',
      merchContent: 'Merch notes: limited-run tees, signed test pressings, and a soft-launch capsule tied to the next single.',
      city: 'Los Angeles',
      stateRegion: 'CA',
      country: 'USA',
      postalCode: '90012',
      latitude: 34.0537,
      longitude: -118.2428,
      genres: ['Synth Pop', 'Indie Electronic'],
      songUploadCount: 19,
      verified: true,
      ownerId: artistOwner.id,
      hypeCount: 28
    }
  });

  const listener = await prisma.profile.upsert({
    where: { slug: 'night-owl' },
    update: {
      type: ProfileType.LISTENER,
      name: 'Night Owl',
      headline: 'Collecting favorite sets, favorite rooms, and the artists who keep the week alive.',
      bio: 'Listener page for cataloging favorite nights, saved shows, and a personal top 5.',
      aboutContent: 'Night Owl chases rooftops, after-hours sets, and synth lines that feel brighter the later it gets.',
      topFiveContent: '1. Nova Pulse\n2. DJ Echo\n3. Neon Harbor\n4. Midnight Frequency Live\n5. Rooftop sessions with weather problems',
      city: 'New York',
      stateRegion: 'NY',
      country: 'USA',
      postalCode: '10003',
      latitude: 40.7314,
      longitude: -73.9897,
      genres: ['Indie Electronic', 'Techno', 'Synth Pop'],
      ownerId: fan.id,
      hypeCount: 12
    },
    create: {
      slug: 'night-owl',
      type: ProfileType.LISTENER,
      name: 'Night Owl',
      headline: 'Collecting favorite sets, favorite rooms, and the artists who keep the week alive.',
      bio: 'Listener page for cataloging favorite nights, saved shows, and a personal top 5.',
      aboutContent: 'Night Owl chases rooftops, after-hours sets, and synth lines that feel brighter the later it gets.',
      topFiveContent: '1. Nova Pulse\n2. DJ Echo\n3. Neon Harbor\n4. Midnight Frequency Live\n5. Rooftop sessions with weather problems',
      city: 'New York',
      stateRegion: 'NY',
      country: 'USA',
      postalCode: '10003',
      latitude: 40.7314,
      longitude: -73.9897,
      genres: ['Indie Electronic', 'Techno', 'Synth Pop'],
      ownerId: fan.id,
      hypeCount: 12
    }
  });

  const pulseScout = await prisma.profile.upsert({
    where: { slug: 'pulse-scout' },
    update: {
      type: ProfileType.LISTENER,
      name: 'Pulse Scout',
      headline: 'Tracking the next city that starts bubbling before everybody else notices.',
      bio: 'Listener page focused on live discovery, venue scouting, and regional crossover nights.',
      aboutContent: 'Pulse Scout keeps tabs on rooms, lineups, and artists that feel one booking away from turning local momentum into a national run.',
      topFiveContent: '1. South Loop Signal\n2. Lakefront Frequency\n3. Riverwest Echo\n4. CHI Riverline Live\n5. Nova Pulse Rooftop Session',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60614',
      latitude: 41.9227,
      longitude: -87.6533,
      genres: ['House', 'Indie Electronic'],
      ownerId: pulseScoutFan.id,
      hypeCount: 9
    },
    create: {
      slug: 'pulse-scout',
      type: ProfileType.LISTENER,
      name: 'Pulse Scout',
      headline: 'Tracking the next city that starts bubbling before everybody else notices.',
      bio: 'Listener page focused on live discovery, venue scouting, and regional crossover nights.',
      aboutContent: 'Pulse Scout keeps tabs on rooms, lineups, and artists that feel one booking away from turning local momentum into a national run.',
      topFiveContent: '1. South Loop Signal\n2. Lakefront Frequency\n3. Riverwest Echo\n4. CHI Riverline Live\n5. Nova Pulse Rooftop Session',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60614',
      latitude: 41.9227,
      longitude: -87.6533,
      genres: ['House', 'Indie Electronic'],
      ownerId: pulseScoutFan.id,
      hypeCount: 9
    }
  });

  const midwestMove = await prisma.profile.upsert({
    where: { slug: 'midwest-move' },
    update: {
      type: ProfileType.LISTENER,
      name: 'Midwest Move',
      headline: 'Following the rooms, routes, and crossover bills that connect the region.',
      bio: 'Listener page tuned for warehouse calendars, travel weekends, and repeat-booking energy.',
      aboutContent: 'Midwest Move follows artists and venues that can move a crowd across Chicago, Milwaukee, and Detroit without losing the local feel.',
      topFiveContent: '1. Riverwest Echo\n2. Midwest Afterglow Session\n3. Neon Harbor\n4. South Loop Signal\n5. After Hours Archive',
      city: 'Milwaukee',
      stateRegion: 'WI',
      country: 'USA',
      postalCode: '53202',
      latitude: 43.0447,
      longitude: -87.9073,
      genres: ['House', 'Techno'],
      ownerId: midwestMoveFan.id,
      hypeCount: 7
    },
    create: {
      slug: 'midwest-move',
      type: ProfileType.LISTENER,
      name: 'Midwest Move',
      headline: 'Following the rooms, routes, and crossover bills that connect the region.',
      bio: 'Listener page tuned for warehouse calendars, travel weekends, and repeat-booking energy.',
      aboutContent: 'Midwest Move follows artists and venues that can move a crowd across Chicago, Milwaukee, and Detroit without losing the local feel.',
      topFiveContent: '1. Riverwest Echo\n2. Midwest Afterglow Session\n3. Neon Harbor\n4. South Loop Signal\n5. After Hours Archive',
      city: 'Milwaukee',
      stateRegion: 'WI',
      country: 'USA',
      postalCode: '53202',
      latitude: 43.0447,
      longitude: -87.9073,
      genres: ['House', 'Techno'],
      ownerId: midwestMoveFan.id,
      hypeCount: 7
    }
  });

  const chicagoVenue = await prisma.profile.upsert({
    where: { slug: 'lakefront-frequency' },
    update: {
      type: ProfileType.VENUE,
      name: 'Lakefront Frequency',
      headline: 'Chicago open-air energy with enough room for a headline livestream and a neighborhood crowd.',
      bio: 'Chicago venue profile for riverfront sets, outdoor broadcasts, and city-scale launch nights.',
      aboutContent: 'Lakefront Frequency is built for skyline broadcasts, dance-floor airflow, and Chicago crowds that show up early when the right signal hits.',
      requestContent: 'Recommend artists who can hold an outdoor room, travel well across the Midwest, and convert stream momentum into a real booking.',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60601',
      latitude: 41.8853,
      longitude: -87.6216,
      genres: ['House', 'Indie Electronic'],
      verified: true,
      ownerId: chicagoVenueOwner.id,
      hypeCount: 41
    },
    create: {
      slug: 'lakefront-frequency',
      type: ProfileType.VENUE,
      name: 'Lakefront Frequency',
      headline: 'Chicago open-air energy with enough room for a headline livestream and a neighborhood crowd.',
      bio: 'Chicago venue profile for riverfront sets, outdoor broadcasts, and city-scale launch nights.',
      aboutContent: 'Lakefront Frequency is built for skyline broadcasts, dance-floor airflow, and Chicago crowds that show up early when the right signal hits.',
      requestContent: 'Recommend artists who can hold an outdoor room, travel well across the Midwest, and convert stream momentum into a real booking.',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60601',
      latitude: 41.8853,
      longitude: -87.6216,
      genres: ['House', 'Indie Electronic'],
      verified: true,
      ownerId: chicagoVenueOwner.id,
      hypeCount: 41
    }
  });

  const chicagoArtist = await prisma.profile.upsert({
    where: { slug: 'south-loop-signal' },
    update: {
      type: ProfileType.ARTIST,
      name: 'South Loop Signal',
      headline: 'Chicago-built club pressure with enough melody to travel past the skyline.',
      bio: 'Live electronic artist building Chicago headline sets with a house-driven pulse.',
      aboutContent: 'South Loop Signal fuses house, synth textures, and city-night pacing into sets built for rooftops, riverwalks, and the first serious festival slot.',
      journalContent: 'Chicago diary: testing a wider live rig, cutting a faster encore, and building toward a hometown launch night.',
      mediaContent:
        'Media notes: skyline rehearsal clips, local press pull quotes, and teaser edits for the next Chicago date.\n\nLakefront Pressure | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3 | Chicago club mix\nRed Line Lights | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3 | Warehouse test version',
      tourContent: 'Tour notes: Chicago first, Midwest second, then expanding outward once the local signal is undeniable.',
      merchContent: 'Merch notes: reflective tees, signed posters, and a limited city capsule tied to the launch event.',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60605',
      latitude: 41.8679,
      longitude: -87.6243,
      genres: ['House', 'Electronic'],
      songUploadCount: 11,
      verified: true,
      ownerId: chicagoArtistOwner.id,
      hypeCount: 35
    },
    create: {
      slug: 'south-loop-signal',
      type: ProfileType.ARTIST,
      name: 'South Loop Signal',
      headline: 'Chicago-built club pressure with enough melody to travel past the skyline.',
      bio: 'Live electronic artist building Chicago headline sets with a house-driven pulse.',
      aboutContent: 'South Loop Signal fuses house, synth textures, and city-night pacing into sets built for rooftops, riverwalks, and the first serious festival slot.',
      journalContent: 'Chicago diary: testing a wider live rig, cutting a faster encore, and building toward a hometown launch night.',
      mediaContent:
        'Media notes: skyline rehearsal clips, local press pull quotes, and teaser edits for the next Chicago date.\n\nLakefront Pressure | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3 | Chicago club mix\nRed Line Lights | https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3 | Warehouse test version',
      tourContent: 'Tour notes: Chicago first, Midwest second, then expanding outward once the local signal is undeniable.',
      merchContent: 'Merch notes: reflective tees, signed posters, and a limited city capsule tied to the launch event.',
      city: 'Chicago',
      stateRegion: 'IL',
      country: 'USA',
      postalCode: '60605',
      latitude: 41.8679,
      longitude: -87.6243,
      genres: ['House', 'Electronic'],
      songUploadCount: 11,
      verified: true,
      ownerId: chicagoArtistOwner.id,
      hypeCount: 35
    }
  });

  const regionalPromoter = await prisma.profile.upsert({
    where: { slug: 'riverwest-echo' },
    update: {
      type: ProfileType.DJ,
      name: 'Riverwest Echo',
      headline: 'Milwaukee promoter energy with enough reach to move a Midwest weekend.',
      bio: 'Midwest promoter profile connecting warehouse shows, regional listeners, and city-to-city momentum.',
      aboutContent: 'Riverwest Echo specializes in routing artists between Chicago, Milwaukee, Detroit, and every room that can turn regional demand into a real crowd.',
      recommendContent: 'Recommend artists who can travel well across the Midwest and build demand between local scenes.',
      city: 'Milwaukee',
      stateRegion: 'WI',
      country: 'USA',
      postalCode: '53212',
      latitude: 43.0586,
      longitude: -87.8986,
      genres: ['House', 'Techno'],
      songUploadCount: 8,
      verified: true,
      ownerId: regionalPromoterOwner.id,
      hypeCount: 18
    },
    create: {
      slug: 'riverwest-echo',
      type: ProfileType.DJ,
      name: 'Riverwest Echo',
      headline: 'Milwaukee promoter energy with enough reach to move a Midwest weekend.',
      bio: 'Midwest promoter profile connecting warehouse shows, regional listeners, and city-to-city momentum.',
      aboutContent: 'Riverwest Echo specializes in routing artists between Chicago, Milwaukee, Detroit, and every room that can turn regional demand into a real crowd.',
      recommendContent: 'Recommend artists who can travel well across the Midwest and build demand between local scenes.',
      city: 'Milwaukee',
      stateRegion: 'WI',
      country: 'USA',
      postalCode: '53212',
      latitude: 43.0586,
      longitude: -87.8986,
      genres: ['House', 'Techno'],
      songUploadCount: 8,
      verified: true,
      ownerId: regionalPromoterOwner.id,
      hypeCount: 18
    }
  });

  const liveShow = await prisma.show.upsert({
    where: { slug: 'midnight-frequency-live' },
    update: {
      title: 'Midnight Frequency Live',
      description: 'A live streamed back-to-back set with visualizers and audience chat.',
      status: ShowStatus.LIVE,
      startsAt: new Date(Date.now() - 30 * 60 * 1000),
      creatorId: djOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: dj.id,
      promoterProfileId: dj.id,
      streamProvider: 'Mux',
      streamPlaybackId: 'demo-playback-id',
      streamKeyMasked: '****demo',
      isTicketed: true,
      ticketPriceCents: 3200,
      ticketCapacity: 260,
      venuePayoutPercent: 50,
      artistPayoutPercent: 45,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['live', 'techno', 'warehouse'],
      ticketsSoldCount: 184,
      hypeCount: 54
    },
    create: {
      slug: 'midnight-frequency-live',
      title: 'Midnight Frequency Live',
      description: 'A live streamed back-to-back set with visualizers and audience chat.',
      status: ShowStatus.LIVE,
      startsAt: new Date(Date.now() - 30 * 60 * 1000),
      creatorId: djOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: dj.id,
      promoterProfileId: dj.id,
      streamProvider: 'Mux',
      streamPlaybackId: 'demo-playback-id',
      streamKeyMasked: '****demo',
      isTicketed: true,
      ticketPriceCents: 3200,
      ticketCapacity: 260,
      venuePayoutPercent: 50,
      artistPayoutPercent: 45,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['live', 'techno', 'warehouse'],
      ticketsSoldCount: 184,
      hypeCount: 54
    }
  });

  const rooftopShow = await prisma.show.upsert({
    where: { slug: 'nova-pulse-rooftop-session' },
    update: {
      title: 'Nova Pulse Rooftop Session',
      description: 'Sunset livestream from a downtown rooftop with guest visuals.',
      status: ShowStatus.SCHEDULED,
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      creatorId: artistOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: artist.id,
      promoterProfileId: dj.id,
      isTicketed: true,
      ticketPriceCents: 2800,
      ticketCapacity: 180,
      venuePayoutPercent: 42,
      artistPayoutPercent: 53,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['scheduled', 'indie', 'rooftop'],
      ticketsSoldCount: 126,
      hypeCount: 37
    },
    create: {
      slug: 'nova-pulse-rooftop-session',
      title: 'Nova Pulse Rooftop Session',
      description: 'Sunset livestream from a downtown rooftop with guest visuals.',
      status: ShowStatus.SCHEDULED,
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      creatorId: artistOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: artist.id,
      promoterProfileId: dj.id,
      isTicketed: true,
      ticketPriceCents: 2800,
      ticketCapacity: 180,
      venuePayoutPercent: 42,
      artistPayoutPercent: 53,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['scheduled', 'indie', 'rooftop'],
      ticketsSoldCount: 126,
      hypeCount: 37
    }
  });

  const chicagoLiveShow = await prisma.show.upsert({
    where: { slug: 'chi-riverline-live' },
    update: {
      title: 'CHI Riverline Live',
      description: 'Chicago riverfront livestream with a hometown crowd and skyline visuals.',
      status: ShowStatus.LIVE,
      startsAt: new Date(Date.now() - 15 * 60 * 1000),
      creatorId: chicagoArtistOwner.id,
      venueProfileId: chicagoVenue.id,
      headlinerProfileId: chicagoArtist.id,
      promoterProfileId: regionalPromoter.id,
      isTicketed: true,
      ticketPriceCents: 3500,
      ticketCapacity: 400,
      venuePayoutPercent: 48,
      artistPayoutPercent: 47,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['live', 'chicago', 'house'],
      ticketsSoldCount: 342,
      hypeCount: 61
    },
    create: {
      slug: 'chi-riverline-live',
      title: 'CHI Riverline Live',
      description: 'Chicago riverfront livestream with a hometown crowd and skyline visuals.',
      status: ShowStatus.LIVE,
      startsAt: new Date(Date.now() - 15 * 60 * 1000),
      creatorId: chicagoArtistOwner.id,
      venueProfileId: chicagoVenue.id,
      headlinerProfileId: chicagoArtist.id,
      promoterProfileId: regionalPromoter.id,
      isTicketed: true,
      ticketPriceCents: 3500,
      ticketCapacity: 400,
      venuePayoutPercent: 48,
      artistPayoutPercent: 47,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['live', 'chicago', 'house'],
      ticketsSoldCount: 342,
      hypeCount: 61
    }
  });

  const midwestShow = await prisma.show.upsert({
    where: { slug: 'midwest-afterglow-session' },
    update: {
      title: 'Midwest Afterglow Session',
      description: 'Regional crossover set linking Chicago and Milwaukee audiences.',
      status: ShowStatus.SCHEDULED,
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      creatorId: regionalPromoterOwner.id,
      venueProfileId: chicagoVenue.id,
      headlinerProfileId: regionalPromoter.id,
      promoterProfileId: regionalPromoter.id,
      isTicketed: true,
      ticketPriceCents: 2400,
      ticketCapacity: 150,
      venuePayoutPercent: 55,
      artistPayoutPercent: 40,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['scheduled', 'midwest', 'regional'],
      ticketsSoldCount: 98,
      hypeCount: 27
    },
    create: {
      slug: 'midwest-afterglow-session',
      title: 'Midwest Afterglow Session',
      description: 'Regional crossover set linking Chicago and Milwaukee audiences.',
      status: ShowStatus.SCHEDULED,
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      creatorId: regionalPromoterOwner.id,
      venueProfileId: chicagoVenue.id,
      headlinerProfileId: regionalPromoter.id,
      promoterProfileId: regionalPromoter.id,
      isTicketed: true,
      ticketPriceCents: 2400,
      ticketCapacity: 150,
      venuePayoutPercent: 55,
      artistPayoutPercent: 40,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['scheduled', 'midwest', 'regional'],
      ticketsSoldCount: 98,
      hypeCount: 27
    }
  });

  const archiveShow = await prisma.show.upsert({
    where: { slug: 'after-hours-archive' },
    update: {
      title: 'After Hours Archive',
      description: 'A recorded late-night session that already finished its run.',
      status: ShowStatus.ENDED,
      startsAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      creatorId: djOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: dj.id,
      promoterProfileId: dj.id,
      isTicketed: true,
      ticketPriceCents: 1800,
      ticketCapacity: 240,
      venuePayoutPercent: 50,
      artistPayoutPercent: 45,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['archive', 'late-night'],
      ticketsSoldCount: 211,
      hypeCount: 19
    },
    create: {
      slug: 'after-hours-archive',
      title: 'After Hours Archive',
      description: 'A recorded late-night session that already finished its run.',
      status: ShowStatus.ENDED,
      startsAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      creatorId: djOwner.id,
      venueProfileId: venue.id,
      headlinerProfileId: dj.id,
      promoterProfileId: dj.id,
      isTicketed: true,
      ticketPriceCents: 1800,
      ticketCapacity: 240,
      venuePayoutPercent: 50,
      artistPayoutPercent: 45,
      promoterPayoutPercent: PROMOTER_POOL_PERCENT,
      tags: ['archive', 'late-night'],
      ticketsSoldCount: 211,
      hypeCount: 19
    }
  });

  await prisma.hypeEvent.upsert({
    where: { userId_showId: { userId: fan.id, showId: liveShow.id } },
    update: {},
    create: { userId: fan.id, showId: liveShow.id }
  });

  await prisma.hypeEvent.upsert({
    where: { userId_showId: { userId: fan.id, showId: archiveShow.id } },
    update: {},
    create: { userId: fan.id, showId: archiveShow.id }
  });

  await prisma.hypeEvent.upsert({
    where: { userId_showId: { userId: fan.id, showId: chicagoLiveShow.id } },
    update: {},
    create: { userId: fan.id, showId: chicagoLiveShow.id }
  });

  await prisma.hypeEvent.upsert({
    where: { userId_showId: { userId: pulseScoutFan.id, showId: chicagoLiveShow.id } },
    update: {},
    create: { userId: pulseScoutFan.id, showId: chicagoLiveShow.id }
  });

  await prisma.hypeEvent.upsert({
    where: { userId_showId: { userId: midwestMoveFan.id, showId: liveShow.id } },
    update: {},
    create: { userId: midwestMoveFan.id, showId: liveShow.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: fan.id, profileId: artist.id } },
    update: {},
    create: { userId: fan.id, profileId: artist.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: fan.id, profileId: venue.id } },
    update: {},
    create: { userId: fan.id, profileId: venue.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: artistOwner.id, profileId: listener.id } },
    update: {},
    create: { userId: artistOwner.id, profileId: listener.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: fan.id, profileId: chicagoArtist.id } },
    update: {},
    create: { userId: fan.id, profileId: chicagoArtist.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: fan.id, profileId: chicagoVenue.id } },
    update: {},
    create: { userId: fan.id, profileId: chicagoVenue.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: pulseScoutFan.id, profileId: chicagoArtist.id } },
    update: {},
    create: { userId: pulseScoutFan.id, profileId: chicagoArtist.id }
  });

  await prisma.profileHypeEvent.upsert({
    where: { userId_profileId: { userId: midwestMoveFan.id, profileId: regionalPromoter.id } },
    update: {},
    create: { userId: midwestMoveFan.id, profileId: regionalPromoter.id }
  });

  await prisma.venueConnectionRequest.deleteMany({
    where: { venueProfileId: venue.id }
  });

  await prisma.venueConnectionRequest.deleteMany({
    where: { venueProfileId: chicagoVenue.id }
  });

  await prisma.venueConnectionRequest.createMany({
    data: [
      {
        venueProfileId: venue.id,
        artistProfileId: artist.id,
        requesterId: fan.id,
        requesterType: ConnectionRequestType.LISTENER,
        status: ConnectionRequestStatus.BOOKED,
        artistName: artist.name,
        note: 'Recommend booking this band for a melodic live set. Let me know when you do.',
        notifyOnBooking: true,
        respondedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        venueProfileId: venue.id,
        artistProfileId: dj.id,
        requesterId: djOwner.id,
        requesterType: ConnectionRequestType.PROMOTER,
        status: ConnectionRequestStatus.PENDING,
        artistName: dj.name,
        note: 'I can help move a late-night crowd for this artist and promote the stream once the date is locked.',
        notifyOnBooking: true
      }
    ]
  });

  await prisma.venueConnectionRequest.createMany({
    data: [
      {
        venueProfileId: chicagoVenue.id,
        artistProfileId: chicagoArtist.id,
        requesterId: fan.id,
        requesterType: ConnectionRequestType.LISTENER,
        status: ConnectionRequestStatus.PENDING,
        artistName: chicagoArtist.name,
        note: 'Chicago needs this artist on the next riverfront bill. Let me know when you lock it.',
        notifyOnBooking: true
      },
      {
        venueProfileId: chicagoVenue.id,
        artistProfileId: regionalPromoter.id,
        requesterId: regionalPromoterOwner.id,
        requesterType: ConnectionRequestType.PROMOTER,
        status: ConnectionRequestStatus.BOOKED,
        artistName: regionalPromoter.name,
        note: 'Regional crowd already exists for this crossover set. We can move Milwaukee listeners into Chicago for the date.',
        notifyOnBooking: true,
        respondedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ]
  });

  await prisma.ticketOrder.deleteMany({
    where: {
      showId: {
        in: [liveShow.id, rooftopShow.id, chicagoLiveShow.id, midwestShow.id, archiveShow.id]
      }
    }
  });

  const orderDefinitions = [
    { show: liveShow, buyerName: 'Night Owl', buyerEmail: 'fan@ihype.org', quantity: 72 },
    { show: liveShow, buyerName: 'Pulse Scout', buyerEmail: 'pulse-scout@ihype.org', quantity: 58 },
    { show: liveShow, buyerName: 'Midwest Move', buyerEmail: 'midwest-move@ihype.org', quantity: 54 },
    { show: rooftopShow, buyerName: 'Night Owl', buyerEmail: 'fan@ihype.org', quantity: 44 },
    { show: rooftopShow, buyerName: 'Pulse Scout', buyerEmail: 'pulse-scout@ihype.org', quantity: 38 },
    { show: rooftopShow, buyerName: 'Midwest Move', buyerEmail: 'midwest-move@ihype.org', quantity: 44 },
    { show: chicagoLiveShow, buyerName: 'Night Owl', buyerEmail: 'fan@ihype.org', quantity: 140 },
    { show: chicagoLiveShow, buyerName: 'Pulse Scout', buyerEmail: 'pulse-scout@ihype.org', quantity: 112 },
    { show: chicagoLiveShow, buyerName: 'Midwest Move', buyerEmail: 'midwest-move@ihype.org', quantity: 90 },
    { show: midwestShow, buyerName: 'Night Owl', buyerEmail: 'fan@ihype.org', quantity: 34 },
    { show: midwestShow, buyerName: 'Pulse Scout', buyerEmail: 'pulse-scout@ihype.org', quantity: 28 },
    { show: midwestShow, buyerName: 'Midwest Move', buyerEmail: 'midwest-move@ihype.org', quantity: 36 },
    { show: archiveShow, buyerName: 'Night Owl', buyerEmail: 'fan@ihype.org', quantity: 71 },
    { show: archiveShow, buyerName: 'Pulse Scout', buyerEmail: 'pulse-scout@ihype.org', quantity: 68 },
    { show: archiveShow, buyerName: 'Midwest Move', buyerEmail: 'midwest-move@ihype.org', quantity: 72 }
  ].map(({ show, buyerName, buyerEmail, quantity }, index) => {
    const payouts = calculateTicketOrderPayouts({
      ticketPriceCents: show.ticketPriceCents,
      quantity,
      venuePayoutPercent: show.venuePayoutPercent ?? 0,
      artistPayoutPercent: show.artistPayoutPercent ?? 0,
      promoterPayoutPercent: show.promoterPayoutPercent
    });

    return {
      confirmationCode: `DEMO-${index + 1}`,
      showId: show.id,
      buyerName,
      buyerEmail,
      quantity,
      subtotalCents: payouts.subtotalCents,
      venuePayoutCents: payouts.venuePayoutCents,
      artistPayoutCents: payouts.artistPayoutCents,
      promoterPayoutCents: payouts.promoterPayoutCents
    };
  });

  await prisma.ticketOrder.createMany({
    data: orderDefinitions
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
