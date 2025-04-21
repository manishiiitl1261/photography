/**
 * Utility script to verify Cloudinary connection and credentials
 * Run this script to check if your Cloudinary configuration is working properly
 *
 * Usage: node verifyCloudinary.js
 */

require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log("\n=== Cloudinary Configuration Check ===\n");

// Check if all required credentials exist
const credentialsExist = Object.entries(cloudinaryConfig).map(
  ([key, value]) => {
    const exists = !!value;
    console.log(`${key}: ${exists ? "Provided ✓" : "MISSING ✗"}`);
    return exists;
  }
);

if (!credentialsExist.every(Boolean)) {
  console.error(
    "\n❌ ERROR: Missing Cloudinary credentials! Check your .env file.\n"
  );
  process.exit(1);
}

// Configure cloudinary with credentials
cloudinary.config(cloudinaryConfig);

// Function to verify Cloudinary API connection
async function verifyConnection() {
  console.log("\n=== Testing Cloudinary API Connection ===\n");

  try {
    const pingResult = await cloudinary.api.ping();
    console.log("Connection successful:", pingResult);

    const accountInfo = await cloudinary.api.usage();
    console.log("\n=== Account Usage Information ===\n");
    console.log(`Plan: ${accountInfo.plan}`);
    console.log(`Credits used: ${accountInfo.credits.used}`);
    console.log(`Resources: ${accountInfo.resources}`);
    console.log(`Derived resources: ${accountInfo.derived_resources}`);

    return true;
  } catch (error) {
    console.error("\n❌ Cloudinary connection failed:");
    console.error(error.message);
    console.error("\nThis could be due to:");
    console.error("- Invalid credentials in your .env file");
    console.error("- Network connectivity issues");
    console.error("- Cloudinary service disruption");
    return false;
  }
}

// Function to test a sample upload
async function testUpload() {
  console.log("\n=== Testing File Upload ===\n");

  // Create a simple test image if needed
  const testFile = path.join(__dirname, "test-upload.png");
  let fileExists = fs.existsSync(testFile);

  if (!fileExists) {
    try {
      // Use a sample image from the public directory or create a blank one
      const sampleImage = path.join(__dirname, "public/sample.png");

      if (fs.existsSync(sampleImage)) {
        fs.copyFileSync(sampleImage, testFile);
      } else {
        // Simple approach to create a small black PNG
        const simpleImageData = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64"
        );
        fs.writeFileSync(testFile, simpleImageData);
      }

      fileExists = true;
      console.log("Created test image file");
    } catch (error) {
      console.error("Could not create test image:", error.message);
    }
  }

  if (fileExists) {
    try {
      // Upload the test file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(testFile, {
        folder: "test",
        public_id: `test-${Date.now()}`,
      });

      console.log("Upload successful!");
      console.log("Uploaded image URL:", uploadResult.secure_url);

      // Try to delete the test image
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log("Test image successfully deleted");
      } catch (deleteError) {
        console.warn("Could not delete test image:", deleteError.message);
      }

      return true;
    } catch (error) {
      console.error("\n❌ Upload test failed:");
      console.error(error.message);
      console.error("\nThis could be due to:");
      console.error("- Invalid credentials in your .env file");
      console.error("- Network connectivity issues");
      console.error("- Insufficient permissions for your Cloudinary account");
      return false;
    }
  } else {
    console.error("Could not test upload: No test file available");
    return false;
  }
}

// Run the verification
async function runVerification() {
  console.log("Verifying Cloudinary configuration...");

  // First test connection
  const connectionValid = await verifyConnection();

  if (connectionValid) {
    // Then test upload
    const uploadValid = await testUpload();

    if (uploadValid) {
      console.log(
        "\n✅ All tests passed! Your Cloudinary configuration is working correctly.\n"
      );
    } else {
      console.log(
        "\n⚠️ Connection successful, but upload test failed. Check your permissions and upload settings.\n"
      );
      process.exit(1);
    }
  } else {
    console.log(
      "\n❌ Cloudinary connection failed. Fix the issues before proceeding.\n"
    );
    process.exit(1);
  }
}

// Run the verification
runVerification();
