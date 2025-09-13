const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: { uniqueName: "vyracare-app-dashboard-mfe", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      name: "vyracare-app-dashboard-mfe",
      filename: "remoteEntry.js",
      exposes: {
        './App': './src/app/app.ts'
      },
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};

