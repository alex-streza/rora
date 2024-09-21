![3x shots so 2 (1)](https://github.com/user-attachments/assets/1e998134-a075-4434-abda-ee3b00662b6f)

## Think/Imagine/Optimize

Seeing the extremely evasive northern lights has gotten a lot prettier (and easier)

https://orora-x.vercel.app

> **Note**
>
> This project is optimized for mobile devices, everything works aokay on desktop it's just not responsive

<sup>Made for Supabase Launch Week 12 Hackathon.</sup>

Built with

- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Next.JS](https://nextjs.org/)
- [Mapbox]([https://ui.shadcn.com/](https://www.mapbox.com/))
- [Clerk](https://clerk.com/)
- [swpc.noaa API](https://services.swpc.noaa.gov)
- [open-meteo API](https://api.open-meteo.com)
- [nominatim](https://nominatim.openstreetmap.org)
- [create-t3-app]([https://create.t3.gg/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [framer-motion](https://www.framer.com/motion/)

## How it works

> **Danger**
>
> Spoilers ahead, maybe try the app first!
>
> Let me first present how it works followed by some of the its inner workings since the UI isn't the only thing that's exceptional.

Orora let's you view community submitted northern lights sightings, real-time stats & the live aurora oval

1. Create an account with Google
2. Ideally enable location for cloud coverage
3. Zoom-out to see the aurora oval
4. Zoom in to see submissions around you
5. Submit your own and rinse and repeat!

It uses a custom Mapbox style that matches the overall color scheme. All submissions are stored in Supabase Database. Users are created using clerk and synced into Supabase via a custom webhook.

By zooming out and looking to the north and south of the globe you'll see the aurora oval, the area where the aurora is visible (if it's not cloudy). The brighter the color the more powerful the aurora at that spot.

All over the map you'll see image markers, they northern lights sightings which can be viewed as well as distance to them.

Every 15 minutes there's a Supabase pg cron job that updates the aurora oval geojson by sending a post request to a Supabase Edge Function that then updates the geojson stored in a Supabase Storage bucket.

You can have a better experience by pressing the can i see the aurora button, which will then attempt to interpret the realtime stats.

List of Supabase features used:

- Database
  - storing users, submissions
- Storage
  - storing aurora images, forecast geojson
- Edge Functions
  - function that uploads the new geojson to Storage
- Cron
  - update forecast geojson every 15 minutes
- Net
  - trigger edge function to update geojson
- Local/Docker (don't think it counts)
  - test locally edge functions

## Motivation

9 months ago me and catalina went to Iceland to see the northern lights, unfortunately we didn't have much knowledge about what those markers meant and despite the cloud coverage we still went and tried to see it, which was a somewhat costly decision. For a new season of trying to find the northern lights we wanted to build our own tool to better our chances. We're aware of some competitors (actual mobile apps) that are rather feature rich but we wanted to make a beautiful app that the superb northern lights actually deserve

## Ideas for the future

- Take photo on the spot instead of upload
- Validate the submitted image
- Improve map UI
- Use more Supabase because it's supa'awesome

## The team / contributors

- alex-streza ([GitHub](https://github.com/alex-streza), [X](https://x.com/alex_streza))
- catalina ([GitHub](https://github.com/welnic), [X](https://x.com/Catalina_Melnic)

## Thanks to

- [cata](https://twitter.com/Catalina_Melnic) for being my main source of inspiration for the app, configuring Supabase locally and edge function
