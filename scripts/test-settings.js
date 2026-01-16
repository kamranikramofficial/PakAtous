/**
 * Test script to verify all admin settings tabs are working correctly
 */

const testSettings = {
  general: {
    siteName: "PakAutoSe Test",
    siteDescription: "Test description",
    siteEmail: "test@pakautose.com",
    sitePhone: "+92 300 1234567",
    siteAddress: "Test Address, Lahore",
    businessHours: "Mon - Fri: 9:00 AM - 6:00 PM",
    currency: "PKR",
    timezone: "Asia/Karachi",
    maintenanceMode: "false",
    siteLogo: "",
  },
  shipping: {
    freeShippingThreshold: "50000",
    defaultShippingCost: "500",
    expressShippingCost: "1500",
    estimatedDeliveryDays: "3-5",
    enableCOD: "true",
    codFee: "100",
  },
  payment: {
    enableBankTransfer: "true",
    bankName: "Test Bank",
    bankAccountTitle: "Test Account",
    bankAccountNumber: "1234567890",
    bankIBAN: "PK00TEST0000000000000000",
    enableEasypaisa: "true",
    easypaisaNumber: "03001234567",
    enableJazzCash: "true",
    jazzcashNumber: "03001234567",
  },
  email: {
    enableEmailNotifications: "true",
    orderConfirmationEmail: "true",
    orderStatusUpdateEmail: "true",
    welcomeEmail: "true",
    newsletterEmail: "true",
    adminOrderNotificationEmail: "admin@test.com",
  },
  inventory: {
    lowStockThreshold: "5",
    outOfStockBehavior: "hide",
    enableBackorders: "false",
  },
  orders: {
    orderPrefix: "PAK",
    minOrderAmount: "1000",
    maxOrderAmount: "10000000",
    autoConfirmOrders: "false",
    orderCancellationTime: "24",
  },
  seo: {
    metaTitle: "PakAutoSe Test - Generators",
    metaDescription: "Test SEO description",
    googleAnalyticsId: "G-TEST123",
    facebookPixelId: "TEST456",
  },
  social: {
    facebookUrl: "https://facebook.com/test",
    instagramUrl: "https://instagram.com/test",
    twitterUrl: "https://twitter.com/test",
    youtubeUrl: "https://youtube.com/test",
    whatsappNumber: "+92 300 1234567",
  },
};

async function testSettingsAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  
  console.log("🧪 Testing Admin Settings API...\n");

  // Test 1: Fetch current settings (GET)
  console.log("1️⃣ Testing GET /api/admin/settings...");
  try {
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.settings) {
      console.log("✅ GET request successful");
      console.log("   Settings groups:", Object.keys(data.settings).join(", "));
      
      // Verify all expected groups exist
      const expectedGroups = Object.keys(testSettings);
      const actualGroups = Object.keys(data.settings);
      const missingGroups = expectedGroups.filter(g => !actualGroups.includes(g));
      
      if (missingGroups.length > 0) {
        console.log("⚠️  Missing groups:", missingGroups.join(", "));
      } else {
        console.log("✅ All expected groups present");
      }
      
      // Check each group has all expected fields
      console.log("\n📋 Checking fields in each group:");
      for (const [groupName, expectedFields] of Object.entries(testSettings)) {
        const actualFields = data.settings[groupName] || {};
        const expectedKeys = Object.keys(expectedFields);
        const actualKeys = Object.keys(actualFields);
        const missingKeys = expectedKeys.filter(k => !actualKeys.includes(k));
        
        if (missingKeys.length > 0) {
          console.log(`   ⚠️  ${groupName}: Missing fields - ${missingKeys.join(", ")}`);
        } else {
          console.log(`   ✅ ${groupName}: All fields present (${expectedKeys.length} fields)`);
        }
      }
    } else {
      console.log("❌ GET request failed:", response.status, data);
      if (response.status === 401) {
        console.log("\n⚠️  Note: You need to be logged in as ADMIN to test settings API");
        console.log("   This test requires authentication. Please test manually in browser.");
        return;
      }
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("\n✅ Settings API structure test complete!");
  console.log("\n📌 To manually test:");
  console.log("   1. Login as admin");
  console.log("   2. Navigate to /admin/settings");
  console.log("   3. Test each tab (General, Shipping, Payment, etc.)");
  console.log("   4. Make changes and click 'Save'");
  console.log("   5. Refresh page to verify changes persist");
}

// Run the test
testSettingsAPI();
