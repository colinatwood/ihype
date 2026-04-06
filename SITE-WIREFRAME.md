# iHYPE Site Wireframe

## Product Flow

```mermaid
flowchart TD
    HOME["/  About iHYPE"] --> AUTH["/login  |  /register"]
    AUTH --> FAN_DISCOVER["/fans"]
    AUTH --> ARTIST_DISCOVER["/artists"]
    AUTH --> PROMOTER_DISCOVER["/promoters"]
    AUTH --> VENUE_DISCOVER["/venues"]

    FAN_DISCOVER --> FAN_PAGE["/fans/[slug]"]
    FAN_DISCOVER --> FAN_DASH["/dashboard  fan editor"]

    ARTIST_DISCOVER --> ARTIST_PAGE["/artists/[slug]"]
    ARTIST_DISCOVER --> ARTIST_DASH["/dashboard  artist builder"]

    PROMOTER_DISCOVER --> PROMOTER_PAGE["/promoters/[slug]"]
    PROMOTER_DISCOVER --> PROMOTER_DASH["/dashboard  promoter builder"]
    PROMOTER_DISCOVER --> SHOWS["/shows"]

    VENUE_DISCOVER --> VENUE_PAGE["/venues/[slug]"]
    VENUE_DISCOVER --> VENUE_DASH["/dashboard  venue builder"]
    VENUE_DISCOVER --> SHOWS

    SHOWS --> SHOW_DETAIL["/shows/[slug]"]
    SHOW_DETAIL --> TICKET["/tickets/[serializedId]"]
```

## Shared Shell

```text
+----------------------------------------------------------------------------------+
| iHYPE.org logo | centered media player | role/page cue | auth / dashboard links |
+----------------------------------------------------------------------------------+
| role subheader: My Page | Discover | Stats | Events / creator tools              |
+----------------------------------------------------------------------------------+
| selected module only                                                             |
+----------------------------------------------------------------------------------+
```

## Home

```text
+----------------------------------------------------------------------------------+
| ABOUT IHYPE                                                                      |
| mission / positioning / why the platform exists                                  |
| concise links to Sign In and Sign Up                                             |
+----------------------------------------------------------------------------------+
```

## Login

```text
+-------------------------------------------------------------+
| Sign In                                                     |
| email / username                                            |
| password                                                    |
| submit                                                      |
| optional password reset flow                                |
+-------------------------------------------------------------+
```

## Sign Up

```text
+----------------------------------------------------------------------------------+
| Choose account type: Fan | Artist | Promoter | Venue                             |
+----------------------------------------------------------------------------------+
| role-specific signup form                                                        |
| minimal required fields                                                          |
| create account                                                                   |
+----------------------------------------------------------------------------------+
```

## Discover Pages

### Fans

```text
+----------------------------------------------------------------------------------+
| subheader: My Page | Discover | Stats | Events                                   |
+----------------------------------------------------------------------------------+
| Discover                                                                          |
| what's hyped near me | new artists | new promoters                               |
| search by song / artist / promoter / venue / place                               |
| integrated globe browse for artists and venues                                   |
+----------------------------------------------------------------------------------+
```

### Artists

```text
+----------------------------------------------------------------------------------+
| subheader: My Page | Discover | Stats | Events                                   |
+----------------------------------------------------------------------------------+
| Discover                                                                          |
| audience discovery, nearby hype, new artists, new promoters                      |
| search + globe browse                                                             |
+----------------------------------------------------------------------------------+
```

### Promoters

```text
+----------------------------------------------------------------------------------+
| subheader: My Page | Discover | Stats | Show Creator | Events                    |
+----------------------------------------------------------------------------------+
| Discover                                                                          |
| local scene signal, artist search, venue search, globe browse                    |
+----------------------------------------------------------------------------------+
```

### Venues

```text
+----------------------------------------------------------------------------------+
| subheader: My Page | Discover | Stats | Events                                   |
+----------------------------------------------------------------------------------+
| Discover                                                                          |
| local demand, artist discovery, promoter discovery, globe browse                 |
+----------------------------------------------------------------------------------+
```

## Public Profile Pages

### Fan Page

```text
+----------------------------------------------------------------------------------+
| hero banner | fan identity | hype / fan level | Edit Page for owner              |
+----------------------------------------------------------------------------------+
| page tabs: About | Recommend | Upcoming | Previous | Top 5 | Stats               |
+----------------------------------------------------------------------------------+
| selected tab content only                                                        |
+----------------------------------------------------------------------------------+
```

### Artist Page

```text
+----------------------------------------------------------------------------------+
| hero banner | artist identity | hype | Book me ready tag when qualified          |
+----------------------------------------------------------------------------------+
| page tabs: About | Media | Tour | Merch                                         |
+----------------------------------------------------------------------------------+
| selected tab content only                                                        |
+----------------------------------------------------------------------------------+
```

### Promoter Page

```text
+----------------------------------------------------------------------------------+
| hero banner | promoter identity | hype                                           |
+----------------------------------------------------------------------------------+
| page tabs: About | Shows | Events                                                |
+----------------------------------------------------------------------------------+
| selected tab content only                                                        |
+----------------------------------------------------------------------------------+
```

### Venue Page

```text
+----------------------------------------------------------------------------------+
| hero banner | venue identity | hype                                              |
+----------------------------------------------------------------------------------+
| page tabs: About | Upcoming Shows | Request Artist                                |
+----------------------------------------------------------------------------------+
| selected tab content only                                                        |
+----------------------------------------------------------------------------------+
```

## Dashboard Edit Studio

```text
+----------------------------------------------------------------------------------+
| profile banner / current page identity / quick actions                           |
+----------------------------------------------------------------------------------+
| role-specific editor module only                                                 |
| fan: My Scheme | Top 5 | Event History                                           |
| artist: quick start builder or full artist page builder                          |
| promoter: promoter page builder                                                  |
| venue: venue page builder                                                        |
+----------------------------------------------------------------------------------+
| live preview / save draft / launch                                               |
+----------------------------------------------------------------------------------+
```

## Shows + Ticketing

### Shows Index

```text
+----------------------------------------------------------------------------------+
| current and upcoming shows                                                       |
| filters / browse                                                                 |
+----------------------------------------------------------------------------------+
```

### Show Detail

```text
+----------------------------------------------------------------------------------+
| show hero | artist / venue / promoter context                                    |
+----------------------------------------------------------------------------------+
| playback / stream area                                                           |
| hype controls                                                                    |
| ticket sale card                                                                 |
+----------------------------------------------------------------------------------+
```

### Ticket

```text
+----------------------------------------------------------------------------------+
| serialized ticket ID                                                             |
| QR code                                                                          |
| owner / reassignment state                                                       |
| scan validity                                                                    |
+----------------------------------------------------------------------------------+
```

## User-Facing Route Inventory

```text
/
/login
/register
/register/fan
/register/artist
/register/promoter
/register/venue
/dashboard
/fans
/fans/[slug]
/artists
/artists/[slug]
/promoters
/promoters/[slug]
/venues
/venues/[slug]
/shows
/shows/[slug]
/tickets/[serializedId]
/profiles/[hexId]
```

## Key Supporting APIs

```text
/api/register
/api/profile-pages/[id]
/api/artist-media
/api/fan-playlists
/api/fan-favorites
/api/shows
/api/shows/[showId]/tickets
/api/shows/[showId]/ticketing/open
/api/show-listens
/api/media-listens
/api/tickets/[serializedId]/scan
/api/tickets/[serializedId]/reassign
```
