# Database Seeding Instructions

This document explains how to seed your database with initial service and pricing data.

## Overview

We've created a script to migrate static data from the frontend helper files into the database. This helps transition from static data sources to a dynamic database-driven approach.

## Running the Seed Script

To populate your database with the initial service and pricing data:

1. Make sure MongoDB is running and your `.env` file contains the correct `MONGODB_URI` connection string
2. Open a terminal in the server directory
3. Run the following command:

```bash
node seed-services-pricing.js
```

## What the Script Does

The seed script performs the following actions:

1. Connects to your MongoDB database
2. Removes any existing services and pricing packages (to avoid duplicates)
3. Seeds the database with:
   - 6 photography service items
   - 6 standard pricing packages
   - 3 wedding pricing packages
   - Advanced pricing data in the newer pricing model format

## After Running the Script

After successfully running the script, you should see:
- The data in your MongoDB database
- The frontend components will now display data from the database instead of static files
- Both user views and admin views will use the database data

## Troubleshooting

If you encounter any issues:

- Check that MongoDB is running
- Verify your MongoDB connection string in the `.env` file
- Ensure you're running the script from the server directory
- Check the console for error messages that may indicate specific problems

## Manual Data Modifications

If you need to modify the data after seeding:
- Use the admin dashboard to add, edit, or delete services and pricing packages
- Or modify the seed-services-pricing.js file with your desired data and run it again 