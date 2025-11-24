# App Assets Guide

You need to create 3 image files in the `assets/` folder before building your app.

## Required Files

### 1. icon.png (1024x1024px)
- Main app icon shown on home screen
- Should be a square image
- No transparency
- PNG format

**Design tips:**
- Use your brand colors: Purple (#8B5CF6) and Pink (#EC4899)
- Keep it simple - needs to be recognizable at 60x60px
- Avoid small text or fine details
- Consider using a music note, location pin, or abstract design

### 2. adaptive-icon.png (1024x1024px)
- Android adaptive icon (can be the same as icon.png)
- Center 2/3 will always be visible
- Outer 1/3 may be cropped depending on device
- PNG format with transparency OK

### 3. splash.png (1284x2778px)
- Shown while app is loading
- Background color: #121212 (dark)
- Should include your logo/icon centered
- PNG format

## Quick Generation Options

### Option 1: Use Figma (Free)
1. Go to figma.com
2. Create a new file
3. Create 1024x1024 frame for icon
4. Create 1284x2778 frame for splash
5. Design and export as PNG

### Option 2: Use Canva (Free)
1. Go to canva.com
2. Create custom size: 1024x1024
3. Design your icon
4. Download as PNG
5. Repeat for splash screen

### Option 3: AI Generation
Use an AI tool like:
- DALL-E: https://openai.com/dall-e-2
- Midjourney: https://midjourney.com
- Stable Diffusion

Prompt example:
"App icon for music event discovery app, purple and pink gradient, modern minimal design, music notes, location pin, 1024x1024"

### Option 4: Hire a Designer
- Fiverr: $5-50
- Upwork: $50-500
- 99designs: $299+

## Design Ideas

### Simple Icon Ideas:
1. **Music Note + Location Pin** - Combines music and location
2. **Waveform Circle** - Sound wave in circular shape
3. **Stylized "LA"** - Letters with music/location elements
4. **Gradient Sphere** - Abstract purple-to-pink gradient ball
5. **Headphones + Pin** - Headphones with location marker

### Color Palette:
- Primary: #8B5CF6 (Purple)
- Secondary: #EC4899 (Pink)
- Accent: #3B82F6 (Blue)
- Background: #121212 (Black)
- Text: #FFFFFF (White)

## Example Commands to Generate with Expo

If you create just the icon.png, Expo can generate other sizes:

```bash
# Install expo-cli if needed
npm install -g expo-cli

# This generates adaptive icons automatically during build
eas build --platform all
```

## Placeholder Assets

For testing only, you can create simple placeholder images:

### Quick Placeholder (using ImageMagick):
```bash
# Install ImageMagick first: brew install imagemagick

# Create icon.png
convert -size 1024x1024 xc:#8B5CF6 -gravity center -pointsize 200 -fill white -annotate +0+0 'LA' assets/icon.png

# Create adaptive-icon.png (same as icon)
cp assets/icon.png assets/adaptive-icon.png

# Create splash.png
convert -size 1284x2778 xc:#121212 -gravity center -pointsize 300 -fill #8B5CF6 -annotate +0+0 'Local Artist Finder' assets/splash.png
```

### Or use online generators:
- https://www.appicon.co/
- https://easyappicon.com/
- https://makeappicon.com/

## Validation

Before building, check:
- [ ] All 3 files exist in assets/ folder
- [ ] Files are named exactly: icon.png, adaptive-icon.png, splash.png
- [ ] icon.png is 1024x1024px
- [ ] adaptive-icon.png is 1024x1024px
- [ ] splash.png is 1284x2778px (or larger)
- [ ] Images look good on dark backgrounds
- [ ] Icon is visible at small sizes (test at 60x60)

## Next Steps

Once you have your assets:
1. Place them in the `assets/` folder
2. Run `eas build:configure`
3. Build your app with `eas build --platform all`

For the full publishing process, see PUBLISHING_GUIDE.md
