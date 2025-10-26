# IndiePortalv2

IndiePortalv2 is a web application designed to serve as a centralized platform for independent artists to showcase their work and connect with their audience. The app provides a user-friendly interface for both creators and fans, offering a variety of features to enhance the experience for both parties.

## Overview

- **Framework** - Next.js 13
- **Language** - TypeScript
- **Auth** - Supabase
- **Database** - PostgresQL
- **Deployment** - Vercel
- **Styling** - Emotion
- **Components** - Material UI
- **Analytics** - Vercel Analytics
- **Linting** - ESLint
- **Formatting** - Prettier

## Key Features

* **Interactive Galleries**: Users can explore interactive game galleries to discover new artists and their works.
* **Search Option**: A powerful search functionality allows users to quickly find games by title making it easy to discover new favorites.
* **Rating System**: Games can be rated by users, allowing the community to identify highly recommended titles and provide feedback to developers.
* **Community Interaction**: Users can engage with creators and other fans through comments, likes.
* **Game Recommendation System**: Based on user preferences, the platform can recommend personalized game suggestions to users, enhancing their gaming experience.
* **Customizable Profiles**: Users can customize their profiles with bio, profile picture, birth date, and other relevant information.
* **User Authentication**: Secure authentication powered by Supabase ensures a safe and personalized experience for users.

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a `.env.local` file in the root of the project and add your Supabase credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `.next` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run start`

Starts the application in production mode. The application should be built first.

### `npm run lint`

Runs the linter to catch errors in the code.

## Project Structure

```
.
├── components
├── pages
├── public
├── redux
├── styles
├── types
└── utility
```

* **components**: Contains all the reusable React components.
* **pages**: Contains the Next.js pages for the application.
* **public**: Contains static assets like images and fonts.
* **redux**: Contains the Redux store, slices, and types.
* **styles**: Contains the global styles and theme configuration.
* **types**: Contains the TypeScript type definitions.
* **utility**: Contains utility functions and the Supabase client.


## Deployment

The deployment of the IndiePortal web application is handled through Vercel, providing a seamless and efficient process for hosting and managing the application.

https://indie-portalv2.vercel.app/

## Presentation (Screenshots) !UPCOMING
