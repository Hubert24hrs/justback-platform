# Google Play Store Submission Guide

This guide describes how to submit the JustBack Android app to the Google Play Store.

## 1. Prerequisites
- [Google Play Console](https://play.google.com/console) account (fixed $25 registration fee).
- Final app assets (Icon, Feature Graphic, Screenshots).
- Privacy Policy URL.

## 2. Generate Release Artifacts
We've already configured the app for release signing.
1. Make sure you have the `key.properties` and `.keystore` files (Keep them secure!).
2. Run the build command:
   ```bash
   flutter build appbundle --release
   ```
3. Locate the AAB file at: `build/app/outputs/bundle/release/app-release.aab`

## 3. Create a New App in Play Console
1. Navigate to **All Apps** > **Create app**.
2. Enter app details (Name, Language, Type, Free/Paid).
3. Complete the **Initial setup** tasks (Set privacy policy, app access, content rating).

## 4. Set Up Store Listing
1. Navigate to **Store presence** > **Main store listing**.
2. Add:
   - Short description
   - Full description
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (at least 2 for phone)

## 5. Release to Production
1. Navigate to **Production** > **Create new release**.
2. Upload the `.aab` file.
3. Review and roll out to production.

> [!IMPORTANT]
> The first release usually takes 3-7 days for Google to review.

> [!CAUTION]
> If you lose your `.keystore` file or forget your storePassword, you will NEVER be able to update your app on the Play Store again. Back them up in a secure vault.
