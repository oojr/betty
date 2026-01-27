/** @type {import('@webcontainer/api').FileSystemTree} */
export const expoStarter = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "bolt-expo-starter",
          main: "expo-router/entry",
          version: "1.0.0",
          private: true,
          scripts: {
            dev: "expo start",
            "build:web": "expo export --platform web",
            lint: "expo lint",
            start: "expo start --web" 
          },
          dependencies: {
            "@expo/vector-icons": "^14.0.2",
            "@react-navigation/bottom-tabs": "^7.2.0",
            "@react-navigation/native": "^7.0.14",
            "expo": "52.0.33",
            "expo-blur": "~14.0.3",
            "expo-constants": "~17.0.5",
            "expo-font": "~13.0.3",
            "expo-haptics": "~14.0.1",
            "expo-linear-gradient": "~14.0.2",
            "expo-linking": "~7.0.5",
            "expo-router": "~4.0.17",
            "expo-splash-screen": "~0.29.21",
            "expo-status-bar": "~2.0.1",
            "expo-symbols": "~0.2.2",
            "expo-system-ui": "~4.0.7",
            "expo-web-browser": "~14.0.2",
            "react": "18.3.1",
            "react-dom": "18.3.1",
            "react-native": "0.76.6",
            "react-native-gesture-handler": "~2.23.0",
            "react-native-reanimated": "~3.16.7",
            "react-native-safe-area-context": "4.12.0",
            "react-native-screens": "~4.4.0",
            "react-native-url-polyfill": "^2.0.0",
            "react-native-web": "~0.19.13",
            "react-native-webview": "13.12.5"
          },
          devDependencies: {
            "@babel/core": "^7.25.2",
            "@types/react": "~18.3.12",
            "typescript": "^5.3.3"
          }
        },
        null,
        2
      )
    }
  },
  "app.json": {
    file: {
      contents: JSON.stringify(
        {
          expo: {
            name: "BettyMobile",
            slug: "betty-mobile",
            version: "1.0.0",
            orientation: "portrait",
            icon: "./assets/images/icon.png",
            scheme: "myapp",
            userInterfaceStyle: "automatic",
            newArchEnabled: true,
            ios: {
              supportsTablet: true
            },
            web: {
              bundler: "metro",
              output: "static",
              favicon: "./assets/images/favicon.png"
            },
            plugins: ["expo-router"],
            experiments: {
              typedRoutes: true
            }
          }
        },
        null,
        2
      )
    }
  },
  "tsconfig.json": {
    file: {
      contents: JSON.stringify(
        {
          extends: "expo/tsconfig.base",
          compilerOptions: {
            strict: true,
            paths: {
              "@/*": ["./*"]
            }
          },
          include: [
            "**/*.ts",
            "**/*.tsx",
            ".expo/types/**/*.ts",
            "expo-env.d.ts"
          ]
        },
        null,
        2
      )
    }
  },
  ".gitignore": {
    file: {
      contents: `node_modules
.expo
.web
dist
`
    }
  },
  "app": {
    directory: {
      "_layout.tsx": {
        file: {
          contents: `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}`
        }
      },
      "index.tsx": {
        file: {
          contents: `import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Expo</Text>
        <Text style={styles.subtitle}>Built with Expo Router & SDK 52</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 File-based Routing</Text>
          <Text style={styles.cardText}>
            Using Expo Router for seamless navigation across platforms
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Universal Platform</Text>
          <Text style={styles.cardText}>
            Works on iOS, Android, and Web with a single codebase
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Modern Stack</Text>
          <Text style={styles.cardText}>
            React 18, TypeScript support, and latest Expo features
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => alert('Ready to build something amazing!')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    gap: 16,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#ca8a04',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});`
        }
      },
      "+not-found.tsx": {
        file: {
          contents: `import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#ca8a04',
    fontSize: 16,
  },
});`
        }
      }
    }
  },
  "assets": {
    directory: {
      "images": {
        directory: {
          "icon.png": { file: { contents: "" } },
          "favicon.png": { file: { contents: "" } }
        }
      }
    }
  }
};