import type { ExpoConfig } from "expo/config";

const appName = "TactiTac";
const appSlug = "tactictac";
const iosBundleId = "space.manus.tactictac";
const androidPackage = "space.manus.tactictac";

const config: ExpoConfig = {
  name: appName,
  slug: appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "tactictac",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: androidPackage,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0A1220",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "27fa4d8e-85fa-478c-8165-3b7748c3f933",
    },
  },
};

export default config;
