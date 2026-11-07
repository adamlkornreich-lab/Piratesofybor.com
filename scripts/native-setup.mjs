// Applies the Pirates of Ybor settings to the native projects after `npx cap add ios|android`.
// Safe to run more than once. Codemagic runs it on every build.
//   node scripts/native-setup.mjs            (both platforms that exist)
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEME = "com.raconsulting.piratesofybor";
const STORE = process.env.POY_ANDROID_STORE ?? "google";
const edit = (p, fn) => { const s = readFileSync(p, "utf8"); const t = fn(s); if (t !== s) { writeFileSync(p, t); console.log("updated", p.replace(ROOT + "/", "")); } };

/* ---------- Android ---------- */
const manifest = join(ROOT, "android/app/src/main/AndroidManifest.xml");
if (existsSync(manifest)) {
  edit(manifest, (s) => s.includes(`android:scheme="${SCHEME}"`) ? s : s.replace(
    /(<activity[^>]*MainActivity[\s\S]*?<\/intent-filter>)/,
    `$1
            <!-- Sign-in returns to the app here -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${SCHEME}" android:host="auth-callback" />
            </intent-filter>`));
  const gradle = join(ROOT, "android/app/build.gradle");
  if (STORE === "amazon" && existsSync(gradle)) {
    edit(gradle, (s) => s.includes("purchases-store-amazon") ? s : s.replace(/dependencies\s*\{/, `dependencies {\n    implementation "com.revenuecat.purchases:purchases-store-amazon:8.+"`));
  }
  if (existsSync(gradle)) {
    edit(gradle, (s) => {
      let t = s
        .replace(/versionCode \d+/, 'versionCode((project.findProperty("versionCode") ?: "1") as Integer)')
        .replace(/versionName "[^"]*"/, 'versionName((project.findProperty("versionName") ?: "1.0.0") as String)');
      // Release signing from Codemagic's keystore variables (never stored in the repo).
      if (!t.includes("CM_KEYSTORE_PATH")) {
        t = t.replace(/buildTypes\s*\{/, `signingConfigs {
        release {
            if (System.getenv("CM_KEYSTORE_PATH")) {
                storeFile file(System.getenv("CM_KEYSTORE_PATH"))
                storePassword System.getenv("CM_KEYSTORE_PASSWORD")
                keyAlias System.getenv("CM_KEY_ALIAS")
                keyPassword System.getenv("CM_KEY_PASSWORD")
            }
        }
    }
    buildTypes {`).replace(/(release\s*\{\s*\n\s*minifyEnabled false)/, "$1\n            signingConfig signingConfigs.release");
      }
      return t;
    });
  }
  const vars = join(ROOT, "android/variables.gradle");
  if (existsSync(vars)) edit(vars, (s) => s.replace(/minSdkVersion = \d+/, "minSdkVersion = 23"));
}

/* ---------- iOS ---------- */
const plist = join(ROOT, "ios/App/App/Info.plist");
if (existsSync(plist)) {
  edit(plist, (s) => {
    let t = s;
    if (!t.includes("<string>" + SCHEME + "</string>")) {
      t = t.replace(/<dict>/, `<dict>
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>${SCHEME}</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>${SCHEME}</string>
			</array>
		</dict>
	</array>`);
    }
    if (!t.includes("ITSAppUsesNonExemptEncryption")) t = t.replace(/<dict>/, "<dict>\n\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>");
    t = t.replace(/<string>App<\/string>(\s*<key>CFBundleName)/, "<string>Pirates of Ybor</string>$1");
    return t;
  });
  const ent = join(ROOT, "ios/App/App/App.entitlements");
  writeFileSync(ent, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.applesignin</key>
	<array>
		<string>Default</string>
	</array>
</dict>
</plist>
`);
  const pbx = join(ROOT, "ios/App/App.xcodeproj/project.pbxproj");
  if (existsSync(pbx)) edit(pbx, (s) => s.includes("CODE_SIGN_ENTITLEMENTS") ? s :
    s.replace(/(\n(\s*)PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)/g, "$1\n$2CODE_SIGN_ENTITLEMENTS = App/App.entitlements;"));
}
console.log("native setup done");
