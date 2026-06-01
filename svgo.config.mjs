/** Used by @svgr/webpack to optimize SVGs at import time. */
const config = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox so SVGs scale responsively.
          removeViewBox: false,
          // Don't merge IDs we may need for GSAP targeting.
          cleanupIds: false,
        },
      },
    },
    'removeDimensions',
  ],
};

export default config;
