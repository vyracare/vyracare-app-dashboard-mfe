const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: { uniqueName: "vyracare_app_dashboard_mfe", publicPath: "auto" },
  optimization: { runtimeChunk: false },
  plugins: [
    new ModuleFederationPlugin({
      name: "vyracare_app_dashboard_mfe",
      filename: "remoteEntry.js",
      exposes: {
        './App': './src/app/app.ts'
      },
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};

