#!/usr/bin/env node

const colors = {
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

log("🧹 FlexGen.ai Browser Cache Clearing Instructions", "bold");
log("=" + "=".repeat(60), "blue");

log("\n🎯 Problem: Seeing old IOC data from 2023?", "yellow");
log("This is likely due to browser caching or local storage.", "yellow");

log("\n📋 Step-by-Step Cache Clearing:", "blue");
log("1. 🌐 Clear Browser Cache:", "green");
log("   • Chrome/Edge: Press Ctrl+Shift+Delete", "green");
log("   • Firefox: Press Ctrl+Shift+Delete", "green");
log("   • Safari: Press Cmd+Option+E", "green");
log('   • Select "All time" and clear everything', "green");

log("\n2. 🗂️ Clear Local Storage:", "green");
log("   • Open Developer Tools (F12)", "green");
log("   • Go to Application/Storage tab", "green");
log('   • Click "Local Storage" → Clear all', "green");
log('   • Click "Session Storage" → Clear all', "green");

log("\n3. 🔄 Hard Refresh:", "green");
log("   • Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)", "green");
log("   • This bypasses cache completely", "green");

log("\n4. 🚫 Disable Cache (Development):", "green");
log("   • Open Developer Tools (F12)", "green");
log("   • Go to Network tab", "green");
log('   • Check "Disable cache" checkbox', "green");
log("   • Keep DevTools open while browsing", "green");

log("\n💡 Quick Fix Commands:", "blue");
log("Run these in browser console (F12 → Console):", "blue");
log("   localStorage.clear();", "yellow");
log("   sessionStorage.clear();", "yellow");
log("   location.reload(true);", "yellow");

log("\n🔍 Verify Fresh Data:", "green");
log("After clearing cache, you should see:", "green");
log("• ✅ IOCs from 2025 (current year)", "green");
log("• ✅ Sources: OpenPhish, CISA KEV, Blocklist.de, etc.", "green");
log("• ✅ No data from 2023/2024", "green");

log("\n⚠️ If Still Seeing Old Data:", "red");
log("1. Check if you're using localhost:3000 (local) vs Vercel URL", "red");
log("2. Ensure backend is running: npm run dev", "red");
log("3. Try incognito/private browsing mode", "red");
log("4. Check console for API errors", "red");

log("\n🎉 Expected Current Data:", "bold");
log("• Total IOCs: ~70 fresh indicators", "green");
log("• Sources: OpenPhish (20), CISA KEV (20), Blocklist.de (15)", "green");
log("• All data from 2025-05-29 (today)", "green");
log("• No 185.176.43.94 with 2023 dates", "green");
