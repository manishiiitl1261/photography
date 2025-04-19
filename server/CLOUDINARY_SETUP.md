# Cloudinary Setup Instructions

This project now uses Cloudinary for storing and serving images. Follow these steps to set up your Cloudinary account and configure the application.

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your Dashboard

## Step 2: Get Your Cloudinary Credentials

From your Cloudinary Dashboard, note down the following details:

- **Cloud Name**: Shown in the "Account Details" section
- **API Key**: Shown in the "Account Details" section
- **API Secret**: Shown in the "Account Details" section

## Step 3: Configure Environment Variables

Update your `.env` file with your Cloudinary credentials:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Restart Your Server

After updating the environment variables, restart your server to apply the changes.

## Benefits of Using Cloudinary

- **Persistent Storage**: Images will remain available even if your server restarts
- **CDN Delivery**: Images are served from Cloudinary's global CDN for faster loading
- **Image Transformations**: Cloudinary can optimize, resize, and transform images on-the-fly
- **Scalability**: No need to worry about disk space on your server

## Notes on Image Migration

- New images will be stored on Cloudinary automatically
- Existing images in the `/uploads` directory will still work but won't be migrated automatically
- As users update their avatars, the new images will be stored on Cloudinary

## Free Tier Limitations

The free tier of Cloudinary includes:

- 25GB of storage
- 25GB of monthly bandwidth
- Basic transformations

This should be sufficient for most small to medium-sized applications.

## Additional Configuration

For advanced configurations and transformations, refer to the [Cloudinary documentation](https://cloudinary.com/documentation). 