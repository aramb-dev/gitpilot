module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
            browsers: [">0.2%", "not dead", "not op_mini all"]
          },
          useBuiltIns: "usage",
          corejs: 3
        }
      ],
      ["@babel/preset-react", {
        runtime: "automatic"
      }],
      "@babel/preset-typescript"
    ],
    plugins: [
      ["@babel/plugin-transform-runtime", {
        regenerator: true
      }],
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@common": "./src/components/common",
            "@layout": "./src/components/layout",
            "@features": "./src/components/features",
            "@pages": "./src/pages",
            "@hooks": "./src/hooks",
            "@services": "./src/services",
            "@store": "./src/store",
            "@utils": "./src/utils",
            "@styles": "./src/styles",
            "@assets": "./src/assets",
            "@types": "./src/types"
          }
        }
      ]
    ],
    env: {
      test: {
        plugins: ["@babel/plugin-transform-modules-commonjs"]
      },
      production: {
        plugins: [
          ["transform-remove-console", { exclude: ["error", "warn"] }]
        ]
      }
    }
  };
