![WanderWise](https://raw.githubusercontent.com/jgafron/WanderWise2/main/assets/img/wanderwise.png)
# WanderWise

A full-stack travel planning platform that combines Google Maps, Firebase, cloud-hosted AI, and curated destination data to generate personalized travel itineraries.

## Overview

Planning a trip usually means juggling hotels, attractions, restaurants, and transportation across a dozen tabs. WanderWise pulls that into one place, guiding users through destination planning, activity selection, and AI-powered itinerary generation in a single flow.

Users pick where they're staying, set their travel dates and interests, and get back a personalized day-by-day itinerary they can regenerate, save to their account, and export as a PDF.

## Features

- AI-generated travel itineraries
- Google Maps Places Autocomplete for hotel selection
- Interactive map preview
- Secure Google authentication
- Save and manage trips with Firebase
- Browse attractions and restaurants
- Regenerate itinerary variations
- Export itineraries as PDF

## How It Works

1. Sign in with Google.
2. Select your hotel or Airbnb using Google Maps.
3. Choose your travel dates.
4. Browse attractions and restaurants.
5. Generate an AI-powered itinerary.
6. Save, manage, or export your trip.

## Technology Stack

**Frontend**
Flask (Jinja2 Templates), HTML/CSS/JavaScript, Bootstrap, jQuery

**Backend**
Flask, Firebase Authentication, Firestore, Google Cloud Functions

**APIs & Services**
Google Maps Places API, Atlas Obscura API, Docker

## Technical Highlights

- Service-oriented architecture, with separate Flask applications handling the web interface and attraction data separately
- Cloud-hosted AI itinerary generation through Google Cloud Functions
- Firebase Authentication with persistent user accounts
- Firestore-backed trip storage and management
- Google Maps Places integration with location validation and map preview
- Dockerized for consistent development and hosting environments

## Running Locally

```bash
git clone <repository>
pip install -r requirements.txt
python app.py
```

Configure the following environment variables:

FIREBASE_API_KEY=
GOOGLE_MAPS_API_KEY=
FLASK_ENV=
PORT=


## Future Improvements

- Mobile-responsive redesign
- Live production deployment
- Additional travel recommendation providers
- Collaborative trip planning
- Expanded itinerary customization

## License

This project is available for educational and portfolio purposes.
