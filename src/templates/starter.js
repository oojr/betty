/** @type {import('@webcontainer/api').FileSystemTree} */
export const remotionStarter = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "betty-remotion-project",
          version: "1.0.0",
          scripts: {
            // npm automatically checks node_modules/.bin, so no npx needed
            start: "remotion preview src/index.jsx",
            build: "remotion render src/index.jsx MyVideo out/video.mp4",
          },
          dependencies: {
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            remotion: "4.0.108",
            "@remotion/cli": "4.0.108", // Installs the actual 'remotion' executable
          },
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      "index.jsx": {
        file: {
          contents: `
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
          `.trim(),
        },
      },
      "Root.jsx": {
        file: {
          contents: `
import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
          `.trim(),
        },
      },
      "Composition.jsx": {
        file: {
          contents: `
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = Math.min(1, frame / 20);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 100,
        backgroundColor: 'white',
      }}
    >
      <div style={{ opacity }}>
        Hello World
      </div>
    </AbsoluteFill>
  );
};
          `.trim(),
        },
      },
    },
  },
  ".gitignore": {
    file: {
      contents: `node_modules
.cache
out
`,
    },
  },
};
