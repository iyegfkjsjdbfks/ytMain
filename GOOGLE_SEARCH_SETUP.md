# Google Custom Search API Setup Guide

This guide will help you set up the Google Custom Search API to enable YouTube video search functionality in the application.

## Prerequisites

- Google Cloud Console account
- Google Custom Search Engine (CSE) account

## Step 1: Get Google Custom Search API Key

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Optional) Restrict the API key to only Custom Search API for security

## Step 2: Create Custom Search Engine

1. Go to [Google Custom Search Engine](https://cse.google.com/)
2. Click "Add" to create a new search engine
3. Configure your search engine:
   - **Sites to search**: Enter `youtube.com/*`
   - **Language**: Select your preferred language
   - **Name**: Give it a descriptive name like "YouTube Video Search"
4. Click "Create"
5. After creation, click "Control Panel" for your search engine
6. Go to "Setup" > "Basics"
7. Copy the **Search engine ID** (it looks like: `012345678901234567890:abcdefghijk`)

## Step 3: Configure Search Engine for YouTube

1. In your Custom Search Engine control panel:
2. Go to "Setup" > "Advanced"
3. Enable "Image search" and "Safe search" as needed
4. Go to "Setup" > "Sites"
5. Make sure `youtube.com/*` is listed
6. You can also add specific YouTube paths like:
   - `youtube.com/watch*`
   - `youtube.com/results*`

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   VITE_GOOGLE_SEARCH_API_KEY=your_actual_api_key_here
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_actual_search_engine_id_here
   ```

## Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev:client-only
   ```

2. Navigate to the search page
3. Enter a search query
4. You should see both local videos and YouTube videos in the results

## Troubleshooting

### Common Issues

1. **"API key not valid" error**:
   - Verify your API key is correct
   - Make sure Custom Search API is enabled in Google Cloud Console
   - Check if API key restrictions are properly configured

2. **"Invalid search engine ID" error**:
   - Verify your search engine ID is correct
   - Make sure the search engine is active

3. **No YouTube results**:
   - Check if your Custom Search Engine is configured to search `youtube.com`
   - Verify the search engine is set to search the entire web or specific sites

4. **Rate limiting errors**:
   - Google Custom Search API has usage limits
   - Free tier: 100 queries per day
   - Consider upgrading to paid tier for higher limits

### API Limits

- **Free tier**: 100 search queries per day
- **Paid tier**: Up to 10,000 queries per day (additional charges apply)
- Rate limit: 10 queries per second

### Security Best Practices

1. **Restrict API Key**:
   - Go to Google Cloud Console > Credentials
   - Edit your API key
   - Add HTTP referrer restrictions (e.g., `localhost:*`, `yourdomain.com/*`)
   - Restrict to Custom Search API only

2. **Environment Variables**:
   - Never commit `.env.local` to version control
   - Use different API keys for development and production
   - Regularly rotate API keys

## Features Enabled

Once configured, the following features will be available:

- ✅ Search YouTube videos alongside local videos
- ✅ Embedded YouTube player with iframe API
- ✅ Playable videos within the application
- ✅ YouTube video metadata (title, channel, description)
- ✅ Thumbnail previews
- ✅ Separate tabs for local vs YouTube results
- ✅ Combined search results view

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API credentials are correct
3. Ensure your Custom Search Engine is properly configured
4. Check the Google Cloud Console for API usage and errors

For more information, refer to:
- [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [YouTube IFrame Player API Documentation](https://developers.google.com/youtube/iframe_api_reference)