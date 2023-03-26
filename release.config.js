module.exports = {
    branches: [
      "+([0-9])?(.{+([0-9]),x}).x",
      "main",
      "next",
      {
        name: "beta",
        prerelease: true,
      },
    ],
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/github",
      [
        "@semantic-release/npm",
        {
          npmPublish: false,
        },
      ],
      "@semantic-release/git",
    ],
  };
  