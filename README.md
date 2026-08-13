#  for the record — app structure

app/
├── (tabs)/              # tab navigation screens
│   ├── _layout.tsx      # tab navigator config
│   ├── index.tsx        # home / archive view
│   ├── new.tsx          # add new media record
│   └── profile.tsx      # user profile
├── media/
│   └── [id].tsx         # individual media detail page
├── _layout.tsx          # root layout (auth wrapper)
├── auth.tsx             # sign in / register
└── index.tsx            # splash screen

assets/fonts/            # custom typography
├── BeVietnamPro-*.ttf
└── Qilka-Bold.otf

components/              # reusable UI
├── AuthProvider.tsx
└── header.tsx

lib/                     # utilities & types
├── supabase.ts
└── types.ts

#  for the record

a little place for everything you watched.

##  about

**for the record** is a personal media diary app where you can track, rate, and review everything you watch — movies, series, documentaries, anime, and more. it's a cozy archive for your viewing history, built with react native and supabase.

##  features

- **create records** — log any media with title, cast, release date, type, rating, and your thoughts.
- **browse your archive** — view all your records in a clean feed, search by title, and filter by media type.
- **add cover images** — upload posters or stills from your camera roll.
- **rate and review** — give each record up to 5 stars and leave personal notes.
- **edit or delete** — update any record whenever you want.
- **profile page** — customize your profile with a picture, background, and share your taste (favorite media, genres, director, and a little about your style).
- **auth** — sign in or create an account to keep your archive private and sync across devices.

##  how to use

###  getting started

1. **sign up** — open the app and tap "register" to create an account with your email and nickname.
2. **sign in** — if you already have an account, tap "sign in" to access your archive.

###  your archive (home screen)

the home screen shows all your saved records, newest first.

- **search** — type in the search bar to find a specific record by title.
- **filter** — tap a media type chip (movie, series, anime, etc.) to narrow down the list.
- **view a record** — tap any card to see full details, thoughts, and your rating.

###  adding a new record

tap the big **+** button in the center of the bottom navigation to create a new record.

1. **add a cover image** (optional) — tap the image area to choose a poster from your camera roll
2. **fill in the details**:
   - title (required)
   - cast (optional)
   - release date (optional)
   - media type (choose from the chips)
   - rating (tap stars from 1 to 5)
   - your thoughts (optional — notes, feelings, mini-review)
3. tap **save record** — it will appear in your archive

###  editing a record

- open any record from your archive
- tap **edit record**
- update any field, change the image, or add thoughts
- tap **save changes**

###  deleting a record

- open the record you want to delete
- tap **edit record**
- scroll down and tap **delete record** — confirm to remove it permanently

###  profile

- tap the **profile** icon at the bottom
- see your nickname, profile picture, and taste
- tap **edit profile** to:
  - change your nickname
  - update your profile picture and background image
  - add favorite media, genres, director, and a bio
- tap **save profile** to update
- tap **log out** when you're done

###  navigation

the bottom bar makes it easy to move around:

| tab         |         what it does       |
|-------------|----------------------------|
| **home**    | browse your full archive   |
| **+**       | add a new record           |
| **profile** | view and edit your profile |

##  tech stack

- **react native** + **expo** — cross-platform mobile app
- **supabase** — backend (auth, database, storage)
- **expo-router** — file-based navigation
- **expo-image-picker** — image uploads