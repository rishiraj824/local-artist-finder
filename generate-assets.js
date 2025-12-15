const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "assets");

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create icon.png (1024x1024)
const createIcon = async () => {
  const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad)" rx="180"/>
      <circle cx="512" cy="380" r="180" fill="white" opacity="0.9"/>
      <circle cx="512" cy="380" r="120" fill="none" stroke="white" stroke-width="20" opacity="0.9"/>
      <path d="M 512 380 L 512 260" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.9"/>
      <path d="M 350 640 L 674 640" stroke="white" stroke-width="30" stroke-linecap="round" opacity="0.9"/>
      <path d="M 420 720 L 604 720" stroke="white" stroke-width="30" stroke-linecap="round" opacity="0.9"/>
      <path d="M 460 800 L 564 800" stroke="white" stroke-width="30" stroke-linecap="round" opacity="0.9"/>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(path.join(assetsDir, "icon.png"));

  console.log("✅ Created icon.png");
};

// Create adaptive-icon.png (same as icon)
const createAdaptiveIcon = async () => {
  await sharp(path.join(assetsDir, "icon.png")).toFile(
    path.join(assetsDir, "adaptive-icon.png")
  );

  console.log("✅ Created adaptive-icon.png");
};

// Create splash.png (1284x2778)
const createSplash = async () => {
  const svg = `
    <svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
      <rect width="1284" height="2778" fill="#121212"/>
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="642" cy="1100" r="280" fill="url(#grad2)" opacity="0.3"/>
      <circle cx="642" cy="1100" r="180" fill="url(#grad2)"/>
      <circle cx="642" cy="1100" r="120" fill="none" stroke="white" stroke-width="15" opacity="0.9"/>
      <path d="M 642 1100 L 642 980" stroke="white" stroke-width="15" stroke-linecap="round" opacity="0.9"/>
      <text x="642" y="1500" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Drops</text>
      <text x="642" y="1600" font-family="Arial, sans-serif" font-size="42" fill="#8B5CF6" text-anchor="middle">Find Events Near You</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, "splash.png"));

  console.log("✅ Created splash.png");
};

// Generate all assets
(async () => {
  try {
    console.log("🎨 Generating placeholder assets...\n");
    await createIcon();
    await createAdaptiveIcon();
    await createSplash();
    console.log("\n✨ All assets created successfully!");
    console.log("📁 Check the assets/ folder\n");
  } catch (error) {
    console.error("❌ Error generating assets:", error);
    process.exit(1);
  }
})();
